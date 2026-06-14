# DocSaathi — Netlify Deployment Guide

## 🚀 Deploy to Netlify (3 Steps)

### Step 1 — Upload this folder to Netlify

1. Go to **[netlify.com](https://netlify.com)** and log in / sign up
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy manually"** → drag this entire `docsaathi-deploy` folder onto the Netlify drop zone

   *(Or connect via GitHub by pushing this folder to a repo first)*

---

### Step 2 — Set your Environment Variable

After upload, go to:
**Site Settings → Environment Variables → Add variable**

Add this:
| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `your_anthropic_api_key_here` |

> Get your key at: https://console.anthropic.com/settings/keys

---

### Step 3 — Trigger a Deploy

After setting the env variable:
- Go to **Deploys** tab → click **"Trigger deploy"** → **"Deploy site"**

Netlify will:
1. Run `npm install`
2. Run `npm run build`
3. Publish your live site at `https://your-site-name.netlify.app`

---

## 📌 Build Settings (auto-detected from netlify.toml)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node version | `20` |

---

## ✅ Your app is ready when you see "Published" in Netlify!
