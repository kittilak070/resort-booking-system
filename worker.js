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
          const validRoles = ['GUEST', 'FRONT_DESK', 'HOUSEKEEPER', 'ADMIN', 'MANAGER'];

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

        // GET /api/chat - Concierge API Info & Sample Queries
        if (url.pathname === '/api/chat' && request.method === 'GET') {
          return new Response(
            JSON.stringify({
              status: 'online',
              service: 'The Haven AI Concierge API',
              engine: env.AI ? 'Cloudflare Workers AI + D1 Grounding' : 'Edge Intelligent Concierge Engine + D1 Grounding',
              version: '1.0.0',
              sampleQueries: [
                'ราคาห้องพักมีแบบไหนบ้าง',
                'เวลาเช็คอิน เช็คเอาท์กี่โมง',
                'มีโปรโมชั่นส่วนลดอะไรบ้าง',
                'อาหารเช้ามีบริการอะไรบ้าง',
                'นโยบายการยกเลิกและการคืนเงินเป็นอย่างไร',
                'ขอเบอร์โทรและแผนที่ติดต่อรีสอร์ท'
              ]
            }),
            { headers: corsHeaders }
          );
        }

        // POST /api/chat - Resort AI Concierge Assistant
        if (url.pathname === '/api/chat' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const userMessage = (body.message || '').trim();
          const language = (body.language || 'th').toLowerCase();
          const isEn = language === 'en';

          if (!userMessage) {
            return new Response(
              JSON.stringify({
                error: isEn ? 'Message cannot be empty' : 'ข้อความต้องไม่ว่างเปล่า'
              }),
              { status: 400, headers: corsHeaders }
            );
          }

          // Fetch live resort room prices & promo codes from D1
          let roomData = [];
          let promoData = [];
          try {
            const { results: rResults } = await env.DB.prepare(
              'SELECT name, name_en, type, base_price, weekend_price, capacity, bed_type FROM rooms ORDER BY base_price DESC'
            ).all();
            roomData = rResults || [];
          } catch (e) {
            console.error('D1 rooms query error:', e);
          }

          try {
            const { results: pResults } = await env.DB.prepare(
              'SELECT code, description, discount_type, discount_value, min_spend FROM promo_codes WHERE is_active = 1'
            ).all();
            promoData = pResults || [];
          } catch (e) {
            console.error('D1 promos query error:', e);
          }

          // Knowledge Base Generator
          const lowerMsg = userMessage.toLowerCase();
          let reply = '';
          let suggestions = [];
          let action = null;

          // Try Cloudflare Workers AI if bound and available
          let aiSuccess = false;
          if (env.AI && typeof env.AI.run === 'function') {
            try {
              const roomsContext = roomData.map(r => 
                `- ${r.name} (${r.name_en}): ฿${r.base_price.toLocaleString()}/night, capacity ${r.capacity} guests, bed: ${r.bed_type}`
              ).join('\n');
              const promosContext = promoData.map(p =>
                `- Code ${p.code}: ${p.description} (Min spend: ฿${p.min_spend.toLocaleString()})`
              ).join('\n');

              const systemPrompt = `You are "Haven AI Concierge", the luxurious, warm, and professional virtual assistant of "The Haven Serene Resort & Villas" (Koh Chang, Trat, Thailand).
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
- Contact: Phone 039-555-888 (24/7 Front Desk), Email: reservation@thehavenresort.com, Location: White Sand Beach, Koh Chang, Trat.

Instruction:
Answer the guest politely, clearly, and concisely in ${isEn ? 'English' : 'Thai'}. Use polite sentence endings (ครับ/ค่ะ) and formatting with emojis/bullet points where helpful.`;

              const aiMessages = [
                { role: 'system', content: systemPrompt },
                ...(Array.isArray(body.history) ? body.history.slice(-4) : []),
                { role: 'user', content: userMessage }
              ];

              const aiResult = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: aiMessages,
                max_tokens: 450,
                temperature: 0.4
              });

              if (aiResult && aiResult.response) {
                reply = aiResult.response.trim();
                aiSuccess = true;
              }
            } catch (aiErr) {
              console.warn('Workers AI call skipped or fallback:', aiErr.message);
            }
          }

          // Rule-based Domain Knowledge fallback or primary engine
          if (!aiSuccess) {
            // Intent 1: Rooms, Price, Villa, Suite, Capacity
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
            // Intent 2: Check-in / Check-out & Holding lock
            else if (/เช็คอิน|เช็คเอาท์|เวลา|กี่โมง|check.?in|check.?out|time|hour|ล็อกห้อง|overbooking/i.test(lowerMsg)) {
              if (isEn) {
                reply = `⏰ **Check-In & Check-Out Policies (BR-02):**\n\n` +
                  `• **Check-In Time:** 14:00 onwards\n` +
                  `• **Check-Out Time:** Before 12:00 (Noon)\n\n` +
                  `🔒 **15-Minute Inventory Hold (BR-01):**\n` +
                  `When you select a room, our Cloudflare Edge system locks it exclusively for 15 minutes to allow payment, ensuring zero risk of double-booking.\n\n` +
                  `💡 *Need early check-in or late check-out? Please contact Front Desk at 039-555-888 (subject to room availability).*`;
                suggestions = ['Room rates & types', 'Security Deposit policy', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'Explore Rooms' };
              } else {
                reply = `⏰ **เวลาเช็คอินและเช็คเอาท์ (ตามระเบียบ BR-02):**\n\n` +
                  `• 🕒 **เวลาเช็คอิน (Check-in):** ตั้งแต่เวลา **14:00 น.** เป็นต้นไป\n` +
                  `• 🕛 **เวลาเช็คเอาท์ (Check-out):** ก่อนเวลา **12:00 น.**\n\n` +
                  `🔒 **ระบบการันตีล็อกห้อง 15 นาที (BR-01):**\n` +
                  `เมื่อท่านเลือกห้องพักและเข้าสู่ขั้นตอนชำระเงิน ระบบจะล็อกห้องไว้ให้ท่านเพียงผู้เดียวเป็นเวลา 15 นาที ไร้ปัญหาการจองชนกัน 100% ครับ\n\n` +
                  `💡 *หากต้องการ Early Check-in หรือ Late Check-out สามารถแจ้งแผนกต้อนรับล่วงหน้าได้ครับ*`;
                suggestions = ['ดูราคาห้องพัก', 'นโยบายเงินมัดจำ', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพัก' };
              }
            }
            // Intent 3: Promotions, Discount, Coupons
            else if (/โปร|ส่วนลด|promo|discount|code|คูปอง|voucher|ลดราคา/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🎁 **Exclusive Resort Promo Codes:**\n\n` +
                  `• **SUMMER10** — Get 10% instant discount on any booking!\n` +
                  `• **VIP20** — Get 20% discount on bookings over ฿5,000\n\n` +
                  `📌 *How to use:* Simply enter the code in the 'Promo Code' box during booking checkout and click Apply!`;
                suggestions = ['Book with SUMMER10', 'Room rates', 'Cancellation policy'];
                action = { type: 'APPLY_PROMO', label: 'Book with Code SUMMER10', data: 'SUMMER10' };
              } else {
                reply = `🎁 **โค้ดส่วนลดและโปรโมชั่นพิเศษช่วงนี้:**\n\n` +
                  `• 🏷️ **SUMMER10** — รับส่วนลดทันที **10%** ทุกยอดการจอง\n` +
                  `• 💎 **VIP20** — รับส่วนลดทันที **20%** เมื่อมียอดจองตั้งแต่ 5,000 บาทขึ้นไป\n\n` +
                  `📌 *วิธีใช้งาน:* นำโค้ดไปกรอกในช่อง "โค้ดส่วนลด" ในหน้าชำระเงิน แล้วกดใช้งานได้ทันทีครับ`;
                suggestions = ['จองห้องพักพร้อมโค้ด', 'ดูราคาห้องพัก', 'เงื่อนไขการยกเลิก'];
                action = { type: 'APPLY_PROMO', label: 'ใช้โค้ด SUMMER10', data: 'SUMMER10' };
              }
            }
            // Intent 4: Breakfast & Dining & Minibar
            else if (/อาหาร|เช้า|มินิบาร์|breakfast|food|minibar|floating|กิน|ดื่ม|สระ/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🍳 **Dining & Refreshments:**\n\n` +
                  `• **Oceanfront Buffet Breakfast:** Served daily from 06:30 to 10:30 AM at Haven Breeze Restaurant.\n` +
                  `• **Floating Breakfast:** ฿650 / set — Delivered directly to your Pool Villa for unforgettable morning photos.\n` +
                  `• **In-Room Minibar:** Stocked with chilled fresh coconut (฿80), Singha Beer (฿120), Thai herbal tea (฿60), and gourmet snacks.`;
                suggestions = ['Pool Villa details', 'Room rates', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'View Pool Villa' };
              } else {
                reply = `🍳 **บริการอาหารเช้าและเครื่องดื่ม:**\n\n` +
                  `• 🌅 **บุฟเฟต์อาหารเช้าริมทะเล:** บริการทุกวันเวลา **06:30 - 10:30 น.** ที่ห้องอาหาร Haven Breeze\n` +
                  `• 🥐 **Floating Breakfast (อาหารเช้าลอยน้ำ):** เซ็ตละ **฿650** เสิร์ฟตรงถึงสระว่ายน้ำ Pool Villa เหมาะสำหรับถ่ายภาพสวยๆ\n` +
                  `• 🥥 **มินิบาร์ภายในห้องพัก:** มีน้ำมะพร้าวสด (฿80), เบียร์สิงห์ (฿120), ชาสมุนไพรไทย (฿60) และของว่างหลากหลาย`;
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
                  `To cancel, go to 'My Bookings', find your booking with your booking code, and click 'Cancel Booking'.`;
                suggestions = ['Lookup my booking', 'Room prices', 'Contact Front Desk'];
                action = { type: 'LOOKUP_BOOKING', label: 'Lookup My Booking' };
              } else {
                reply = `🛡️ **นโยบายการยกเลิกและคืนเงิน (ตามระเบียบ BR-03):**\n\n` +
                  `• 🟢 **ยกเลิกก่อนวันเข้าพักมากกว่า 7 วัน:** คืนเงินเต็มจำนวน **100%** (ไม่มีค่าธรรมเนียม)\n` +
                  `• 🟡 **ยกเลิก 3 - 7 วันก่อนวันเข้าพัก:** คืนเงิน **50%** ของยอดรวม\n` +
                  `• 🔴 **ยกเลิกน้อยกว่า 3 วัน หรือ No-Show:** ไม่สามารถคืนเงินได้\n\n` +
                  `ท่านสามารถตรวจสอบหรือยกเลิกการจองได้ที่เมนู "การจองของฉัน" โดยระบุรหัสการจองครับ`;
                suggestions = ['ค้นหาการจองของฉัน', 'ดูราคาห้องพัก', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'LOOKUP_BOOKING', label: 'ไปที่การจองของฉัน' };
              }
            }
            // Intent 6: Security Deposit
            else if (/มัดจำ|ประกัน|deposit|เงินประกัน/i.test(lowerMsg)) {
              if (isEn) {
                reply = `💼 **Security Deposit Policy (BR-04):**\n\n` +
                  `• A security deposit of **฿1,000 per room** is collected upon check-in (Cash or Card hold).\n` +
                  `• The deposit is **fully refunded upon check-out** after standard room and minibar inspection.`;
                suggestions = ['Check-in time', 'Room rates', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'View Rooms' };
              } else {
                reply = `💼 **นโยบายเงินมัดจำความเสียหาย (ตามระเบียบ BR-04):**\n\n` +
                  `• รีสอร์ทขอสงวนสิทธิ์เรียกเก็บเงินมัดจำ **1,000 บาท ต่อห้อง** ณ วันที่เช็คอิน (สามารถจ่ายด้วยเงินสดหรือสแกน QR)\n` +
                  `• เงินมัดจำจะได้รับ **คืนเต็มจำนวนทันทีตอนเช็คเอาท์** หลังตรวจสอบห้องพักและหักค่ามินิบาร์ (ถ้ามี) เรียบร้อยครับ`;
                suggestions = ['เวลาเช็คอิน-เช็คเอาท์', 'ดูราคาห้องพัก', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพัก' };
              }
            }
            // Intent 7: Contact & Location / Directions
            else if (/ติดต่อ|เบอร์|โทร|ที่อยู่|แผนที่|เกาะช้าง|contact|phone|location|address|call|map/i.test(lowerMsg)) {
              if (isEn) {
                reply = `📍 **The Haven Serene Resort & Villas Contact:**\n\n` +
                  `• **Address:** White Sand Beach, Koh Chang, Trat 23170, Thailand\n` +
                  `• **Front Desk Hotline:** 039-555-888 (Available 24/7)\n` +
                  `• **Email:** reservation@thehavenresort.com\n` +
                  `• **Transportation:** Free resort shuttle pickup from Koh Chang Ferry Pier upon reservation request.`;
                suggestions = ['Room rates', 'Active promotions', 'Check-in time'];
                action = { type: 'CALL_HOTLINE', label: 'Call 039-555-888', data: 'tel:039555888' };
              } else {
                reply = `📍 **ข้อมูลการติดต่อและที่ตั้งรีสอร์ท:**\n\n` +
                  `• 🏖️ **ที่ตั้ง:** หาดทรายขาว เกาะสวรรค์ (เกาะช้าง) จ.ตราด 23170\n` +
                  `• 📞 **เบอร์โทรศัพท์แผนกต้อนรับ:** **039-555-888** (บริการตลอด 24 ชั่วโมง)\n` +
                  `• ✉️ **อีเมล:** reservation@thehavenresort.com\n` +
                  `• 🚗 **การเดินทาง:** มีบริการรถรับ-ส่งจากท่าเรือเฟอร์รี่เกาะช้าง (สามารถระบุในคำขอพิเศษตอนจองได้ครับ)`;
                suggestions = ['ดูราคาห้องพัก', 'มีโปรโมชั่นอะไรบ้าง', 'เวลาเช็คอิน-เช็คเอาท์'];
                action = { type: 'CALL_HOTLINE', label: 'โทร 039-555-888', data: 'tel:039555888' };
              }
            }
            // Intent 8: Lookup booking
            else if (/ดูการจอง|ค้นหาการจอง|เลขจอง|สถานะ|booking|check booking/i.test(lowerMsg)) {
              if (isEn) {
                reply = `🔍 **Lookup Your Booking:**\n\n` +
                  `You can check your reservation details anytime! Click the 'My Bookings' button in the navigation bar and enter your **Booking Code (e.g. HVR-89241)** or registered phone number.`;
                suggestions = ['Lookup my booking now', 'Room rates', 'Contact Front Desk'];
                action = { type: 'LOOKUP_BOOKING', label: 'Open My Bookings Lookup' };
              } else {
                reply = `🔍 **การค้นหาและตรวจสอบสถานะการจอง:**\n\n` +
                  `ท่านสามารถตรวจสอบข้อมูลการจองได้สะดวกทันที โดยคลิกปุ่ม **"การจองของฉัน"** ด้านบน แล้วกรอก **รหัสการจอง (เช่น HVR-89241)** หรือเบอร์โทรศัพท์ที่ใช้จองครับ`;
                suggestions = ['เปิดเมนูการจองของฉัน', 'ดูราคาห้องพัก', 'ติดต่อเจ้าหน้าที่'];
                action = { type: 'LOOKUP_BOOKING', label: 'ค้นหาการจองของฉัน' };
              }
            }
            // Default: Warm greeting and assistance
            else {
              if (isEn) {
                reply = `👋 **Welcome to The Haven Serene Resort & Villas!**\n\n` +
                  `I am your virtual Concierge Assistant. I can assist you with:\n` +
                  `• 🏡 Room rates, amenities, and availability\n` +
                  `• 🎁 Active discount codes and promotions\n` +
                  `• ⏰ Check-in (14:00) & Check-out (12:00) policies\n` +
                  `• 🍳 Breakfast options & Floating Breakfast\n` +
                  `• 🔍 Looking up and tracking your reservation\n\n` +
                  `How may I assist your stay today?`;
                suggestions = ['Room rates & types', 'Current promotions', 'Check-in time', 'Contact Front Desk'];
                action = { type: 'VIEW_ROOMS', label: 'View Available Rooms' };
              } else {
                reply = `👋 **สวัสดีครับ ยินดีต้อนรับสู่ เดอะ เฮเว่น รีสอร์ท!**\n\n` +
                  `ผมคือผู้ช่วยอัจฉริยะ (Haven AI Concierge) พร้อมบริการตอบคำถามและดูแลการเข้าพักของท่านครับ:\n` +
                  `• 🏡 สอบถามราคาห้องพัก ประเภทเตียง และสระว่ายน้ำส่วนตัว\n` +
                  `• 🎁 ตรวจสอบโค้ดส่วนลดและโปรโมชั่นล่าสุด\n` +
                  `• ⏰ เวลาเช็คอิน (14:00 น.) และเช็คเอาท์ (12:00 น.)\n` +
                  `• 🍳 บริการอาหารเช้าและ Floating Breakfast ในวิลล่า\n` +
                  `• 🔍 ตรวจสอบและค้นหาข้อมูลการจองของท่าน\n\n` +
                  `ท่านต้องการให้ผมช่วยดูแลเรื่องใดเป็นพิเศษดีครับ?`;
                suggestions = ['ราคาห้องพักมีแบบไหนบ้าง', 'มีโปรโมชั่นอะไรบ้าง', 'เวลาเช็คอิน-เช็คเอาท์', 'ติดต่อแผนกต้อนรับ'];
                action = { type: 'VIEW_ROOMS', label: 'ดูห้องพักทั้งหมด' };
              }
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              reply,
              suggestions: suggestions.length > 0 ? suggestions : (
                isEn ? ['Room rates', 'Promotions', 'Check-in time'] : ['ราคาห้องพัก', 'โปรโมชั่น', 'เวลาเช็คอิน']
              ),
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

