# Tech Stack
## Gaming Top-Up Store — v1.0

**Two services. Zero backend hosting.**  
Vercel (frontend) + Supabase (everything else).

---

## Stack Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| State | Zustand + React Query |
| Forms | React Hook Form + Zod |
| Database | Supabase PostgreSQL |
| File storage | Supabase Storage |
| Serverless | Supabase Edge Functions (Deno) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Notifications | Telegram Bot API |
| Frontend hosting | Vercel |

---

## Frontend Libraries

### Core
```
react@18              UI framework
vite@5                Build tool
react-router-dom@6    Routing — /game/:id, /admin/*
```

### Styling
```
tailwindcss@3         Utility-first, mobile-first
tailwind-merge        Conditional class merging
```

### Data & State
```
@supabase/supabase-js  DB, storage, auth, realtime — one client for everything
@tanstack/react-query  Server state, caching, loading/error handling
zustand                Global UI state (selected game, selected package)
```

### Forms & Validation
```
react-hook-form        Form state
zod                    Schema validation (file type, file size, required fields)
@hookform/resolvers    Connects RHF to Zod
```

### UI & Utilities
```
lucide-react                  Icons
react-hot-toast               Success/error toasts
recharts                      Admin bar + line charts
react-dropzone                Drag-and-drop screenshot upload
browser-image-compression     Compress screenshot to <1MB before upload
```

---

## Supabase Setup

### PostgreSQL
- Single table: `orders`
- `profit` column is a generated column (`price - cost`) — DB computes it, never the frontend
- RLS policies: anon can INSERT only; authenticated admin gets full access
- Indexes on `status`, `game`, `created_at DESC`

### Storage
- Bucket: `screenshots`
- Access: public read (Telegram needs a public URL), authenticated write
- File naming: `{orderId}-{timestamp}.jpg`
- Max size enforced at bucket level: 5 MB

### Edge Functions (Deno)
One function: `notify-order`
- Called by the frontend after a successful order insert
- Fetches the full order from DB using the service role key
- Sends a formatted text message to Telegram
- Sends the screenshot as a photo to Telegram
- Marks `telegram_sent = true` on the order row
- Bot token lives here only — never touches the browser

### Auth
- Single admin user, created once in the Supabase dashboard
- `supabase.auth.signInWithPassword()` on the login page
- All `/admin/*` routes check `supabase.auth.getUser()` — redirect if null
- No custom JWT, no bcrypt, no session management to write

### Realtime
- Admin dashboard subscribes to INSERT events on the `orders` table
- New orders appear live, toast notification fires automatically

---

## Environment Variables

### Frontend `.env`
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
```

The anon key is safe to expose in the frontend — RLS policies control what it can do.

### Edge Function Secrets (set via Supabase CLI — never in any file)
```
TELEGRAM_TOKEN=123456:ABCDEFxxxxx
TELEGRAM_CHAT_ID=987654321
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...
```

The service role key bypasses RLS — it must never reach the browser.

---

## Folder Structure

```
gaming-topup/
│
├── frontend/                        ← Deployed to Vercel
│   ├── public/
│   │   └── qr-bank.jpg              ← Static bank QR image
│   ├── src/
│   │   ├── data/
│   │   │   └── games.js             ← All games, packages, prices
│   │   ├── lib/
│   │   │   └── supabase.js          ← Supabase client
│   │   ├── components/
│   │   │   ├── GameCard.jsx
│   │   │   ├── PackageSelector.jsx
│   │   │   ├── QRModal.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   └── ScreenshotUpload.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── GamePage.jsx
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx    ← Revenue + profit stats
│   │   │       └── Orders.jsx       ← Orders table
│   │   ├── hooks/
│   │   │   ├── useOrder.js          ← Order submit flow
│   │   │   └── useAdminOrders.js    ← Orders query + realtime
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── supabase/
│   ├── functions/
│   │   └── notify-order/
│   │       └── index.ts             ← Telegram notification (Deno)
│   └── migrations/
│       └── 001_create_orders.sql    ← Schema + RLS
│
└── README.md
```

---

## Key Code

### Supabase client — `src/lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Order submit — `src/hooks/useOrder.js`
```js
import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'

export async function submitOrder({ game, pkg, playerId, serverId, remark, file }) {
  // 1. Compress screenshot
  const compressed = await imageCompression(file, { maxSizeMB: 1 })

  // 2. Upload to storage
  const filename = `${Date.now()}-${file.name}`
  const { error: uploadErr } = await supabase.storage
    .from('screenshots')
    .upload(filename, compressed)
  if (uploadErr) throw uploadErr

  const screenshotUrl = supabase.storage
    .from('screenshots')
    .getPublicUrl(filename).data.publicUrl

  // 3. Insert order
  const { data: order, error: insertErr } = await supabase
    .from('orders')
    .insert({
      game:           game.id,
      game_name:      game.name,
      package_id:     pkg.id,
      package_label:  pkg.label,
      price:          pkg.price,
      cost:           pkg.cost,
      player_id:      playerId,
      server_id:      serverId || null,
      remark:         remark || null,
      screenshot_url: screenshotUrl,
    })
    .select()
    .single()
  if (insertErr) throw insertErr

  // 4. Trigger Telegram notification
  await supabase.functions.invoke('notify-order', {
    body: { orderId: order.id }
  })

  return order
}
```

