import { Room, AddOn, Review, MinibarItem, DispatchedNotification } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-pv-101',
    roomNumber: 'VILLA 101',
    name: 'Grand Oceanfront Pool Villa',
    nameEn: 'Grand Oceanfront Pool Villa',
    type: 'POOL_VILLA',
    typeName: 'พูลวิลล่าริมทะเลส่วนตัว',
    typeNameEn: 'Private Oceanfront Pool Villa',
    capacity: 4,
    bedType: '1 King Bed + 2 Twin Beds',
    sizeSqM: 145,
    basePrice: 6500,
    weekendPrice: 7900,
    description: 'พูลวิลล่าส่วนตัวพร้อมสระว่ายน้ำระบบเกลือ infinity pool วิวทะเลพาโนรามา 180 องศา ระเบียงอาบแดดส่วนตัว และอ่างจากุซซี่กลางแจ้ง',
    descriptionEn: 'Ultra-luxurious private pool villa with saltwater infinity pool, 180-degree panoramic ocean views, sundeck, and outdoor jacuzzi.',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Pool', 'Free Wi-Fi High Speed', 'Outdoor Jacuzzi', 'Espresso Machine', 'Breakfast Included', 'Smart TV 65"', 'Mini Bar Free'],
    status: 'VACANT_CLEAN',
    rating: 4.9,
    reviewCount: 38
  },
  {
    id: 'room-pv-102',
    roomNumber: 'VILLA 102',
    name: 'Sunset Horizon Pool Villa',
    nameEn: 'Sunset Horizon Pool Villa',
    type: 'POOL_VILLA',
    typeName: 'พูลวิลล่าชมพระอาทิตย์ตก',
    typeNameEn: 'Romantic Sunset Pool Villa',
    capacity: 2,
    bedType: '1 King Bed (Super King)',
    sizeSqM: 110,
    basePrice: 5200,
    weekendPrice: 6400,
    description: 'วิลล่าสำหรับคู่รัก จุดชมพระอาทิตย์ตกที่สวยที่สุดในรีสอร์ท พร้อมสระว่ายน้ำส่วนตัวและศาลาริมน้ำสำหรับดินเนอร์ใต้แสงเทียน',
    descriptionEn: 'Intimate villa designed for couples featuring breathtaking golden sunset views, private plunge pool, and candlelit waterside pavilion.',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Pool', 'Romantic Sunset View', 'Free Wi-Fi', 'Bathtub with View', 'Wine Cooler', 'Bathrobe & Slippers'],
    status: 'VACANT_CLEAN',
    rating: 4.8,
    reviewCount: 29
  },
  {
    id: 'room-bf-201',
    roomNumber: 'SUITE 201',
    name: 'Beachfront Panorama Suite',
    nameEn: 'Beachfront Panorama Suite',
    type: 'BEACHFRONT_SUITE',
    typeName: 'สวีทติดชายหาดส่วนตัว',
    typeNameEn: 'Beachfront Panorama Suite',
    capacity: 2,
    bedType: '1 King Bed',
    sizeSqM: 75,
    basePrice: 3800,
    weekendPrice: 4600,
    description: 'ก้าวเท้าสัมผัสผืนทรายเพียง 10 ก้าวจากระเบียงห้องพัก ห้องสวีทกว้างขวางตกแต่งด้วยไม้สักธรรมชาติ ผ่อนคลายกับเสียงคลื่นตลอดวัน',
    descriptionEn: 'Step directly onto soft white sand just 10 steps from your private teakwood balcony. Unwind with soothing ocean sound.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Direct Beach Access', 'Sea View Balcony', 'Free Wi-Fi', 'Coffee Maker', 'Complimentary Fruits', 'Rain Shower'],
    status: 'OCCUPIED',
    rating: 4.7,
    reviewCount: 42
  },
  {
    id: 'room-bf-202',
    roomNumber: 'SUITE 202',
    name: 'Azure Beachfront Suite',
    nameEn: 'Azure Beachfront Suite',
    type: 'BEACHFRONT_SUITE',
    typeName: 'สวีทติดชายหาดส่วนตัว',
    typeNameEn: 'Azure Beachfront Suite',
    capacity: 3,
    bedType: '1 King Bed + 1 Daybed',
    sizeSqM: 80,
    basePrice: 4000,
    weekendPrice: 4800,
    description: 'ห้องสวีทติดหาด พร้อม Daybed ขนาดใหญ่บนระเบียง เหมาะสำหรับการพักผ่อนแบบครอบครัวเล็กหรือเพื่อนสนิท',
    descriptionEn: 'Spacious beachfront suite featuring an oversized shaded daybed balcony, ideal for small families or close friends.',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Direct Beach Access', 'Daybed on Balcony', 'Free Wi-Fi', 'Safety Box', 'Bluetooth Speaker'],
    status: 'VACANT_DIRTY',
    rating: 4.6,
    reviewCount: 24
  },
  {
    id: 'room-gb-301',
    roomNumber: 'BUNGALOW 301',
    name: 'Tropical Garden Sanctuary Bungalow',
    nameEn: 'Tropical Garden Sanctuary Bungalow',
    type: 'GARDEN_BUNGALOW',
    typeName: 'บังกะโลสวนร่มรื่นทรอปิคอล',
    typeNameEn: 'Tropical Garden Sanctuary Bungalow',
    capacity: 2,
    bedType: '1 Queen Bed',
    sizeSqM: 55,
    basePrice: 2400,
    weekendPrice: 2900,
    description: 'สัมผัสธรรมชาติอันเงียบสงบ ล้อมรอบด้วยแมกไม้เมืองร้อนและสวนดอกไม้ สดชื่น เป็นส่วนตัว เหมาะสำหรับการพักผ่อนตัดขาดจากความวุ่นวาย',
    descriptionEn: 'Immerse in lush botanical flora and tropical greenery. Peaceful, private, and complete retreat away from the city hustle.',
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Garden View', 'Outdoor Shower', 'Balcony with Hammock', 'Free Wi-Fi', 'Air Conditioning'],
    status: 'CLEANING',
    rating: 4.5,
    reviewCount: 31
  },
  {
    id: 'room-dl-401',
    roomNumber: 'DELUXE 401',
    name: 'Modern Deluxe Sea & Mountain View',
    nameEn: 'Modern Deluxe Sea & Mountain View',
    type: 'DELUXE_ROOM',
    typeName: 'ห้องดีลักซ์วิวทะเลและภูเขา',
    typeNameEn: 'Modern Deluxe Sea & Mountain View',
    capacity: 2,
    bedType: '2 Twin Beds หรือ 1 King Bed',
    sizeSqM: 48,
    basePrice: 1900,
    weekendPrice: 2300,
    description: 'ห้องพักชั้นบนมองเห็นทัศนียภาพทั้งภูเขาและทะเล ตกแต่งสไตล์มินิมอลโมเดิร์น ครบครันด้วยฟังก์ชันการพักผ่อนที่ลงตัว',
    descriptionEn: 'Upper floor deluxe room with captivating panoramic mountain and ocean views, minimalist styling and full modern amenities.',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Mountain & Sea View', 'Work Desk', 'Free Wi-Fi', 'Smart TV', 'Refrigerator'],
    status: 'VACANT_CLEAN',
    rating: 4.6,
    reviewCount: 19
  }
];

