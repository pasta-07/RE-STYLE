# 🌿 Re:Style 2.0 — AI Circular Fashion Atelier & Sustainable Maker Platform

[![CI Verification](https://github.com/pasta-07/RE-STYLE/actions/workflows/ci.yml/badge.svg)](https://github.com/pasta-07/RE-STYLE/actions/workflows/ci.yml)
[![Live Production](https://img.shields.io/badge/Vercel-Live%20Demo-253247?logo=vercel)](https://fleet-khaki-pgud4ad.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passed-emerald)](tests/re_style_2.test.js)

An AI-augmented creative atelier, textile scrap inventory, and circular pattern generator transforming fabric remnants into bespoke zero-waste goods. Powered by **Google Gemini Multimodal Vision**, **TinyFish Real-Time Trend Research**, **PDFKit Editorial Export**, and **React 19 + TypeScript + Express 5**.


---

## ✨ What's New in Re:Style 2.0

### 1. 🧵 Scrap Inventory — My Fabric Stash
- **Comprehensive Textile Cataloging**: Track remnant dimensions ($L \times W$), fiber type, weave structure, estimated GSM, tactile drape, condition, and storage location.
- **Dynamic Availability Engine**: Automatically updates quantities (`total`, `available`, `reserved`, `consumed`) with duplicate-consumption safeguards.
- **Remnant Scraps Ingestion**: Log confirmed leftover pieces directly back into your stash upon completing a project.

### 2. 📐 Personalised Project Planner
- **Intelligent Surface Feasibility**: Evaluates whether available fabric square area ($m^2$) comfortably fits, tightly fits, or requires scrap piecing for any project pattern.
- **Pattern Cutting Blueprints**: Detailed piece dimensions, seam allowances, and cutting layout guidance tailored to your exact remnant.
- **Multi-Factor Filtering**: Filter projects by difficulty (*Beginner*, *Intermediate*, *Artisan*), estimated crafting time, and target category.

### 3. 💾 Save, Export & Public Project Sharing
- **Persistent Project Storage**: Save AI-generated and curated blueprints with customized notes and material allocations.
- **Editorial Printable PDF Blueprints**: Generate high-resolution, print-ready PDF instructions with cutting plans, material checklists, and QR/share references.
- **Secure Shareable Links**: Generate public read-only URLs (`/share/:token`) with one-click revocation.

### 4. 🪡 Maker Progress Log & Circular Impact Dashboard
- **Step-by-Step Checklists**: Interactive step toggles that automatically compute project progress percentage.
- **Crafting Session Time Logger**: Track multiple sewing and crafting sessions with minute-by-minute duration tracking.
- **Cumulative Environmental Accounting**: Real-time metrics tracking total textile weight diverted from landfills, estimated water saved, and carbon offset.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti, Vite 8 |
| **Backend** | Node.js 20+, Express 5, PDFKit, `node-fetch`, `dotenv` |
| **AI Vision & LLM** | Google Gemini Multimodal Vision (`gemini-3.6-flash`, `gemini-3.7-flash`, `gemini-flash-lite`) |
| **Live Web Trends** | TinyFish Real-Time Search API |
| **Data Engine** | Serverless-resilient JSON Store with `/tmp` routing on AWS Lambda / Vercel |
| **Deployment** | Vercel Serverless & 1-Click Render.com Web Service (`render.yaml`) |

---

## 📡 REST API Reference

### Core AI & Vision
- `POST /api/inspect-fabric-image` — Multimodal textile grain, weave, and GSM inspection.
- `POST /api/generate-designs` — Synthesizes 5 zero-waste concepts backed by live TinyFish fashion trends.

### Fabric Stash Inventory
- `GET /api/fabrics` — Filter fabrics by material, availability, condition, search query.
- `POST /api/fabrics` — Add a new remnant piece with dimensions and properties.
- `PUT /api/fabrics/:id` — Update remnant dimensions, notes, or storage details.
- `DELETE /api/fabrics/:id` — Remove an unreserved fabric from inventory.
- `POST /api/fabrics/:id/reserve` — Reserve fabric quantity for an active project.
- `POST /api/fabrics/:id/consume` — Permanently mark fabric consumed.

### Project Planner & Maker Log
- `POST /api/recommendations` — Feasibility-ranked project recommendations for a specific fabric.
- `GET /api/projects` — Retrieve saved user projects.
- `POST /api/projects` — Save a recommended blueprint to the user's workspace.
- `GET /api/projects/:id` — Get full project details with steps and sessions.
- `PATCH /api/projects/:id/steps` — Toggle step completion status and update progress.
- `POST /api/projects/:id/sessions` — Log crafting session time and notes.
- `POST /api/projects/:id/complete` — Finalize project, confirm leftovers, and add scraps back to stash.
- `GET /api/projects/:id/export/pdf` — Stream printable editorial PDF blueprint.
- `POST /api/projects/:id/share` — Create a secure public share token.
- `GET /api/shared/projects/:token` — Public read-only project endpoint.
- `DELETE /api/shared/projects/:token` — Revoke public access token.
- `GET /api/maker-stats` — Cumulative sustainability metrics and workshop totals.

---

## 🧪 Automated Test Suite

Re:Style 2.0 includes a 19-test end-to-end integration suite covering all core requirements:

```bash
# Run the automated test suite
npm test
```

```text
================================================================
🧪 Re:Style 2.0 Comprehensive Automated Integration Test Suite
================================================================
▶ 1.1 Stash — Add fabric piece with dimensions and properties... ✅ PASSED
▶ 1.2 Stash — Reject invalid dimensions and negative quantities... ✅ PASSED
▶ 1.3 Stash — Edit fabric dimensions and notes... ✅ PASSED
▶ 1.4 Stash — Filter fabrics by material and availability... ✅ PASSED
▶ 1.5 Stash — Reserve fabric quantity and prevent negative availability... ✅ PASSED
▶ 1.6 Stash — Consume fabric and prevent double-consumption... ✅ PASSED
▶ 2.1 Planner — Recommend feasible projects that fit available fabric... ✅ PASSED
▶ 2.2 Planner — Reject or penalize projects when fabric is insufficient... ✅ PASSED
▶ 2.3 Planner — Handle unknown dimensions with transparency... ✅ PASSED
▶ 3.1 Projects — Save a recommended blueprint persistently... ✅ PASSED
▶ 3.2 Projects — Retrieve saved project and verify persistent state... ✅ PASSED
▶ 3.3 Projects — Export printable PDF blueprint... ✅ PASSED
▶ 3.4 Projects — Create secure share token and fetch public read-only blueprint... ✅ PASSED
▶ 3.5 Projects — Revoke share link and verify subsequent 404... ✅ PASSED
▶ 4.1 Progress — Toggle instruction steps and verify progress calculation... ✅ PASSED
▶ 4.2 Progress — Log multiple crafting time sessions... ✅ PASSED
▶ 4.3 Leftovers — Complete project and record confirmed scrap pieces... ✅ PASSED
▶ 4.4 Dashboard — Fetch verified Maker Stats and sustainability metrics... ✅ PASSED
▶ 5.1 Regression — Health check returns all 2.0 endpoints... ✅ PASSED

================================================================
🏁 Test Summary: 19/19 tests passed
================================================================
```

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/pasta-07/RE-STYLE.git
cd RE-STYLE
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
PORT=5000
TINYFISH_API_KEY=your_tinyfish_api_key
LLM_API_KEY=your_gemini_api_key
```

### 3. Run Development Server
```bash
# Launch backend API (port 5000) and Vite frontend (port 5173) concurrently
npm run dev:all
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🚢 Production Deployment

### Vercel Serverless
The repository includes [`vercel.json`](vercel.json) with unified API rewrites:
```bash
npx vercel --prod
```

### Render.com Web Service
Uses the included [`render.yaml`](render.yaml) blueprint:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.js`
- **Environment**: Node 20+

### Docker Container
```bash
docker build -t re-style .
docker run -p 5000:5000 --env-file .env re-style
```
Visit **http://localhost:5000**.
