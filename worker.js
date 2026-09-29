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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

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

    // OWASP SEC-04: Attach Security Headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    newHeaders.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://images.unsplash.com https://api.qrserver.com; connect-src 'self'; frame-ancestors 'none';"
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
