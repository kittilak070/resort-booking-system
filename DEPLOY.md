# ขั้นตอนการ Deploy สู่ Cloudflare Pages แบบอัตโนมัติ (Automated Deployment Guide)

แอปพลิเคชันระบบจองและจัดการรีสอร์ท (Phase 1) รองรับการ Deploy สู่ **Cloudflare Pages** ได้ 2 รูปแบบ:

---

## วิธีที่ 1: Deploy แบบอัตโนมัติผ่าน GitHub Actions CI/CD (แนะนำสำหรับการทำงานเป็นทีม)

ระบบได้ติดตั้งไฟล์ Workflow ไว้ที่ [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) เรียบร้อยแล้ว เมื่อคุณ Push โค้ดขึ้น Branch `main` ระบบจะทำการ Build และ Deploy ขึ้น Cloudflare Pages โดยอัตโนมัติ

### ขั้นตอนการเชื่อมต่อ:
1. **สร้าง Git Remote บน GitHub:**
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

2. **ตั้งค่า Secrets บน GitHub Repository:**
   ไปที่ **Settings > Secrets and variables > Actions > New repository secret** แล้วเพิ่มตัวแปรดังนี้:
   * `CLOUDFLARE_API_TOKEN`: สร้าง API Token จาก Cloudflare Dashboard (เลือก Template: *Edit Cloudflare Workers*)
   * `CLOUDFLARE_ACCOUNT_ID`: ดู Account ID ได้จากหน้าขวามือของ Cloudflare Dashboard

3. **ผลลัพธ์:**
   ทุกครั้งที่มีการ `git push origin main` ระบบจะรัน CI/CD ตรวจสอบความถูกต้อง และ Deploy ขึ้น Cloudflare Pages ให้อัตโนมัติ พร้อมสร้าง URL (เช่น `https://resort-booking-system.pages.dev`)

---

## วิธีที่ 2: Deploy ตรงผ่าน Command Line (Wrangler CLI)

คุณสามารถ Deploy จากเครื่องของคุณเองได้ทันทีด้วย 2 คำสั่ง:

1. **เข้าสู่ระบบ Cloudflare (ทำเพียงครั้งเดียว):**
   ```bash
   npx wrangler login
   ```
   *(เบราว์เซอร์จะเปิดขึ้นมาให้กดยืนยันการเข้าสู่ระบบ)*

2. **สั่ง Build และ Deploy ทันที:**
   ```bash
   npm run deploy
   ```
   *(คำสั่งนี้จะรัน `npm run build` และเรียก `wrangler pages deploy dist --project-name=resort-booking-system`)*

---

## การทดสอบและรันในเครื่อง (Local Development)

```bash
# เริ่มต้น Development Server
npm run dev

# พรีวิวผลลัพธ์ที่ Build แล้ว
npm run preview
```
