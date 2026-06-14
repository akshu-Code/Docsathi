# DocSaathi — AI Legal Document Simplifier

DocSaathi is an expert legal document analyzer designed for ordinary people to understand agreements in their own language. It operates as both a web application and an installable progressive web app (PWA) with complete offline styling.

## 🎯 Features

- **Warm-Canvas Editorial Interface:** Crafted according to premium warm editorial design rules (soft cream background, Cormorant Garamond serif headings, coral CTA voltage accent, and dark navy product mockups).
- **Risk Meter Gauge:** Large visual gauge summarizing contract risk levels (🟢 Safe, 🟡 Caution, 🔴 Red Flag).
- **Bullet-Point Summaries:** Clear second-person plain explanations written for immediate scanning.
- **Clause-by-Clause breakdown:** Accordion cards matching original clauses with plain language explanations.
- **20-Language Support:** Localized UI and explanations covering Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Urdu, Arabic, French, Spanish, Portuguese, German, Indonesian, Swahili, Vietnamese, and Turkish.
- **Follow-up Q&A Chat:** Deep contract conversation context query box.
- **PWA Capabilities:** Standalone installation with manifest configurations and cache registrations.
- **Privacy First:** Instant process in memory with rate limiting (10 requests per hour per IP) and strict CSP headers.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS (extended theme)
- **AI Engine:** Anthropic Claude API (claude-3-5-sonnet-20241022) via `@anthropic-ai/sdk`
- **PDF Extraction:** `pdf-parse`
- **Internationalization:** `next-intl` (Client Provider pattern supporting clean paths)
- **PDF Generation:** `jsPDF` + `html2canvas`

---

## 🚀 Getting Started

### 1. Set up Environment Variables
Create a file named `.env.local` inside the `docsaathi` directory:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run the Development Server
From the `docsaathi` directory:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it.

### 3. Build for Production
To build the bundle and test PWA service worker capability:
```bash
npm run build
npm run start
```