### Edge Function — `supabase/functions/notify-order/index.ts`
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TOKEN   = Deno.env.get('TELEGRAM_TOKEN')!
const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')!

serve(async (req) => {
  const { orderId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: order } = await supabase
    .from('orders').select('*').eq('id', orderId).single()

  const msg = `
🛒 *NEW ORDER* — \`${order.order_id}\`

🎮 Game: ${order.game_name}
📦 Package: ${order.package_label}
💰 Amount: NPR ${order.price}
🆔 Player ID: \`${order.player_id}\`
📝 Remark: ${order.remark || '—'}
⏰ Time: ${new Date().toLocaleTimeString()}
  `

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' })
  })

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      photo: order.screenshot_url,
      caption: `Payment proof — ${order.order_id}`
    })
  })

  await supabase.from('orders')
    .update({ telegram_sent: true }).eq('id', orderId)

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
```

### Admin realtime — `src/hooks/useAdminOrders.js`
```js
useEffect(() => {
  const channel = supabase
    .channel('orders-changes')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'orders'
    }, (payload) => {
      setOrders(prev => [payload.new, ...prev])
      toast.success(`New order: ${payload.new.order_id}`)
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

---

## Deployment

### Frontend → Vercel
```
Build command:   vite build
Output dir:      dist
Env vars:        VITE_SUPABASE_URL
                 VITE_SUPABASE_ANON_KEY
```
Push to `main` → auto-deploy.

### Edge Function → Supabase CLI
```bash
supabase functions deploy notify-order
supabase secrets set TELEGRAM_TOKEN=xxx
supabase secrets set TELEGRAM_CHAT_ID=xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## `package.json`

```json
{
  "dependencies": {
    "react":                       "^18.2.0",
    "react-dom":                   "^18.2.0",
    "react-router-dom":            "^6.20.0",
    "@supabase/supabase-js":       "^2.39.0",
    "@tanstack/react-query":       "^5.0.0",
    "zustand":                     "^4.4.0",
    "react-hook-form":             "^7.48.0",
    "zod":                         "^3.22.0",
    "@hookform/resolvers":         "^3.3.0",
    "react-dropzone":              "^14.2.3",
    "browser-image-compression":   "^2.0.2",
    "lucide-react":                "^0.300.0",
    "react-hot-toast":             "^2.4.1",
    "recharts":                    "^2.9.0",
    "tailwind-merge":              "^2.1.0"
  },
  "devDependencies": {
    "vite":                  "^5.0.0",
    "@vitejs/plugin-react":  "^4.2.0",
    "tailwindcss":           "^3.3.0",
    "autoprefixer":          "^10.4.0",
    "postcss":               "^8.4.0"
  }
}
```

---

*End of Tech Stack v1.0*