export const INITIAL_ADDONS: AddOn[] = [
  {
    id: 'addon-bbq',
    name: 'ชุดเตาปิ้งย่างบาร์บีคิวซีฟู้ดพรีเมียม',
    nameEn: 'Premium Seafood BBQ Grill Set',
    price: 890,
    unit: 'ชุด',
    description: 'พร้อมเตาปิ้งย่าง ถ่าน กุ้งแม่น้ำ ปลาหมึก หอยเชลล์ น้ำจิ้มซีฟู้ดรสเด็ด เสิร์ฟตรงถึงหน้าวิลล่า',
    icon: 'Flame'
  },
  {
    id: 'addon-floating-bf',
    name: 'เซ็ต Floating Breakfast ถ่ายรูปลอยน้ำ',
    nameEn: 'Instagrammable Floating Breakfast Set',
    price: 650,
    unit: 'เซ็ต (สำหรับ 2 ท่าน)',
    description: 'อาหารเช้าลอยน้ำในถาดหวายรูปหัวใจ ถ่ายรูปสวย พร้อมครัวซองต์ ผลไม้สด น้ำส้ม และกาแฟ',
    icon: 'Coffee'
  },
  {
    id: 'addon-extra-bed',
    name: 'เตียงเสริมพร้อมเซ็ตเครื่องนอนและอาหารเช้า',
    nameEn: 'Extra Bed with Bedding & Breakfast',
    price: 600,
    unit: 'เตียง/คืน',
    description: 'เตียงพับคุณภาพสูงพร้อมฟูกหนานุ่ม ผ้าห่ม หมอน และคูปองอาหารเช้าสำหรับ 1 ท่าน',
    icon: 'BedDouble'
  },
  {
    id: 'addon-kayak',
    name: 'บริการเช่าเรือคายัค & ซับบอร์ด (Paddle Board)',
    nameEn: 'Kayak & Stand-up Paddle Board Rental',
    price: 350,
    unit: 'ลำ/2 ชั่วโมง',
    description: 'พร้อมเสื้อชูชีพและอุปกรณ์พาย สนุกกับกิจกรรมทางน้ำหน้าหาดรีสอร์ท',
    icon: 'Waves'
  }
];

