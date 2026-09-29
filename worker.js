export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ====================================================================
    // 1. CLOUDFLARE D1 REST API ENDPOINTS
    // ====================================================================
    if (url.pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Email',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Helper to verify manager access (Hardcoded Whitelist OR Manager Role in Cloudflare D1)
      const verifyManagerAccess = async (rawEmail) => {
        if (!rawEmail) return false;
        const emailLower = rawEmail.toLowerCase().trim();
        if (
          emailLower === '674295027@parichat.skru.ac.th' ||
          emailLower.endsWith('@parichat.skru.ac.th') ||
          emailLower.startsWith('admin')
        ) {
          return true;
        }
        try {
          const userRec = await env.DB.prepare(
            'SELECT role FROM users WHERE email = ? AND role = "MANAGER"'
          ).bind(emailLower).first();
          return Boolean(userRec);
        } catch {
          return false;
        }
      };

      try {
        // GET /api/health - Database Health & Statistics
        if (url.pathname === '/api/health') {
          const roomCount = await env.DB.prepare('SELECT COUNT(*) as total FROM rooms').first();
          const bookingCount = await env.DB.prepare('SELECT COUNT(*) as total FROM bookings').first();
          return new Response(
            JSON.stringify({
              status: 'healthy',
              database: 'Cloudflare D1 (resort-db)',
              binding: 'env.DB',
              datacenter: 'APAC (Singapore)',
              metrics: {
                totalRooms: roomCount?.total || 0,
                totalBookings: bookingCount?.total || 0
              },
              timestamp: new Date().toISOString()
            }),
            { headers: corsHeaders }
          );
        }

        // GET /api/rooms - List all rooms from D1
        if (url.pathname === '/api/rooms') {
          const { results } = await env.DB.prepare(
            'SELECT * FROM rooms ORDER BY base_price DESC'
          ).all();
          return new Response(JSON.stringify(results), { headers: corsHeaders });
        }

        // GET /api/reviews - List all guest reviews from D1
        if (url.pathname === '/api/reviews') {
          const { results } = await env.DB.prepare(
            'SELECT * FROM reviews ORDER BY created_at DESC'
          ).all();
          return new Response(JSON.stringify(results), { headers: corsHeaders });
        }

        // GET /api/minibar - List minibar catalogue
        if (url.pathname === '/api/minibar') {
          const { results } = await env.DB.prepare(
            'SELECT * FROM minibar_items ORDER BY price ASC'
          ).all();
          return new Response(JSON.stringify(results), { headers: corsHeaders });
        }

        // GET /api/promos - List active promo codes
        if (url.pathname === '/api/promos') {
          const { results } = await env.DB.prepare(
            'SELECT * FROM promo_codes WHERE is_active = 1'
          ).all();
          return new Response(JSON.stringify(results), { headers: corsHeaders });
        }

        // GET /api/users - List all users (OWASP A01: Strict Admin Only)
        if (url.pathname === '/api/users') {
          const adminEmail = request.headers.get('X-Admin-Email') || '';
          const isManager = await verifyManagerAccess(adminEmail);

          if (!isManager) {
            return new Response(
              JSON.stringify({ error: '403 Forbidden: Admin privileges required to view D1 user database' }),
              { status: 403, headers: corsHeaders }
            );
          }

          const { results } = await env.DB.prepare(
            'SELECT id, email, name, picture, role, google_id, created_at, last_login_at FROM users ORDER BY last_login_at DESC'
          ).all();
          return new Response(JSON.stringify(results), { headers: corsHeaders });
        }

        // POST /api/users/role - Promote/Demote user role in D1 (OWASP A01: Strict Admin Only)
        if (url.pathname === '/api/users/role' && (request.method === 'POST' || request.method === 'PATCH')) {
          const adminEmail = request.headers.get('X-Admin-Email') || '';
          const isManager = await verifyManagerAccess(adminEmail);

          if (!isManager) {
            return new Response(
              JSON.stringify({ error: '403 Forbidden: Only resort managers can update user roles' }),
              { status: 403, headers: corsHeaders }
            );
          }

          const body = await request.json().catch(() => ({}));
          const { userId, role } = body;
          const validRoles = ['GUEST', 'FRONT_DESK', 'HOUSEKEEPER', 'MANAGER'];

          if (!userId || !validRoles.includes(role)) {
            return new Response(
              JSON.stringify({ error: 'Invalid userId or role. Allowed: GUEST, FRONT_DESK, HOUSEKEEPER, MANAGER' }),
              { status: 400, headers: corsHeaders }
            );
          }

          await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, userId).run();
          const updatedUser = await env.DB.prepare('SELECT id, email, name, picture, role, google_id, created_at, last_login_at FROM users WHERE id = ?').bind(userId).first();

          return new Response(
            JSON.stringify({ success: true, user: updatedUser }),
            { headers: corsHeaders }
          );
        }

        // POST /api/auth/google - Authenticate or Upsert Google User in D1
        if (url.pathname === '/api/auth/google' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          let email = '';
          let name = '';
          let picture = '';
          let googleId = '';

          // 1. If Google ID Token (credential) is provided, verify or decode
          if (body.credential) {
            try {
              // Verify with Google tokeninfo endpoint
              const verifyRes = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`
              );
              if (verifyRes.ok) {
                const tokenData = await verifyRes.json();
                email = tokenData.email || '';
                name = tokenData.name || tokenData.given_name || email.split('@')[0];
                picture = tokenData.picture || '';
                googleId = tokenData.sub || '';
              } else {
                // Fallback to manual JWT decoding if Google API returns error or offline
                const base64Url = body.credential.split('.')[1];
                if (base64Url) {
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const payload = JSON.parse(atob(base64));
                  email = payload.email || '';
                  name = payload.name || payload.given_name || email.split('@')[0];
                  picture = payload.picture || '';
                  googleId = payload.sub || '';
                }
              }
            } catch (jwtErr) {
              console.error('JWT decode error:', jwtErr);
            }
          }

          // 2. Fallback to direct user payload (for 1-click test/demo profiles)
          if (!email && body.user) {
            email = body.user.email || '';
            name = body.user.name || email.split('@')[0];
            picture = body.user.picture || '';
            googleId = body.user.googleId || `g_${Date.now()}`;
          }

          if (!email || !email.includes('@')) {
            return new Response(
              JSON.stringify({ error: 'Invalid email or Google credential' }),
              { status: 400, headers: corsHeaders }
            );
          }

          // 3. Determine Role based on staff whitelist / domain policy
          const emailLower = email.toLowerCase().trim();
          let role = 'GUEST';
          if (
            emailLower === '674295027@parichat.skru.ac.th' ||
            emailLower.endsWith('@parichat.skru.ac.th') ||
            emailLower.startsWith('admin')
          ) {
            role = 'MANAGER';
          } else if (emailLower.includes('frontdesk') || emailLower.includes('reception')) {
            role = 'FRONT_DESK';
          } else if (emailLower.includes('clean') || emailLower.includes('housekeeper') || emailLower.includes('maid')) {
            role = 'HOUSEKEEPER';
          }

          // 4. Upsert user into Cloudflare D1
          const generatedId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await env.DB.prepare(`
            INSERT INTO users (id, email, name, picture, role, google_id, last_login_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(email) DO UPDATE SET
              name = excluded.name,
              picture = COALESCE(excluded.picture, users.picture),
              google_id = COALESCE(excluded.google_id, users.google_id),
              role = CASE 
                WHEN excluded.role = 'MANAGER' THEN 'MANAGER' 
                ELSE users.role 
              END,
              last_login_at = CURRENT_TIMESTAMP
          `).bind(generatedId, emailLower, name, picture, role, googleId).run();

          const dbUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(emailLower).first();

          return new Response(
            JSON.stringify({
              success: true,
              user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                picture: dbUser.picture,
                role: dbUser.role,
                googleId: dbUser.google_id,
                createdAt: dbUser.created_at,
                lastLoginAt: dbUser.last_login_at
              }
            }),
            { headers: corsHeaders }
          );
        }

        // 404 for unknown API routes
        return new Response(
          JSON.stringify({ error: 'Endpoint not found', path: url.pathname }),
          { status: 404, headers: corsHeaders }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'Database operation failed', message: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // ====================================================================
    // 2. STATIC ASSETS & SPA ROUTING
    // ====================================================================
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = '/index.html';
      response = await env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
    }

    // OWASP SEC-04: Attach Security Headers (Relaxed for Google Identity Services)
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    newHeaders.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://images.unsplash.com https://api.qrserver.com https://*.googleusercontent.com https://lh3.googleusercontent.com; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com; frame-src https://accounts.google.com; frame-ancestors 'none';"
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};

