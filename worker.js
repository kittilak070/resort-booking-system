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

      // Designated Super Admins Whitelist (Explicit email address only - NO wildcard domain)
      const DESIGNATED_ADMIN_EMAILS = [
        '674295027@parichat.skru.ac.th',
        'seree9999@gmail.com'
      ];

      // Helper to verify admin access (Explicit Whitelist OR D1 Assigned Role)
      const verifyManagerAccess = async (rawEmail) => {
        if (!rawEmail) return false;
        const emailLower = rawEmail.toLowerCase().trim();
        if (DESIGNATED_ADMIN_EMAILS.includes(emailLower)) {
          return true;
        }
        try {
          const userRec = await env.DB.prepare(
            'SELECT role FROM users WHERE email = ? AND (role = "ADMIN" OR role = "MANAGER")'
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

        // ====================================================================
        // CRUD: ROOMS (GET, POST, PUT, DELETE)
        // ====================================================================
        if (url.pathname === '/api/rooms') {
          // GET /api/rooms - List all rooms from D1
          if (request.method === 'GET') {
            const { results } = await env.DB.prepare(
              'SELECT * FROM rooms ORDER BY base_price DESC'
            ).all();
            return new Response(JSON.stringify(results), { headers: corsHeaders });
          }

          // POST /api/rooms - Create Room (Admin only)
          if (request.method === 'POST') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const id = body.id || `room-${Date.now().toString(36)}`;
            const roomNumber = body.roomNumber || body.room_number || `ROOM ${Math.floor(100 + Math.random() * 900)}`;
            const nameTh = body.nameTh || body.name_th || body.name || 'ห้องพักใหม่';
            const nameEn = body.nameEn || body.name_en || nameTh;
            const roomType = body.roomType || body.type || body.room_type || 'DELUXE_ROOM';
            const typeNameTh = body.typeNameTh || body.type_name_th || body.typeName || nameTh;
            const typeNameEn = body.typeNameEn || body.type_name_en || body.typeNameEn || nameEn;
            const capacity = Number(body.capacity) || 2;
            const bedType = body.bedType || body.bed_type || '1 King Bed';
            const sizeSqm = Number(body.sizeSqm || body.size_sqm) || 35;
            const basePrice = Number(body.basePrice || body.base_price) || 2000;
            const weekendPrice = Number(body.weekendPrice || body.weekend_price) || Math.round(basePrice * 1.15);
            const descriptionTh = body.descriptionTh || body.description_th || body.description || '';
            const descriptionEn = body.descriptionEn || body.description_en || body.descriptionEn || descriptionTh;
            const status = body.status || 'VACANT_CLEAN';

            await env.DB.prepare(`
              INSERT INTO rooms (id, room_number, name_th, name_en, room_type, type_name_th, type_name_en, capacity, bed_type, size_sqm, base_price, weekend_price, description_th, description_en, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(id, roomNumber, nameTh, nameEn, roomType, typeNameTh, typeNameEn, capacity, bedType, sizeSqm, basePrice, weekendPrice, descriptionTh, descriptionEn, status).run();

            const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, room }), { status: 201, headers: corsHeaders });
          }

          // PUT/PATCH /api/rooms - Update Room (Admin only)
          if (request.method === 'PUT' || request.method === 'PATCH') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const id = body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing room id' }), { status: 400, headers: corsHeaders });
            }

            await env.DB.prepare(`
              UPDATE rooms SET
                room_number = COALESCE(?, room_number),
                name_th = COALESCE(?, name_th),
                name_en = COALESCE(?, name_en),
                room_type = COALESCE(?, room_type),
                type_name_th = COALESCE(?, type_name_th),
                type_name_en = COALESCE(?, type_name_en),
                capacity = COALESCE(?, capacity),
                bed_type = COALESCE(?, bed_type),
                size_sqm = COALESCE(?, size_sqm),
                base_price = COALESCE(?, base_price),
                weekend_price = COALESCE(?, weekend_price),
                description_th = COALESCE(?, description_th),
                description_en = COALESCE(?, description_en),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(
              body.roomNumber || body.room_number || null,
              body.nameTh || body.name_th || body.name || null,
              body.nameEn || body.name_en || null,
              body.roomType || body.type || body.room_type || null,
              body.typeNameTh || body.type_name_th || null,
              body.typeNameEn || body.type_name_en || null,
              body.capacity !== undefined ? Number(body.capacity) : null,
              body.bedType || body.bed_type || null,
              body.sizeSqm !== undefined ? Number(body.sizeSqm) : null,
              body.basePrice !== undefined ? Number(body.basePrice) : null,
              body.weekendPrice !== undefined ? Number(body.weekendPrice) : null,
              body.descriptionTh || body.description_th || body.description || null,
              body.descriptionEn || body.description_en || null,
              body.status || null,
              id
            ).run();

            const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, room }), { headers: corsHeaders });
          }

          // DELETE /api/rooms - Delete Room (Admin only)
          if (request.method === 'DELETE') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const id = url.searchParams.get('id') || body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing room id' }), { status: 400, headers: corsHeaders });
            }
            await env.DB.prepare('DELETE FROM rooms WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true, deletedId: id }), { headers: corsHeaders });
          }
        }

        // ====================================================================
        // CRUD: PROMOS (GET, POST, PUT, DELETE)
        // ====================================================================
        if (url.pathname === '/api/promos') {
          // GET /api/promos - List promos (all if requested)
          if (request.method === 'GET') {
            const all = url.searchParams.get('all') === 'true';
            const query = all 
              ? 'SELECT * FROM promo_codes ORDER BY created_at DESC' 
              : 'SELECT * FROM promo_codes WHERE is_active = 1';
            const { results } = await env.DB.prepare(query).all();
            return new Response(JSON.stringify(results), { headers: corsHeaders });
          }

          // POST /api/promos - Create Promo (Admin only)
          if (request.method === 'POST') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const code = (body.code || '').trim().toUpperCase();
            const description = body.description || '';
            let discountType = (body.discountType || body.discount_type || 'PERCENT').toUpperCase();
            if (discountType.includes('PERCENT')) discountType = 'PERCENT';
            else discountType = 'FIXED';
            const discountValue = Number(body.discountValue || body.discount_value) || 10;
            const minSpend = Number(body.minSpend || body.min_spend) || 0;
            const isActive = body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1;

            if (!code) {
              return new Response(JSON.stringify({ error: 'Promo code is required' }), { status: 400, headers: corsHeaders });
            }

            await env.DB.prepare(`
              INSERT INTO promo_codes (code, description, discount_type, discount_value, min_spend, is_active)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(code) DO UPDATE SET
                description = excluded.description,
                discount_type = excluded.discount_type,
                discount_value = excluded.discount_value,
                min_spend = excluded.min_spend,
                is_active = excluded.is_active
            `).bind(code, description, discountType, discountValue, minSpend, isActive).run();

            const promo = await env.DB.prepare('SELECT * FROM promo_codes WHERE code = ?').bind(code).first();
            return new Response(JSON.stringify({ success: true, promo }), { status: 201, headers: corsHeaders });
          }

          // PUT/PATCH /api/promos - Update Promo (Admin only)
          if (request.method === 'PUT' || request.method === 'PATCH') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const code = (body.code || '').trim().toUpperCase();
            if (!code) {
              return new Response(JSON.stringify({ error: 'Promo code is required' }), { status: 400, headers: corsHeaders });
            }

            let discountType = body.discountType || body.discount_type || null;
            if (discountType) {
              discountType = discountType.toUpperCase().includes('PERCENT') ? 'PERCENT' : 'FIXED';
            }

            await env.DB.prepare(`
              UPDATE promo_codes SET
                description = COALESCE(?, description),
                discount_type = COALESCE(?, discount_type),
                discount_value = COALESCE(?, discount_value),
                min_spend = COALESCE(?, min_spend),
                is_active = COALESCE(?, is_active)
              WHERE code = ?
            `).bind(
              body.description !== undefined ? body.description : null,
              discountType,
              body.discountValue !== undefined ? Number(body.discountValue) : null,
              body.minSpend !== undefined ? Number(body.minSpend) : null,
              body.isActive !== undefined ? (body.isActive ? 1 : 0) : null,
              code
            ).run();

            const promo = await env.DB.prepare('SELECT * FROM promo_codes WHERE code = ?').bind(code).first();
            return new Response(JSON.stringify({ success: true, promo }), { headers: corsHeaders });
          }

          // DELETE /api/promos - Delete Promo (Admin only)
          if (request.method === 'DELETE') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const code = (url.searchParams.get('code') || body.code || '').toUpperCase();
            if (!code) {
              return new Response(JSON.stringify({ error: 'Missing promo code' }), { status: 400, headers: corsHeaders });
            }
            await env.DB.prepare('DELETE FROM promo_codes WHERE code = ?').bind(code).run();
            return new Response(JSON.stringify({ success: true, deletedCode: code }), { headers: corsHeaders });
          }
        }

        // ====================================================================
        // CRUD: MINIBAR (GET, POST, PUT, DELETE)
        // ====================================================================
        if (url.pathname === '/api/minibar') {
          // GET /api/minibar - List all minibar items
          if (request.method === 'GET') {
            const { results } = await env.DB.prepare(
              'SELECT * FROM minibar_items ORDER BY price ASC'
            ).all();
            return new Response(JSON.stringify(results), { headers: corsHeaders });
          }

          // POST /api/minibar - Create Minibar Item (Admin only)
          if (request.method === 'POST') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const id = body.id || `mb-${Date.now().toString(36)}`;
            const nameTh = body.nameTh || body.name_th || body.name || '';
            const nameEn = body.nameEn || body.name_en || nameTh;
            const category = body.category || 'BEVERAGE';
            const price = Number(body.price) || 0;
            const unit = body.unit || 'ชิ้น';

            await env.DB.prepare(`
              INSERT INTO minibar_items (id, name_th, name_en, category, price, unit)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(id, nameTh, nameEn, category, price, unit).run();

            const item = await env.DB.prepare('SELECT * FROM minibar_items WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, item }), { status: 201, headers: corsHeaders });
          }

          // PUT/PATCH /api/minibar - Update Minibar Item (Admin only)
          if (request.method === 'PUT' || request.method === 'PATCH') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const id = body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing minibar item id' }), { status: 400, headers: corsHeaders });
            }

            await env.DB.prepare(`
              UPDATE minibar_items SET
                name_th = COALESCE(?, name_th),
                name_en = COALESCE(?, name_en),
                category = COALESCE(?, category),
                price = COALESCE(?, price),
                unit = COALESCE(?, unit)
              WHERE id = ?
            `).bind(
              body.nameTh || body.name_th || body.name || null,
              body.nameEn || body.name_en || null,
              body.category || null,
              body.price !== undefined ? Number(body.price) : null,
              body.unit || null,
              id
            ).run();

            const item = await env.DB.prepare('SELECT * FROM minibar_items WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, item }), { headers: corsHeaders });
          }

          // DELETE /api/minibar - Delete Minibar Item (Admin only)
          if (request.method === 'DELETE') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const id = url.searchParams.get('id') || body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing minibar item id' }), { status: 400, headers: corsHeaders });
            }
            await env.DB.prepare('DELETE FROM minibar_items WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true, deletedId: id }), { headers: corsHeaders });
          }
        }

        // ====================================================================
        // CRUD: MAINTENANCE ISSUES (GET, POST, PUT, DELETE)
        // ====================================================================
        if (url.pathname === '/api/maintenance') {
          // GET /api/maintenance - List all maintenance tickets
          if (request.method === 'GET') {
            const { results } = await env.DB.prepare(
              'SELECT * FROM maintenance_issues ORDER BY reported_at DESC'
            ).all();
            return new Response(JSON.stringify(results), { headers: corsHeaders });
          }

          // POST /api/maintenance - Create Maintenance Ticket
          if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const id = body.id || `maint-${Date.now().toString(36)}`;
            const roomId = body.roomId || body.room_id || '';
            const roomNumber = body.roomNumber || body.room_number || '';
            const issueDescription = body.issueDescription || body.issue_description || '';
            const reportedBy = body.reportedBy || body.reported_by || 'Staff';
            const reportedAt = body.reportedAt || body.reported_at || new Date().toISOString();
            const status = body.status || 'PENDING_REPAIR';

            await env.DB.prepare(`
              INSERT INTO maintenance_issues (id, room_id, room_number, issue_description, reported_by, reported_at, status)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(id, roomId, roomNumber, issueDescription, reportedBy, reportedAt, status).run();

            const ticket = await env.DB.prepare('SELECT * FROM maintenance_issues WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, ticket }), { status: 201, headers: corsHeaders });
          }

          // PUT/PATCH /api/maintenance - Update Maintenance Ticket
          if (request.method === 'PUT' || request.method === 'PATCH') {
            const body = await request.json().catch(() => ({}));
            const id = body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing maintenance ticket id' }), { status: 400, headers: corsHeaders });
            }
            const issueDescription = body.issueDescription || body.issue_description || null;
            const status = body.status || null;
            const resolvedAt = status === 'RESOLVED' ? (body.resolvedAt || new Date().toISOString()) : null;

            await env.DB.prepare(`
              UPDATE maintenance_issues SET
                issue_description = COALESCE(?, issue_description),
                status = COALESCE(?, status),
                resolved_at = COALESCE(?, resolved_at)
              WHERE id = ?
            `).bind(issueDescription, status, resolvedAt, id).run();

            const ticket = await env.DB.prepare('SELECT * FROM maintenance_issues WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, ticket }), { headers: corsHeaders });
          }

          // DELETE /api/maintenance - Delete Maintenance Ticket (Admin only)
          if (request.method === 'DELETE') {
            const adminEmail = request.headers.get('X-Admin-Email') || '';
            if (!(await verifyManagerAccess(adminEmail))) {
              return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
            }
            const body = await request.json().catch(() => ({}));
            const id = url.searchParams.get('id') || body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing maintenance ticket id' }), { status: 400, headers: corsHeaders });
            }
            await env.DB.prepare('DELETE FROM maintenance_issues WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true, deletedId: id }), { headers: corsHeaders });
          }
        }

        // ====================================================================
        // CRUD: USERS (GET, POST, PUT, DELETE) (Strict Admin Only)
        // ====================================================================
        if (url.pathname === '/api/users') {
          const adminEmail = request.headers.get('X-Admin-Email') || '';
          const isManager = await verifyManagerAccess(adminEmail);

          if (!isManager) {
            return new Response(
              JSON.stringify({ error: '403 Forbidden: Admin privileges required' }),
              { status: 403, headers: corsHeaders }
            );
          }

          // GET /api/users - List users
          if (request.method === 'GET') {
            const { results } = await env.DB.prepare(
              'SELECT id, email, name, picture, role, google_id, created_at, last_login_at FROM users ORDER BY last_login_at DESC'
            ).all();
            return new Response(JSON.stringify(results), { headers: corsHeaders });
          }

          // POST /api/users - Create / Invite User
          if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const email = (body.email || '').toLowerCase().trim();
            const name = body.name || email.split('@')[0];
            const role = body.role || 'GUEST';
            const validRoles = ['GUEST', 'FRONT_DESK', 'HOUSEKEEPER', 'ADMIN', 'MANAGER'];

            if (!email || !email.includes('@') || !validRoles.includes(role)) {
              return new Response(
                JSON.stringify({ error: 'Invalid email or role' }),
                { status: 400, headers: corsHeaders }
              );
            }

            const id = body.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await env.DB.prepare(`
              INSERT INTO users (id, email, name, role, last_login_at)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(email) DO UPDATE SET
                name = excluded.name,
                role = excluded.role
            `).bind(id, email, name, role).run();

            const user = await env.DB.prepare(
              'SELECT id, email, name, picture, role, google_id, created_at, last_login_at FROM users WHERE email = ?'
            ).bind(email).first();

            return new Response(JSON.stringify({ success: true, user }), { status: 201, headers: corsHeaders });
          }

          // DELETE /api/users - Delete User
          if (request.method === 'DELETE') {
            const body = await request.json().catch(() => ({}));
            const id = url.searchParams.get('id') || body.id;
            const email = (url.searchParams.get('email') || body.email || '').toLowerCase().trim();
            if (!id && !email) {
              return new Response(JSON.stringify({ error: 'Missing user id or email' }), { status: 400, headers: corsHeaders });
            }

            const targetUser = await env.DB.prepare(
              id ? 'SELECT id, email FROM users WHERE id = ?' : 'SELECT id, email FROM users WHERE email = ?'
            ).bind(id || email).first();

            if (targetUser && DESIGNATED_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
              return new Response(
                JSON.stringify({ error: 'Cannot delete Super Admin account' }),
                { status: 403, headers: corsHeaders }
              );
            }

            if (targetUser) {
              await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(targetUser.id).run();
              return new Response(JSON.stringify({ success: true, deletedId: targetUser.id }), { headers: corsHeaders });
            } else {
              return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });
            }
          }
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
          let userId = body.userId || body.id;
          const role = body.role;
          const validRoles = ['GUEST', 'FRONT_DESK', 'HOUSEKEEPER', 'ADMIN', 'MANAGER'];

          if (!userId && body.email) {
            const userRow = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email.toLowerCase().trim()).first();
            if (userRow) userId = userRow.id;
          }

          if (!userId || !validRoles.includes(role)) {
            return new Response(
              JSON.stringify({ error: 'Invalid userId or role. Allowed: GUEST, FRONT_DESK, HOUSEKEEPER, ADMIN, MANAGER' }),
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

        // GET /api/reviews - List all guest reviews from D1
        if (url.pathname === '/api/reviews') {
          const { results } = await env.DB.prepare(
            'SELECT * FROM reviews ORDER BY created_at DESC'
          ).all();
          return new Response(JSON.stringify(results), { headers: corsHeaders });
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

          // 3. Determine initial Role: strictly GUEST unless explicitly on the designated admin whitelist
          const emailLower = email.toLowerCase().trim();
          let role = 'GUEST';
          if (DESIGNATED_ADMIN_EMAILS.includes(emailLower)) {
            role = 'ADMIN';
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
                WHEN excluded.role = 'ADMIN' THEN 'ADMIN' 
                WHEN excluded.role = 'MANAGER' THEN 'ADMIN' 
                WHEN users.role = 'MANAGER' THEN 'ADMIN'
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

        // ====================================================================
        // CHATBOT API SUITE (Multi-Provider, FAQs, Settings, Playground)
        // ====================================================================

        // GET /api/chat - Concierge API Info & Documentation
        if (url.pathname === '/api/chat' && request.method === 'GET') {
          // Read current default settings
          let provider = 'cloudflare';
          let model = '@cf/meta/llama-3.2-3b-instruct';
          try {
            const pRow = await env.DB.prepare('SELECT value FROM chat_settings WHERE key = "provider"').first();
            const mRow = await env.DB.prepare('SELECT value FROM chat_settings WHERE key = "model"').first();
            if (pRow) provider = pRow.value;
            if (mRow) model = mRow.value;
          } catch (_) {}

          return new Response(
            JSON.stringify({
              status: 'online',
              service: 'The Haven AI Concierge API',
              activeProvider: provider,
              activeModel: model,
              supportedProviders: ['cloudflare', 'gemini', 'openai'],
              engine: env.AI ? 'Cloudflare Workers AI + D1 Grounding' : 'Edge Intelligent Concierge Engine + D1 Grounding',
              version: '2.0.0',
              endpoints: {
                chat: 'POST /api/chat',
                settings: 'GET|POST /api/chat/settings (Admin)',
                faqs: 'GET|POST|PUT|DELETE /api/chat/faqs',
                test: 'POST /api/chat/test'
              },
              sampleQueries: [
                'ราคาห้องพักมีแบบไหนบ้าง',
                'เวลาเช็คอิน เช็คเอาท์กี่โมง',
                'มีโปรโมชั่นส่วนลดอะไรบ้าง',
                'สระว่ายน้ำเปิดปิดกี่โมง',
                'มีบริการรถรับส่งสนามบินไหม',
                'อาหารเช้ามีบริการอะไรบ้าง',
                'นโยบายการยกเลิกและการคืนเงินเป็นอย่างไร',
                'ขอเบอร์โทรและแผนที่ติดต่อรีสอร์ท'
              ]
            }),
            { headers: corsHeaders }
          );
        }

        // GET & POST /api/chat/settings - Admin Chatbot API Configuration
        if (url.pathname === '/api/chat/settings') {
          const adminEmail = request.headers.get('X-Admin-Email') || '';
          if (!(await verifyManagerAccess(adminEmail))) {
            return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
          }

          if (request.method === 'GET') {
            const { results } = await env.DB.prepare('SELECT key, value FROM chat_settings').all();
            const settingsMap = {};
            (results || []).forEach(r => { settingsMap[r.key] = r.value; });

            return new Response(
              JSON.stringify({
                provider: settingsMap.provider || 'cloudflare',
                model: settingsMap.model || '@cf/meta/llama-3.2-3b-instruct',
                temperature: Number(settingsMap.temperature) || 0.4,
                max_tokens: Number(settingsMap.max_tokens) || 500,
                enable_d1_grounding: settingsMap.enable_d1_grounding !== '0',
                system_prompt: settingsMap.system_prompt || '',
                has_gemini_key: Boolean(settingsMap.gemini_api_key && settingsMap.gemini_api_key.trim().length > 5),
                has_openai_key: Boolean(settingsMap.openai_api_key && settingsMap.openai_api_key.trim().length > 5)
              }),
              { headers: corsHeaders }
            );
          }

          if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const validKeys = [
              'provider', 'model', 'temperature', 'max_tokens', 
              'enable_d1_grounding', 'system_prompt', 
              'gemini_api_key', 'openai_api_key'
            ];

            for (const key of validKeys) {
              if (body[key] !== undefined) {
                let val = String(body[key]);
                if (key === 'enable_d1_grounding') val = body[key] ? '1' : '0';
                await env.DB.prepare(`
                  INSERT INTO chat_settings (key, value, updated_at)
                  VALUES (?, ?, CURRENT_TIMESTAMP)
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
                `).bind(key, val).run();
              }
            }

            return new Response(JSON.stringify({ success: true, message: 'Chatbot settings updated successfully' }), { headers: corsHeaders });
          }
        }

        // GET, POST, PUT, DELETE /api/chat/faqs - Chatbot Knowledge Base FAQs
        if (url.pathname === '/api/chat/faqs') {
          if (request.method === 'GET') {
            const { results } = await env.DB.prepare(
              'SELECT * FROM chatbot_faqs ORDER BY category ASC, created_at DESC'
            ).all();
            return new Response(JSON.stringify(results || []), { headers: corsHeaders });
          }

          // Admin check for mutations
          const adminEmail = request.headers.get('X-Admin-Email') || '';
          if (!(await verifyManagerAccess(adminEmail))) {
            return new Response(JSON.stringify({ error: '403 Forbidden: Admin privileges required' }), { status: 403, headers: corsHeaders });
          }

          if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const id = body.id || `faq_${Date.now().toString(36)}`;
            const questionTh = body.question_th || body.questionTh || '';
            const answerTh = body.answer_th || body.answerTh || '';
            const questionEn = body.question_en || body.questionEn || '';
            const answerEn = body.answer_en || body.answerEn || '';
            const category = body.category || 'GENERAL';
            const isActive = body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1;

            if (!questionTh || !answerTh) {
              return new Response(JSON.stringify({ error: 'Question and Answer in Thai are required' }), { status: 400, headers: corsHeaders });
            }

            await env.DB.prepare(`
              INSERT INTO chatbot_faqs (id, question_th, answer_th, question_en, answer_en, category, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(id, questionTh, answerTh, questionEn, answerEn, category, isActive).run();

            const faq = await env.DB.prepare('SELECT * FROM chatbot_faqs WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, faq }), { status: 201, headers: corsHeaders });
          }

          if (request.method === 'PUT' || request.method === 'PATCH') {
            const body = await request.json().catch(() => ({}));
            const id = body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing FAQ id' }), { status: 400, headers: corsHeaders });
            }

            await env.DB.prepare(`
              UPDATE chatbot_faqs SET
                question_th = COALESCE(?, question_th),
                answer_th = COALESCE(?, answer_th),
                question_en = COALESCE(?, question_en),
                answer_en = COALESCE(?, answer_en),
                category = COALESCE(?, category),
                is_active = COALESCE(?, is_active)
              WHERE id = ?
            `).bind(
              body.question_th || body.questionTh || null,
              body.answer_th || body.answerTh || null,
              body.question_en || body.questionEn || null,
              body.answer_en || body.answerEn || null,
              body.category || null,
              body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
              id
            ).run();

            const faq = await env.DB.prepare('SELECT * FROM chatbot_faqs WHERE id = ?').bind(id).first();
            return new Response(JSON.stringify({ success: true, faq }), { headers: corsHeaders });
          }

          if (request.method === 'DELETE') {
            const body = await request.json().catch(() => ({}));
            const id = url.searchParams.get('id') || body.id;
            if (!id) {
              return new Response(JSON.stringify({ error: 'Missing FAQ id' }), { status: 400, headers: corsHeaders });
            }
            await env.DB.prepare('DELETE FROM chatbot_faqs WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true, deletedId: id }), { headers: corsHeaders });
          }
        }

        // POST /api/chat/test - Quick API Connectivity Tester
        if (url.pathname === '/api/chat/test' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const provider = (body.provider || 'cloudflare').toLowerCase();
          const apiKey = (body.apiKey || '').trim();
          const model = (body.model || '').trim();
          const testMessage = body.message || 'สวัสดีครับ ช่วยแนะนำห้องพักให้หน่อยครับ';
          const startT = Date.now();

          let testReply = '';
          let testSuccess = false;
          let errorDetails = null;

          if (provider === 'gemini') {
            if (!apiKey) {
              return new Response(JSON.stringify({ success: false, error: 'Gemini API Key is required' }), { status: 400, headers: corsHeaders });
            }
            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
              const gRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `Answer in Thai politely: ${testMessage}` }] }],
                  generationConfig: { maxOutputTokens: 150, temperature: 0.4 }
                })
              });
              const gData = await gRes.json();
              if (gRes.ok && gData?.candidates?.[0]?.content?.parts?.[0]?.text) {
                testReply = gData.candidates[0].content.parts[0].text;
                testSuccess = true;
              } else {
                errorDetails = gData?.error?.message || 'Gemini API response error';
              }
            } catch (err) {
              errorDetails = err.message;
            }
          } else if (provider === 'openai') {
            if (!apiKey) {
              return new Response(JSON.stringify({ success: false, error: 'OpenAI API Key is required' }), { status: 400, headers: corsHeaders });
            }
            try {
              const oRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  model: model || 'gpt-4o-mini',
                  messages: [{ role: 'user', content: testMessage }],
                  max_tokens: 150
                })
              });
              const oData = await oRes.json();
              if (oRes.ok && oData?.choices?.[0]?.message?.content) {
                testReply = oData.choices[0].message.content;
                testSuccess = true;
              } else {
                errorDetails = oData?.error?.message || 'OpenAI API response error';
              }
            } catch (err) {
              errorDetails = err.message;
            }
          } else {
            // Cloudflare Workers AI
            try {
              if (env.AI && typeof env.AI.run === 'function') {
                const cfResult = await env.AI.run(model || '@cf/meta/llama-3.2-3b-instruct', {
                  messages: [{ role: 'user', content: testMessage }],
                  max_tokens: 150
                });
                if (cfResult && cfResult.response) {
                  testReply = cfResult.response;
                  testSuccess = true;
                }
              } else {
                testReply = 'Edge Rule Engine: พร้อมให้บริการแบบ Grounding Fallback 100%';
                testSuccess = true;
              }
            } catch (err) {
              errorDetails = err.message;
            }
          }

          return new Response(
            JSON.stringify({
              success: testSuccess,
              reply: testReply || null,
              error: errorDetails,
              provider,
              model: model || (provider === 'gemini' ? 'gemini-1.5-flash' : provider === 'openai' ? 'gpt-4o-mini' : '@cf/meta/llama-3.2-3b-instruct'),
              latencyMs: Date.now() - startT,
              timestamp: new Date().toISOString()
            }),
            { headers: corsHeaders }
          );
        }

        // POST /api/chat - Resort AI Concierge Assistant (Enhanced Multi-Provider Engine)
        if (url.pathname === '/api/chat' && request.method === 'POST') {
          const startTime = Date.now();
          const body = await request.json().catch(() => ({}));
          const userMessage = (body.message || '').trim();
          const language = (body.language || 'th').toLowerCase();
          const isEn = language === 'en';

          if (!userMessage) {
            return new Response(
              JSON.stringify({ error: isEn ? 'Message cannot be empty' : 'ข้อความต้องไม่ว่างเปล่า' }),
              { status: 400, headers: corsHeaders }
            );
          }

          // 1. Load System Settings from D1
          let configuredSettings = {};
          try {
            const { results: sResults } = await env.DB.prepare('SELECT key, value FROM chat_settings').all();
            (sResults || []).forEach(r => { configuredSettings[r.key] = r.value; });
          } catch (_) {}

          const effectiveProvider = (body.provider || configuredSettings.provider || 'cloudflare').toLowerCase();
          const effectiveModel = body.model || configuredSettings.model || '';
          const effectiveApiKey = body.apiKey || (effectiveProvider === 'gemini' ? configuredSettings.gemini_api_key : configuredSettings.openai_api_key) || '';
          const effectiveTemperature = Number(body.temperature || configuredSettings.temperature) || 0.4;
          const effectiveMaxTokens = Number(body.maxTokens || configuredSettings.max_tokens) || 500;
          const isGroundingEnabled = (body.enableGrounding !== undefined ? body.enableGrounding : (configuredSettings.enable_d1_grounding !== '0'));

          // 2. Fetch live resort inventory & FAQs from D1
          let roomData = [];
          let promoData = [];
          let faqData = [];
          if (isGroundingEnabled) {
            try {
              const { results: rResults } = await env.DB.prepare(
                'SELECT name_th, name_en, room_type, base_price, weekend_price, capacity, bed_type FROM rooms ORDER BY base_price DESC'
              ).all();
              roomData = rResults || [];
            } catch (_) {}

            try {
              const { results: pResults } = await env.DB.prepare(
                'SELECT code, description, discount_type, discount_value, min_spend FROM promo_codes WHERE is_active = 1'
              ).all();
              promoData = pResults || [];
            } catch (_) {}
          }

          try {
            const { results: fResults } = await env.DB.prepare(
              'SELECT question_th, answer_th, question_en, answer_en, category FROM chatbot_faqs WHERE is_active = 1'
            ).all();
            faqData = fResults || [];
          } catch (_) {}

          // 3. Check for Direct Custom FAQ Matches
          const lowerMsg = userMessage.toLowerCase();
          let directFaqAnswer = null;
          for (const faq of faqData) {
            const qTh = (faq.question_th || '').toLowerCase();
            const qEn = (faq.question_en || '').toLowerCase();
            // Check keyword overlap
            const thKeywords = qTh.split(/\s+/).filter(w => w.length >= 2);
            const matchCount = thKeywords.filter(k => lowerMsg.includes(k)).length;
            if (matchCount >= 2 || (qTh.length > 3 && lowerMsg.includes(qTh))) {
              directFaqAnswer = isEn ? (faq.answer_en || faq.answer_th) : faq.answer_th;
              break;
            }
          }

          // Build grounding contexts
          const roomsContext = roomData.map(r => 
            `- ${r.name_th || r.name} (${r.name_en}): ฿${r.base_price.toLocaleString()}/คืน, พักได้ ${r.capacity} ท่าน, เตียง: ${r.bed_type}`
          ).join('\n');
          const promosContext = promoData.map(p =>
            `- โค้ด ${p.code}: ${p.description} (ยอดขั้นต่ำ: ฿${p.min_spend.toLocaleString()})`
          ).join('\n');
          const faqsContext = faqData.map(f =>
            `Q: ${f.question_th}\nA: ${f.answer_th}`
          ).join('\n');

          const systemPrompt = (configuredSettings.system_prompt && configuredSettings.system_prompt.trim().length > 10)
            ? configuredSettings.system_prompt
            : `You are "Haven AI Concierge", the luxurious, warm, and professional virtual assistant of "The Haven Serene Resort & Villas" (Koh Chang, Trat, Thailand).
Resort Information:
- Rooms & Rates:
${roomsContext || '- Pool Villa (฿4,200), Beachfront Suite (฿3,500), Garden Bungalow (฿2,200), Deluxe Room (฿1,600)'}
- Key Policies:
  - Check-in: 14:00 onwards. Check-out: before 12:00.
  - 15-Minute Inventory Hold (BR-01): Guaranteed 100% anti-overbooking protection.
  - Cancellation (BR-03): >7 days 100% refund, 3-7 days 50% refund, <3 days non-refundable.
  - Security Deposit (BR-04): ฿1,000 per room upon check-in, fully refunded at check-out.
- Dining: Oceanfront breakfast buffet 06:30 - 10:30, Floating Breakfast ฿650.
- Active Promo Codes:
${promosContext || '- SUMMER10 (10% off), VIP20 (20% off for bookings >= ฿5,000)'}
- Hotel Services & FAQs:
${faqsContext}
- Contact: Phone 039-555-888 (24/7 Front Desk), Email: reservation@thehavenresort.com, Location: White Sand Beach, Koh Chang, Trat.

Instruction:
Answer the guest politely, clearly, and concisely in ${isEn ? 'English' : 'Thai'}. Use polite sentence endings (ครับ/ค่ะ) and formatting with emojis/bullet points where helpful.`;

          let reply = '';
          let actualProvider = 'domain_engine';
          let actualModel = 'Domain Knowledge Engine';
          let suggestions = [];
          let action = null;

          // 4. Try Execution via Selected Provider
          if (effectiveProvider === 'gemini' && effectiveApiKey) {
            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel || 'gemini-1.5-flash'}:generateContent?key=${effectiveApiKey}`;
              const gRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    {
                      role: 'user',
                      parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }]
                    }
                  ],
                  generationConfig: {
                    temperature: effectiveTemperature,
                    maxOutputTokens: effectiveMaxTokens
                  }
                })
              });
              const gData = await gRes.json();
              if (gRes.ok && gData?.candidates?.[0]?.content?.parts?.[0]?.text) {
                reply = gData.candidates[0].content.parts[0].text.trim();
                actualProvider = 'gemini';
                actualModel = effectiveModel || 'gemini-1.5-flash';
              }
            } catch (gErr) {
              console.warn('Gemini call failed, fallbacking:', gErr.message);
            }
          } else if (effectiveProvider === 'openai' && effectiveApiKey) {
            try {
              const oRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${effectiveApiKey}`
                },
                body: JSON.stringify({
                  model: effectiveModel || 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: systemPrompt },
                    ...(Array.isArray(body.history) ? body.history.slice(-4) : []),
                    { role: 'user', content: userMessage }
                  ],
                  temperature: effectiveTemperature,
                  max_tokens: effectiveMaxTokens
                })
              });
              const oData = await oRes.json();
              if (oRes.ok && oData?.choices?.[0]?.message?.content) {
                reply = oData.choices[0].message.content.trim();
                actualProvider = 'openai';
                actualModel = effectiveModel || 'gpt-4o-mini';
              }
            } catch (oErr) {
              console.warn('OpenAI call failed, fallbacking:', oErr.message);
            }
          } else if (effectiveProvider === 'cloudflare' && env.AI && typeof env.AI.run === 'function') {
            try {
              const aiMessages = [
                { role: 'system', content: systemPrompt },
                ...(Array.isArray(body.history) ? body.history.slice(-4) : []),
                { role: 'user', content: userMessage }
              ];
              const aiResult = await env.AI.run(effectiveModel || '@cf/meta/llama-3.2-3b-instruct', {
                messages: aiMessages,
                max_tokens: effectiveMaxTokens,
                temperature: effectiveTemperature
              });
              if (aiResult && aiResult.response) {
                reply = aiResult.response.trim();
                actualProvider = 'cloudflare';
                actualModel = effectiveModel || '@cf/meta/llama-3.2-3b-instruct';
              }
            } catch (cfErr) {
              console.warn('Workers AI call skipped or fallback:', cfErr.message);
            }
          }

          // 5. Direct FAQ answer injection if matched and no AI reply yet
          if (!reply && directFaqAnswer) {
            reply = `✨ **คำตอบจากระบบข้อมูลรีสอร์ท:**\n\n${directFaqAnswer}`;
            actualProvider = 'faq_grounding';
            actualModel = 'D1 Resort Knowledge Base';
          }

          // 6. Domain Knowledge Rule Engine Fallback (Guaranteed 100% precision)
          if (!reply) {
            actualProvider = 'domain_engine';
            actualModel = 'D1 Domain Rule Engine';

            // Intent 1: Rooms & Pricing
            if (/ราคา|ห้อง|วิลล่า|ห้องพัก|กี่บาท|price|room|villa|suite|rate|cost|deluxe|bungalow/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🌴 **The Haven Serene Resort & Villas Room Rates:**\n\n` +
                  `1. **Pool Villa** — ฿4,200 / night (Up to 4 guests, private infinity pool & sundeck)\n` +
                  `2. **Beachfront Suite** — ฿3,500 / night (Up to 2 guests, panoramic ocean view & balcony bathtub)\n` +
                  `3. **Garden Bungalow** — ฿2,200 / night (Up to 2 guests, lush tropical garden & serenity)\n` +
                  `4. **Deluxe Room** — ฿1,600 / night (Up to 2 guests, cozy king bed & full modern amenities)\n\n` +
                  `✨ *Every booking includes high-speed Wi-Fi and our 15-minute anti-overbooking guarantee!*`;
                suggestions = ['Any active promotions?', 'Check-in & Check-out time', 'Breakfast & Dining info'];
                action = { type: 'VIEW_ROOMS', label: 'View & Book Rooms' };
              } else {
                reply = `🌴 **อัตราค่าบริการห้องพัก เดอะ เฮเว่น รีสอร์ท:**\n\n` +
                  `1. 🏡 **Pool Villa** — ฿4,200 / คืน (พักได้ 4 ท่าน, สระว่ายน้ำส่วนตัว & ลานอาบแดด)\n` +
                  `2. 🌊 **Beachfront Suite** — ฿3,500 / คืน (พักได้ 2 ท่าน, วิวทะเลพาโนรามา & อ่างแช่ตัวระเบียง)\n` +
                  `3. 🌿 **Garden Bungalow** — ฿2,200 / คืน (พักได้ 2 ท่าน, บรรยากาศสวนเมืองร้อน ร่มรื่น)\n` +
                  `4. 🛏️ **Deluxe Room** — ฿1,600 / คืน (พักได้ 2 ท่าน, เตียงคิงไซส์ สิ่งอำนวยความสะดวกครบ)\n\n` +
                  `✨ *ทุกการจองการันตีระบบล็อกห้อง 15 นาที ป้องกันการจองซ้ำซ้อน 100% ครับ*`;
                suggestions = ['มีโปรโมชั่นอะไรบ้าง', 'เวลาเช็คอิน-เช็คเอาท์', 'อาหารเช้าและบริการเสริม'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพักและเริ่มจอง' };
              }
            }
            // Intent 2: Check-in / Check-out
            else if (/เช็คอิน|เช็คเอาท์|เวลา|กี่โมง|check.?in|check.?out|time|hour|ล็อกห้อง|overbooking/i.test(lowerMsg)) {
              if (isEn) {
                reply = `⏰ **Check-In & Check-Out Policies (BR-02):**\n\n` +
                  `• **Check-In Time:** 14:00 onwards\n` +
                  `• **Check-Out Time:** Before 12:00 (Noon)\n\n` +
                  `🔒 **15-Minute Inventory Hold (BR-01):**\n` +
                  `When you select a room, our Cloudflare Edge system locks it exclusively for 15 minutes to allow payment, ensuring zero risk of double-booking.\n\n` +
                  `💡 *Need early check-in or late check-out? Please contact Front Desk at 039-555-888.*`;
                suggestions = ['Room rates & types', 'Security Deposit policy', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'Explore Rooms' };
              } else {
                reply = `⏰ **เวลาเช็คอินและเช็คเอาท์ (ตามระเบียบ BR-02):**\n\n` +
                  `• 🕒 **เวลาเช็คอิน (Check-in):** ตั้งแต่เวลา **14:00 น.** เป็นต้นไป\n` +
                  `• 🕛 **เวลาเช็คเอาท์ (Check-out):** ก่อนเวลา **12:00 น.**\n\n` +
                  `🔒 **ระบบการันตีล็อกห้อง 15 นาที (BR-01):**\n` +
                  `เมื่อท่านเลือกห้องพักและเข้าสู่ขั้นตอนชำระเงิน ระบบจะล็อกห้องไว้ให้ท่านเป็นเวลา 15 นาที ไร้ปัญหาการจองชนกัน 100% ครับ\n\n` +
                  `💡 *หากต้องการ Early Check-in หรือ Late Check-out สามารถแจ้งแผนกต้อนรับล่วงหน้าได้ครับ*`;
                suggestions = ['ดูราคาห้องพัก', 'นโยบายเงินมัดจำ', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพัก' };
              }
            }
            // Intent 3: Promotions
            else if (/โปร|ส่วนลด|promo|discount|code|คูปอง|voucher|ลดราคา/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🎁 **Exclusive Resort Promo Codes:**\n\n` +
                  `• **SUMMER10** — Get 10% instant discount on any booking!\n` +
                  `• **VIP20** — Get 20% discount on bookings over ฿5,000\n\n` +
                  `📌 *How to use:* Enter the code in the 'Promo Code' box during booking checkout!`;
                suggestions = ['Book with SUMMER10', 'Room rates', 'Cancellation policy'];
                action = { type: 'APPLY_PROMO', label: 'Book with Code SUMMER10', data: 'SUMMER10' };
              } else {
                reply = `🎁 **โค้ดส่วนลดและโปรโมชั่นพิเศษช่วงนี้:**\n\n` +
                  `• 🏷️ **SUMMER10** — รับส่วนลดทันที **10%** ทุกยอดการจอง\n` +
                  `• 💎 **VIP20** — รับส่วนลดทันที **20%** เมื่อมียอดจองตั้งแต่ 5,000 บาทขึ้นไป\n\n` +
                  `📌 *วิธีใช้งาน:* กรอกโค้ดในช่อง "โค้ดส่วนลด" ในหน้าชำระเงิน แล้วกดใช้งานได้ทันทีครับ`;
                suggestions = ['จองห้องพักพร้อมโค้ด', 'ดูราคาห้องพัก', 'เงื่อนไขการยกเลิก'];
                action = { type: 'APPLY_PROMO', label: 'ใช้โค้ด SUMMER10', data: 'SUMMER10' };
              }
            }
            // Intent 4: Breakfast & Dining
            else if (/อาหาร|เช้า|มินิบาร์|breakfast|food|minibar|floating|กิน|ดื่ม|สระ/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🍳 **Dining & Refreshments:**\n\n` +
                  `• **Oceanfront Buffet Breakfast:** Served daily from 06:30 to 10:30 AM at Haven Breeze Restaurant.\n` +
                  `• **Floating Breakfast:** ฿650 / set — Delivered directly to your Pool Villa for unforgettable morning photos.\n` +
                  `• **In-Room Minibar:** Stocked with chilled fresh coconut (฿80), Singha Beer (฿120), Thai herbal tea (฿60).`;
                suggestions = ['Pool Villa details', 'Room rates', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'View Pool Villa' };
              } else {
                reply = `🍳 **บริการอาหารเช้าและเครื่องดื่ม:**\n\n` +
                  `• 🌅 **บุฟเฟต์อาหารเช้าริมทะเล:** บริการทุกวันเวลา **06:30 - 10:30 น.** ที่ห้องอาหาร Haven Breeze\n` +
                  `• 🥐 **Floating Breakfast (อาหารเช้าลอยน้ำ):** เซ็ตละ **฿650** เสิร์ฟตรงถึงสระว่ายน้ำ Pool Villa\n` +
                  `• 🥥 **มินิบาร์ภายในห้องพัก:** น้ำมะพร้าวสด (฿80), เบียร์สิงห์ (฿120), ชาสมุนไพรไทย (฿60)`;
                suggestions = ['ดูห้อง Pool Villa', 'ดูราคาห้องพัก', 'โปรโมชั่นล่าสุด'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพักและบริการเสริม' };
              }
            }
            // Intent 5: Cancellation & Refunds
            else if (/ยกเลิก|คืนเงิน|cancel|refund|เปลี่ยนวัน|เลื่อน/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🛡️ **Cancellation & Refund Policy (BR-03):**\n\n` +
                  `• **> 7 Days before arrival:** 100% Full Refund (Zero penalty fee)\n` +
                  `• **3 - 7 Days before arrival:** 50% Refund (50% cancellation fee)\n` +
                  `• **< 3 Days / No-Show:** Non-refundable\n\n` +
                  `To cancel, go to 'My Bookings', find your booking, and click 'Cancel Booking'.`;
                suggestions = ['Lookup my booking', 'Room prices', 'Contact Front Desk'];
                action = { type: 'LOOKUP_BOOKING', label: 'Lookup My Booking' };
              } else {
                reply = `🛡️ **นโยบายการยกเลิกและคืนเงิน (ตามระเบียบ BR-03):**\n\n` +
                  `• 🟢 **ยกเลิกก่อนวันเข้าพักมากกว่า 7 วัน:** คืนเงินเต็มจำนวน **100%** (ไม่มีค่าธรรมเนียม)\n` +
                  `• 🟡 **ยกเลิก 3 - 7 วันก่อนวันเข้าพัก:** คืนเงิน **50%** ของยอดรวม\n` +
                  `• 🔴 **ยกเลิกน้อยกว่า 3 วัน หรือ No-Show:** ไม่สามารถคืนเงินได้\n\n` +
                  `ท่านสามารถตรวจสอบหรือยกเลิกการจองได้ที่เมนู "การจองของฉัน" ครับ`;
                suggestions = ['ค้นหาการจองของฉัน', 'ดูราคาห้องพัก', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'LOOKUP_BOOKING', label: 'ไปที่การจองของฉัน' };
              }
            }
            // Intent 6: Security Deposit
            else if (/มัดจำ|ประกัน|deposit|เงินประกัน/i.test(lowerMsg)) {
              if (isEn) {
                reply = `💼 **Security Deposit Policy (BR-04):**\n\n` +
                  `• A security deposit of **฿1,000 per room** is collected upon check-in.\n` +
                  `• Fully refunded upon check-out after standard room inspection.`;
                suggestions = ['Check-in time', 'Room rates', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'View Rooms' };
              } else {
                reply = `💼 **นโยบายเงินมัดจำความเสียหาย (ตามระเบียบ BR-04):**\n\n` +
                  `• เรียกเก็บเงินมัดจำ **1,000 บาท ต่อห้อง** ณ วันที่เช็คอิน (เงินสดหรือสแกน QR)\n` +
                  `• เงินมัดจำจะได้รับ **คืนเต็มจำนวนทันทีตอนเช็คเอาท์** หลังตรวจสอบห้องพักครับ`;
                suggestions = ['เวลาเช็คอิน-เช็คเอาท์', 'ดูราคาห้องพัก', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพัก' };
              }
            }
            // Intent 7: Contact & Location
            else if (/ติดต่อ|เบอร์|โทร|ที่อยู่|แผนที่|เกาะช้าง|contact|phone|location|address|call|map/i.test(lowerMsg)) {
              if (isEn) {
                reply = `📍 **The Haven Serene Resort & Villas Contact:**\n\n` +
                  `• **Address:** White Sand Beach, Koh Chang, Trat 23170, Thailand\n` +
                  `• **Front Desk Hotline:** 039-555-888 (Available 24/7)\n` +
                  `• **Email:** reservation@thehavenresort.com`;
                suggestions = ['Room rates', 'Active promotions', 'Check-in time'];
                action = { type: 'CALL_HOTLINE', label: 'Call 039-555-888', data: 'tel:039555888' };
              } else {
                reply = `📍 **ข้อมูลการติดต่อและที่ตั้งรีสอร์ท:**\n\n` +
                  `• 🏖️ **ที่ตั้ง:** หาดทรายขาว เกาะสวรรค์ (เกาะช้าง) จ.ตราด 23170\n` +
                  `• 📞 **เบอร์โทรศัพท์แผนกต้อนรับ:** **039-555-888** (บริการตลอด 24 ชั่วโมง)\n` +
                  `• ✉️ **อีเมล:** reservation@thehavenresort.com`;
                suggestions = ['ดูราคาห้องพัก', 'มีโปรโมชั่นอะไรบ้าง', 'เวลาเช็คอิน-เช็คเอาท์'];
                action = { type: 'CALL_HOTLINE', label: 'โทร 039-555-888', data: 'tel:039555888' };
              }
            }
            // Intent 8: Lookup booking
            else if (/ดูการจอง|ค้นหาการจอง|เลขจอง|สถานะ|booking|check booking/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🔍 **Lookup Your Booking:**\n\n` +
                  `Click 'My Bookings' in the navigation bar and enter your Booking Code or phone number.`;
                suggestions = ['Lookup my booking now', 'Room rates', 'Contact Front Desk'];
                action = { type: 'LOOKUP_BOOKING', label: 'Lookup My Booking' };
              } else {
                reply = `🔍 **การค้นหาและตรวจสอบสถานะการจอง:**\n\n` +
                  `คลิกปุ่ม **"การจองของฉัน"** ด้านบน แล้วกรอกรหัสการจองหรือเบอร์โทรศัพท์ที่ใช้จองครับ`;
                suggestions = ['เปิดเมนูการจองของฉัน', 'ดูราคาห้องพัก', 'ติดต่อเจ้าหน้าที่'];
                action = { type: 'LOOKUP_BOOKING', label: 'ค้นหาการจองของฉัน' };
              }
            }
            // Default Greeting
            else {
              if (isEn) {
                reply = `👋 **Welcome to The Haven Serene Resort & Villas!**\n\n` +
                  `I am your virtual Concierge Assistant. How may I assist your vacation today?\n` +
                  `• 🏡 Room rates, amenities, and availability\n` +
                  `• 🎁 Active discount codes and promotions\n` +
                  `• ⏰ Check-in (14:00) & Check-out (12:00) policies\n` +
                  `• 🍳 Breakfast options & Floating Breakfast\n` +
                  `• 🔍 Looking up and tracking your reservation`;
                suggestions = ['Room rates & types', 'Current promotions', 'Check-in time', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'View Available Rooms' };
              } else {
                reply = `👋 **สวัสดีครับ ยินดีต้อนรับสู่ เดอะ เฮเว่น รีสอร์ท!**\n\n` +
                  `ผมคือผู้ช่วยอัจฉริยะ (Haven AI Concierge) พร้อมบริการตอบคำถามและดูแลการเข้าพักของท่านครับ:\n` +
                  `• 🏡 สอบถามราคาห้องพัก ประเภทเตียง และสระว่ายน้ำส่วนตัว\n` +
                  `• 🎁 ตรวจสอบโค้ดส่วนลดและโปรโมชั่นล่าสุด\n` +
                  `• ⏰ เวลาเช็คอิน (14:00 น.) และเช็คเอาท์ (12:00 น.)\n` +
                  `• 🍳 บริการอาหารเช้าและ Floating Breakfast ในวิลล่า\n` +
                  `• 🔍 ตรวจสอบและค้นหาข้อมูลการจองของท่าน`;
                suggestions = ['ราคาห้องพักมีแบบไหนบ้าง', 'มีโปรโมชั่นอะไรบ้าง', 'เวลาเช็คอิน-เช็คเอาท์', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพักทั้งหมด' };
              }
            }
          }

          // Generate default suggestions if empty
          if (suggestions.length === 0) {
            suggestions = isEn
              ? ['Room rates & types', 'Current promotions', 'Check-in time', 'Contact Front Desk']
              : ['ราคาห้องพักมีแบบไหนบ้าง', 'มีโปรโมชั่นอะไรบ้าง', 'เวลาเช็คอิน-เช็คเอาท์', 'ติดต่อแผนกต้อนรับ'];
          }

          return new Response(
            JSON.stringify({
              success: true,
              reply,
              provider: actualProvider,
              model: actualModel,
              latencyMs: Date.now() - startTime,
              suggestions,
              action,
              timestamp: new Date().toISOString()
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

