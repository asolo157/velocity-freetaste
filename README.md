# Velocity Talent — Free Taste Tool

AI-powered sourcing memo + interview guide generator. Paste a job description, get a complete client-ready package in seconds.

---

## Deploy to Vercel (10 minutes)

### Step 1 — Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Click **API Keys** in the left sidebar → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — you'll need it in Step 4

> **Cost:** Claude Sonnet costs roughly $0.003 per generation. A busy day of 50 generations = ~$0.15.

---

### Step 2 — Put the code on GitHub

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **New repository** → name it `velocity-freetaste` → **Create repository**
3. Upload all the files from this zip into the repository (drag and drop works on GitHub)
4. Click **Commit changes**

---

### Step 3 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account (free)
2. Click **Add New Project**
3. Select your `velocity-freetaste` repository
4. Vercel will auto-detect it as a Vite project — leave all settings as defaults
5. Click **Deploy** — it will fail on the first deploy (that's expected — no API key yet)

---

### Step 4 — Add your API key

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from Step 1 (the `sk-ant-...` one)
   - **Environment:** Production, Preview, Development (check all three)
3. Click **Save**
4. Go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

Your app is now live at `https://your-project-name.vercel.app` 🎉

---

### Step 5 — Custom domain (optional)

1. In Vercel → **Settings** → **Domains**
2. Add your domain (e.g. `tools.velocitytalent.ai`)
3. Follow Vercel's DNS instructions — usually just adding a CNAME record

---

## Run locally (for development)

```bash
# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Install Vercel CLI to run serverless functions locally
npm install -g vercel

# Run the app (frontend + API together)
vercel dev
```

Then open `http://localhost:3000`

> **Note:** `npm run dev` alone won't work because the `/api/generate` serverless function needs the Vercel runtime. Use `vercel dev` instead.

---

## Project Structure

```
velocity-freetaste/
├── api/
│   └── generate.js       ← Serverless function (API key lives here, server-side only)
├── src/
│   ├── App.jsx            ← Main React component
│   ├── index.css          ← All styles
│   └── main.jsx           ← React entry point
├── public/
│   └── index.html         ← HTML shell
├── .env.example           ← Template for environment variables
├── .gitignore
├── package.json
├── vercel.json            ← Vercel routing config
└── vite.config.js         ← Vite build config
```

## How It Works

```
Browser → POST /api/generate → Vercel Serverless Function
                                      ↓ (adds API key server-side)
                               Anthropic Claude API
                                      ↓
                               JSON response → back to browser
```

Your API key **never touches the browser**. It lives only in Vercel's environment variables on the server side.

---

## Updating the App

Any time you push changes to GitHub, Vercel automatically redeploys. No manual steps needed.