export const INITIAL_MINIBAR_ITEMS: MinibarItem[] = [
  {
    id: 'mb-01',
    name: 'เบียร์สิงห์ (กระป๋อง 330ml)',
    nameEn: 'Singha Beer (330ml Can)',
    category: 'BEVERAGE',
    price: 120,
    unit: 'กระป๋อง'
  },
  {
    id: 'mb-02',
    name: 'เบียร์ไฮเนเก้น (กระป๋อง 330ml)',
    nameEn: 'Heineken Beer (330ml Can)',
    category: 'BEVERAGE',
    price: 140,
    unit: 'กระป๋อง'
  },
  {
    id: 'mb-03',
    name: 'ไวน์แดงอิตาลี Chianti Classico (750ml)',
    nameEn: 'Italian Chianti Classico Red Wine (750ml)',
    category: 'BEVERAGE',
    price: 950,
    unit: 'ขวด'
  },
  {
    id: 'mb-04',
    name: 'น้ำแร่มีฟอง San Pellegrino (500ml)',
    nameEn: 'San Pellegrino Sparkling Water (500ml)',
    category: 'BEVERAGE',
    price: 90,
    unit: 'ขวด'
  },
  {
    id: 'mb-05',
    name: 'น้ำแร่นำเข้า Evian (500ml)',
    nameEn: 'Evian Natural Mineral Water (500ml)',
    category: 'BEVERAGE',
    price: 70,
    unit: 'ขวด'
  },
  {
    id: 'mb-06',
    name: 'ถั่วรวมอบเกลือพรีเมียม (Premium Mixed Nuts)',
    nameEn: 'Premium Roasted Mixed Nuts',
    category: 'SNACK',
    price: 80,
    unit: 'กระปุก'
  },
  {
    id: 'mb-07',
    name: 'มะพร้าวอบกรอบสูตรชาววัง (Thai Coconut Chips)',
    nameEn: 'Thai Crispy Coconut Chips',
    category: 'SNACK',
    price: 60,
    unit: 'ซอง'
  },
  {
    id: 'mb-08',
    name: 'ชุดอโรมาเธอราพี & สปา The Haven Luxury',
    nameEn: 'The Haven Luxury Aroma Spa Kit',
    category: 'AMENITY',
    price: 350,
    unit: 'เซ็ต'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    roomId: 'room-pv-101',
    guestName: 'คุณธนกฤต มงคลสุข',
    rating: 5,
    cleanlinessRating: 5,
    comment: 'สระว่ายน้ำสวยมาก วิวทะเล 180 องศาไม่มีอะไรมาบดบัง อาหารเช้าแบบ Floating Breakfast อร่อยและถ่ายรูปสวยมาก พนักงานบริการเป็นกันเองสุดๆ',
    stayDate: '2026-09-20',
    createdAt: '2026-09-22T10:30:00Z'
  },
  {
    id: 'rev-02',
    roomId: 'room-pv-101',
    guestName: 'Sarah Jenkins',
    rating: 5,
    cleanlinessRating: 5,
    comment: 'Absolutely spectacular oceanfront villa! The salt-water pool was spotless and the sunset was pure magic. Will definitely return next year.',
    stayDate: '2026-09-15',
    createdAt: '2026-09-17T14:15:00Z'
  },
  {
    id: 'rev-03',
    roomId: 'room-pv-102',
    guestName: 'คุณภัทรินทร์ ชัยเวช',
    rating: 5,
    cleanlinessRating: 5,
    comment: 'พาแฟนมาฉลองครบรอบ 3 ปี บรรยากาศโรแมนติกมาก พระอาทิตย์ตกหน้าห้องสวยจนลืมหายใจ บริการเตาบาร์บีคิวก็ยอดเยี่ยมครับ',
    stayDate: '2026-09-24',
    createdAt: '2026-09-25T09:00:00Z'
  },
  {
    id: 'rev-04',
    roomId: 'room-bf-201',
    guestName: 'คุณวราภรณ์ สุวรรณสิทธิ์',
    rating: 4,
    cleanlinessRating: 5,
    comment: 'ห้องพักกว้างขวาง ระเบียงเดินลงหาดได้เลย ทรายขาวนุ่มมาก เงียบสงบ เตียงนอนสบายมากค่ะ',
    stayDate: '2026-09-18',
    createdAt: '2026-09-20T16:20:00Z'
  },
  {
    id: 'rev-05',
    roomId: 'room-gb-301',
    guestName: 'David Miller',
    rating: 5,
    cleanlinessRating: 4,
    comment: 'Such a peaceful oasis surrounded by lush tropical nature. Outdoor shower and hammock were the highlights of our stay.',
    stayDate: '2026-09-10',
    createdAt: '2026-09-12T11:45:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: DispatchedNotification[] = [
  {
    id: 'notif-01',
    type: 'SMS',
    recipient: '081-234-5678',
    title: 'ยืนยันการจองห้องพักสำเร็จ',
    message: 'The Haven Resort: การจองรหัส HVR-89241 ได้รับการยืนยันแล้ว ขอให้ท่านเดินทางโดยสวัสดิภาพ โทร 039-555-888',
    bookingCode: 'HVR-89241',
    timestamp: '2026-09-28 10:15:22'
  },
  {
    id: 'notif-02',
    type: 'EMAIL',
    recipient: 'somchai@email.com',
    title: 'Booking Voucher & QR Code Confirmation (HVR-89241)',
    message: 'เรียน คุณสมชาย มิ่งขวัญ ทาง The Haven Resort ขอส่งเอกสารยืนยันและ QR Code สำหรับการ Check-in วันที่ 2026-10-01',
    bookingCode: 'HVR-89241',
    timestamp: '2026-09-28 10:15:25'
  }
];
