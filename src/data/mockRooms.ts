import { Room, AddOn } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-pv-101',
    roomNumber: 'VILLA 101',
    name: 'Grand Oceanfront Pool Villa',
    type: 'POOL_VILLA',
    typeName: 'พูลวิลล่าริมทะเลส่วนตัว',
    capacity: 4,
    bedType: '1 King Bed + 2 Twin Beds',
    sizeSqM: 145,
    basePrice: 6500,
    weekendPrice: 7900,
    description: 'พูลวิลล่าส่วนตัวพร้อมสระว่ายน้ำระบบเกลือ infinity pool วิวทะเลพาโนรามา 180 องศา ระเบียงอาบแดดส่วนตัว และอ่างจากุซซี่กลางแจ้ง',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Pool', 'Free Wi-Fi High Speed', 'Outdoor Jacuzzi', 'Espresso Machine', 'Breakfast Included', 'Smart TV 65"', 'Mini Bar Free'],
    status: 'VACANT_CLEAN'
  },
  {
    id: 'room-pv-102',
    roomNumber: 'VILLA 102',
    name: 'Sunset Horizon Pool Villa',
    type: 'POOL_VILLA',
    typeName: 'พูลวิลล่าชมพระอาทิตย์ตก',
    capacity: 2,
    bedType: '1 King Bed (Super King)',
    sizeSqM: 110,
    basePrice: 5200,
    weekendPrice: 6400,
    description: 'วิลล่าสำหรับคู่รัก จุดชมพระอาทิตย์ตกที่สวยที่สุดในรีสอร์ท พร้อมสระว่ายน้ำส่วนตัวและศาลาริมน้ำสำหรับดินเนอร์ใต้แสงเทียน',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Pool', 'Romantic Sunset View', 'Free Wi-Fi', 'Bathtub with View', 'Wine Cooler', 'Bathrobe & Slippers'],
    status: 'VACANT_CLEAN'
  },
  {
    id: 'room-bf-201',
    roomNumber: 'SUITE 201',
    name: 'Beachfront Panorama Suite',
    type: 'BEACHFRONT_SUITE',
    typeName: 'สวีทติดชายหาดส่วนตัว',
    capacity: 2,
    bedType: '1 King Bed',
    sizeSqM: 75,
    basePrice: 3800,
    weekendPrice: 4600,
    description: 'ก้าวเท้าสัมผัสผืนทรายเพียง 10 ก้าวจากระเบียงห้องพัก ห้องสวีทกว้างขวางตกแต่งด้วยไม้สักธรรมชาติ ผ่อนคลายกับเสียงคลื่นตลอดวัน',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Direct Beach Access', 'Sea View Balcony', 'Free Wi-Fi', 'Coffee Maker', 'Complimentary Fruits', 'Rain Shower'],
    status: 'OCCUPIED'
  },
  {
    id: 'room-bf-202',
    roomNumber: 'SUITE 202',
    name: 'Azure Beachfront Suite',
    type: 'BEACHFRONT_SUITE',
    typeName: 'สวีทติดชายหาดส่วนตัว',
    capacity: 3,
    bedType: '1 King Bed + 1 Daybed',
    sizeSqM: 80,
    basePrice: 4000,
    weekendPrice: 4800,
    description: 'ห้องสวีทติดหาด พร้อม Daybed ขนาดใหญ่บนระเบียง เหมาะสำหรับการพักผ่อนแบบครอบครัวเล็กหรือเพื่อนสนิท',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Direct Beach Access', 'Daybed on Balcony', 'Free Wi-Fi', 'Safety Box', 'Bluetooth Speaker'],
    status: 'VACANT_DIRTY'
  },
  {
    id: 'room-gb-301',
    roomNumber: 'BUNGALOW 301',
    name: 'Tropical Garden Sanctuary Bungalow',
    type: 'GARDEN_BUNGALOW',
    typeName: 'บังกะโลสวนร่มรื่นทรอปิคอล',
    capacity: 2,
    bedType: '1 Queen Bed',
    sizeSqM: 55,
    basePrice: 2400,
    weekendPrice: 2900,
    description: 'สัมผัสธรรมชาติอันเงียบสงบ ล้อมรอบด้วยแมกไม้เมืองร้อนและสวนดอกไม้ สดชื่น เป็นส่วนตัว เหมาะสำหรับการพักผ่อนตัดขาดจากความวุ่นวาย',
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Garden View', 'Outdoor Shower', 'Balcony with Hammock', 'Free Wi-Fi', 'Air Conditioning'],
    status: 'CLEANING'
  },
  {
    id: 'room-dl-401',
    roomNumber: 'DELUXE 401',
    name: 'Modern Deluxe Sea & Mountain View',
    type: 'DELUXE_ROOM',
    typeName: 'ห้องดีลักซ์วิวทะเลและภูเขา',
    capacity: 2,
    bedType: '2 Twin Beds หรือ 1 King Bed',
    sizeSqM: 48,
    basePrice: 1900,
    weekendPrice: 2300,
    description: 'ห้องพักชั้นบนมองเห็นทัศนียภาพทั้งภูเขาและทะเล ตกแต่งสไตล์มินิมอลโมเดิร์น ครบครันด้วยฟังก์ชันการพักผ่อนที่ลงตัว',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Mountain & Sea View', 'Work Desk', 'Free Wi-Fi', 'Smart TV', 'Refrigerator'],
    status: 'VACANT_CLEAN'
  }
];

export const INITIAL_ADDONS: AddOn[] = [
  {
    id: 'addon-bbq',
    name: 'ชุดเตาปิ้งย่างบาร์บีคิวซีฟู้ดพรีเมียม',
    price: 890,
    unit: 'ชุด',
    description: 'พร้อมเตาปิ้งย่าง ถ่าน กุ้งแม่น้ำ ปลาหมึก หอยเชลล์ น้ำจิ้มซีฟู้ดรสเด็ด เสิร์ฟตรงถึงหน้าวิลล่า',
    icon: 'Flame'
  },
  {
    id: 'addon-floating-bf',
    name: 'เซ็ต Floating Breakfast ถ่ายรูปลอยน้ำ',
    price: 650,
    unit: 'เซ็ต (สำหรับ 2 ท่าน)',
    description: 'อาหารเช้าลอยน้ำในถาดหวายรูปหัวใจ ถ่ายรูปสวย พร้อมครัวซองต์ ผลไม้สด น้ำส้ม และกาแฟ',
    icon: 'Coffee'
  },
  {
    id: 'addon-extra-bed',
    name: 'เตียงเสริมพร้อมเซ็ตเครื่องนอนและอาหารเช้า',
    price: 600,
    unit: 'เตียง/คืน',
    description: 'เตียงพับคุณภาพสูงพร้อมฟูกหนานุ่ม ผ้าห่ม หมอน และคูปองอาหารเช้าสำหรับ 1 ท่าน',
    icon: 'BedDouble'
  },
  {
    id: 'addon-kayak',
    name: 'บริการเช่าเรือคายัค & ซับบอร์ด (Paddle Board)',
    price: 350,
    unit: 'ลำ/2 ชั่วโมง',
    description: 'พร้อมเสื้อชูชีพและอุปกรณ์พาย สนุกกับกิจกรรมทางน้ำหน้าหาดรีสอร์ท',
    icon: 'Waves'
  }
];
