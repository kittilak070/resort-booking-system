-- ====================================================================
-- Cloudflare D1 Database Schema: The Haven Serene Resort & Villas
-- Designed according to Skill 04 (04-database-design)
-- Engine: SQLite on Cloudflare D1 Serverless Edge
-- ====================================================================

-- 1. Rooms Table (Core Inventory)
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    room_number TEXT UNIQUE NOT NULL,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    room_type TEXT NOT NULL CHECK(room_type IN ('POOL_VILLA', 'BEACHFRONT_SUITE', 'GARDEN_BUNGALOW', 'DELUXE_ROOM')),
    type_name_th TEXT NOT NULL,
    type_name_en TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK(capacity >= 1),
    bed_type TEXT NOT NULL,
    size_sqm INTEGER NOT NULL CHECK(size_sqm > 0),
    base_price INTEGER NOT NULL CHECK(base_price >= 0),
    weekend_price INTEGER NOT NULL CHECK(weekend_price >= base_price),
    description_th TEXT NOT NULL,
    description_en TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'VACANT_CLEAN' CHECK(status IN ('VACANT_CLEAN', 'VACANT_DIRTY', 'CLEANING', 'OCCUPIED', 'MAINTENANCE')),
    current_booking_id TEXT,
    maintenance_reason TEXT,
    rating REAL NOT NULL DEFAULT 5.0 CHECK(rating BETWEEN 1.0 AND 5.0),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK(review_count >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Room Gallery Images
CREATE TABLE IF NOT EXISTS room_images (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 3. Room Amenities
CREATE TABLE IF NOT EXISTS room_amenities (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity_name TEXT NOT NULL
);

-- 4. Add-on Services Catalogue
CREATE TABLE IF NOT EXISTS add_ons (
    id TEXT PRIMARY KEY,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price INTEGER NOT NULL CHECK(price >= 0),
    unit TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1))
);

-- 5. Promo Codes (BR-02 Business Rules)
CREATE TABLE IF NOT EXISTS promo_codes (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK(discount_type IN ('PERCENT', 'FIXED')),
    discount_value INTEGER NOT NULL CHECK(discount_value > 0),
    min_spend INTEGER NOT NULL DEFAULT 0 CHECK(min_spend >= 0),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bookings (Core Transaction Entity)
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT UNIQUE NOT NULL,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    room_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_id_card TEXT, -- PII: Masked or Encrypted
    check_in_date TEXT NOT NULL, -- Format: YYYY-MM-DD
    check_out_date TEXT NOT NULL, -- Format: YYYY-MM-DD
    nights INTEGER NOT NULL CHECK(nights >= 1),
    guests_count INTEGER NOT NULL CHECK(guests_count >= 1),
    room_price INTEGER NOT NULL CHECK(room_price >= 0),
    add_on_total INTEGER NOT NULL DEFAULT 0 CHECK(add_on_total >= 0),
    applied_promo_code TEXT REFERENCES promo_codes(code),
    discount_amount INTEGER NOT NULL DEFAULT 0 CHECK(discount_amount >= 0),
    total_amount INTEGER NOT NULL CHECK(total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK(status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('PROMPTPAY_QR', 'CREDIT_CARD', 'CASH')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL, -- BR-01: 15-minute hold lock
    deposit_amount INTEGER NOT NULL DEFAULT 1000 CHECK(deposit_amount >= 0),
    deposit_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(deposit_status IN ('PENDING', 'HELD', 'REFUNDED', 'DEDUCTED')),
    check_in_time TEXT,
    check_out_time TEXT,
    special_requests TEXT,
    is_walk_in INTEGER NOT NULL DEFAULT 0 CHECK(is_walk_in IN (0, 1)),
    refund_amount INTEGER DEFAULT 0 CHECK(refund_amount >= 0),
    cancellation_reason TEXT,
    minibar_charges INTEGER DEFAULT 0 CHECK(minibar_charges >= 0)
);

-- 7. Booking Add-ons (Order Items)
CREATE TABLE IF NOT EXISTS booking_add_ons (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    add_on_id TEXT NOT NULL REFERENCES add_ons(id),
    name TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity >= 1),
    subtotal INTEGER NOT NULL
);

-- 8. Minibar Items Catalogue
CREATE TABLE IF NOT EXISTS minibar_items (
    id TEXT PRIMARY KEY,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('BEVERAGE', 'SNACK', 'AMENITY')),
    price INTEGER NOT NULL CHECK(price > 0),
    unit TEXT NOT NULL
);

-- 9. Booking Minibar Consumption (Folio Deductions)
CREATE TABLE IF NOT EXISTS booking_minibar_consumption (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    minibar_item_id TEXT NOT NULL REFERENCES minibar_items(id),
    quantity INTEGER NOT NULL CHECK(quantity >= 1),
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL
);

-- 10. Guest Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    cleanliness_rating INTEGER NOT NULL CHECK(cleanliness_rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    stay_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Maintenance Defect Tickets
CREATE TABLE IF NOT EXISTS maintenance_issues (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    reported_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REPAIR' CHECK(status IN ('PENDING_REPAIR', 'RESOLVED')),
    resolved_at TEXT
);

-- 12. Dispatched Notification Audit Logs
CREATE TABLE IF NOT EXISTS dispatched_notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('SMS', 'EMAIL')),
    recipient TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    booking_code TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES (Query-Aware Strategy)
-- ====================================================================

-- Fast booking code lookup (O(1)) for guest self-service & voucher check
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);

-- Check availability & 14-day calendar matrix queries
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(room_id, check_in_date, check_out_date, status);

-- Guest phone search index
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(guest_phone);

-- Room status filter index for Front Desk & Housekeeping views
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Review lookup by room ID
CREATE INDEX IF NOT EXISTS idx_reviews_room ON reviews(room_id);
