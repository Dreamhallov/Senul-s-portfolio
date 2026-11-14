# Senul Jayaweera — Portfolio & Studio

Personal portfolio and digital studio for **Senul Jayaweera** (`senuljayaweera47@gmail.com`), focused on **Aesthetic Teacher LMS portals**, **Tutes & Study Creation**, **Daily Website Building**, and **Ongoing Customer Care**.

## Features
- **100% Free, Unlimited AI Concierge (Zero Paid API Keys)**: Deep multi-turn memory, long multi-paragraph brief parsing, image uploads (up to 4 reference images per inquiry), memory recap bar, and inquiry dispatch. Works both with the included Express backend (`/api/ai/chat`) and directly inside the browser when hosted statically on **GitHub Pages**.
- **Interactive 3D Mouse Sculpture**: Three.js faceted amethyst crystal, gyroscope wireframe rings, orbiting slates, and floating prisms synced to pointer parallax and scroll velocity.
- **Modern Geometric Sans-Serif Typography**: Strictly paired **Space Grotesk** (display headings) and **DM Sans** (UI/body copy) on a clean daylight palette (`#F4F5F0`, `#FFFFFF`, `#EAECE4`).

## 1. Deploy Free on GitHub Pages
1. Push this repository to GitHub (`main` or `master` branch).
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` builds `./dist` (`npm run build` with relative `base: './'`) and publishes your live site automatically.
4. The AI Concierge runs unlimited chat conversations with full session memory directly in the browser with `$0` API fees.

## 2. Optional Full-Stack Node Hosting (Background SMTP Email + Binary Image Attachments)
If you want the server to send emails with customer-uploaded image files attached silently in the background to `senuljayaweera47@gmail.com`:
1. Deploy to a Node.js host (Render, Railway, Fly.io, or a VPS).
2. Configure environment variables (see `.env.example`):
   - `SMTP_HOST` (e.g. `smtp.gmail.com`)
   - `SMTP_PORT` (`587`)
   - `SMTP_USER` (`senuljayaweera47@gmail.com`)
   - `SMTP_PASS` (Gmail App Password)
   - `SMTP_FROM` (`senuljayaweera47@gmail.com`)
3. Run `npm run build` and `npx tsx server.ts`.

## Local Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.
