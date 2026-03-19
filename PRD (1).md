# Product Requirements Document
## Gaming Top-Up Store — v1.0

**Status:** Draft  
**Updated:** March 2026  
**Stack:** React + Vite · Supabase · Vercel  
**Delivery:** Manual top-up by store owner

---

## 1. Overview

A web store where customers buy in-game currency for popular mobile and online games. The customer picks a game, selects a package, pays via bank transfer QR, uploads their payment screenshot, and submits their Player ID. The store owner gets an instant Telegram notification and tops up manually. An admin dashboard tracks all orders, revenue, and profit.

---

## 2. Pages & Structure

- **Home** — Landing page with featured products, banners, and promotions
- **Shop / Products** — Product listings with categories and variants
- **Product Detail Page** — Individual product info, images, price, add-to-cart
- **Cart** — Item management before checkout
- **Checkout** — Order placement with customer details
- **Order Tracking** — Real-time status updates on orders
- **FAQs / Policy** — Shop policies, terms & conditions

---

---

## 2. Goals

- Go live within 2–3 weeks
- Support 8 games at launch, easy to add more
- 100% order notification delivery via Telegram
- Track profit per game and per package from day one
- Zero backend hosting cost

---

## 3. Architecture

```
Customer Browser
      │
      ▼
React + Vite  ──── Supabase JS ──► PostgreSQL (orders)
      │                     └────► Storage (screenshots)
      │
      └──── Edge Function ────────► Telegram Bot API
```

No Express. No Railway. No Cloudinary. One Edge Function handles the Telegram notification securely so the bot token never reaches the browser.

---

## 4. User Roles

**Customer**
- Browses all games and packages without logging in
- Selects a package, views the bank QR and transfer amount
- Uploads payment screenshot and submits Player ID
- Receives an on-screen confirmation with order ID

**Admin (Store Owner)**
- Logs in at `/admin` via Supabase Auth
- Gets a Telegram notification the moment an order is placed
- Views all orders, filters by game / status / date
- Updates order status and views revenue + profit analytics

---

## 5. Game Catalog

| # | Game | Currency | ID Field |
|---|------|----------|---------|
| 1 | Free Fire | Diamonds | Player ID |
| 2 | PUBG Mobile | UC | Character ID |
| 3 | Mobile Legends | Diamonds | Player ID + Server ID |
| 4 | Clash of Clans | Gems | Player Tag |
| 5 | eFootball | Coins | Konami ID |
| 6 | TikTok | Coins | TikTok Username |
| 7 | Roblox | Robux | Roblox Username |
| 8 | UniPin | Voucher | UniPin ID |

All game and package data lives in a static `games.js` file — no database call needed for the catalog.

---

## 6. Functional Requirements

### Homepage
- Grid of 8 game cards — icon, name, currency, "Top Up" button
- Loads instantly from static data

### Infinite Scroll Marquee
- A horizontal moving marquee below the hero section
- Features high-quality images of game inventories, characters, or featured products
- Seamless loop using pure CSS animation for performance
- Stays responsive and works on mobile

### Game Page
- Lists all packages for the selected game
- Each card shows label, price (NPR), and a Select button
- Only one package selectable at a time

### QR Payment Modal
- Opens when a package is selected
- Shows bank name, account number, account holder, and exact transfer amount
- Displays the static bank QR image
- "I have paid" button closes the modal and opens the order form

### Order Form
- Player ID — required, label changes per game
- Server ID — required only for Mobile Legends
- Payment screenshot — required, image only, max 5 MB
- Remarks — optional free text
- On submit:
  1. Compress screenshot client-side to under 1 MB
  2. Upload to Supabase Storage
  3. Insert order row into Supabase DB
  4. Invoke `notify-order` Edge Function
  5. Show confirmation screen with order ID

### Telegram Notification
Sent by the Edge Function immediately after each order:

```
🛒 NEW ORDER — ORD1234567890

🎮 Game: Free Fire
📦 Package: 310 Diamonds
💰 Amount: NPR 350
🆔 Player ID: 78459322
📝 Remark: fast delivery please
⏰ Time: 12:34 PM

[Payment screenshot attached]
```

If the Edge Function fails, the order is still saved with `telegram_sent: false`. The admin can retry from the dashboard.

### Admin Dashboard (`/admin`)
Protected by Supabase Auth.

- **Overview** — total revenue, total profit, orders today, pending count
- **Orders** — full table, filter by game / status / date, search by order ID or player ID, click any row for full detail and screenshot, update status inline
- **Analytics** — revenue and profit by game (bar chart), daily order volume (line chart)
- Realtime: new orders appear without refreshing the page

---

## 7. Payment Options

- **FonePay QR** — Local QR-based payment
- **Manual QR Upload** — Direct bank transfer via uploaded QR

---

---

## 7. Data Model

```sql
CREATE TABLE orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        TEXT UNIQUE DEFAULT 'ORD' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  game            TEXT NOT NULL,
  game_name       TEXT NOT NULL,
  package_id      TEXT NOT NULL,
  package_label   TEXT NOT NULL,
  price           INTEGER NOT NULL,
  cost            INTEGER NOT NULL,
  profit          INTEGER GENERATED ALWAYS AS (price - cost) STORED,
  player_id       TEXT NOT NULL,
  server_id       TEXT,
  remark          TEXT,
  screenshot_url  TEXT NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','completed','failed')),
  telegram_sent   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON orders (status);
CREATE INDEX ON orders (game);
CREATE INDEX ON orders (created_at DESC);
```

`profit` is computed by the database — never calculated in frontend code.

### Row Level Security

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can insert, nothing else
CREATE POLICY "customers_insert" ON orders
  FOR INSERT TO anon WITH CHECK (true);

-- Admin can read and update everything
CREATE POLICY "admin_all" ON orders
  FOR ALL TO authenticated USING (true);
```

---

## 8. Security

- RLS enforces that anonymous users can only INSERT — they cannot read other orders
- Screenshots bucket: public read (needed for Telegram), authenticated write only
- Telegram bot token lives exclusively in Edge Function secrets, never in the browser
- Admin auth handled by Supabase Auth — no custom token logic

---

## 9. User Flows

**Customer**
```
Home → Pick game → Pick package
→ View QR + amount → Pay in bank app → "I have paid"
→ Enter Player ID + upload screenshot → Place Order
→ Confirmation screen with Order ID
```

**Admin**
```
Telegram ping arrives
→ Check Player ID and package
→ Top up manually in the game or supplier platform
→ Open /admin → find order → mark Completed
```

---

## 10. Risks

| Risk | Mitigation |
|------|-----------|
| Fake payment screenshot | Verify manually before topping up |
| Telegram notification fails | Order saved with `telegram_sent: false`; retry button in admin |
| Wrong Player ID submitted | Clear label and tooltip in form; remark field for corrections |
| Supabase project paused (7 days inactive on free tier) | Keep active with a weekly ping or upgrade to Pro ($25/mo) |

---

*End of PRD v1.0*
