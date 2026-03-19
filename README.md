# Digital Nepal - Gaming Top-Up Store

A premium, high-performance web application for gaming currency top-ups.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (Auth, DB, Storage, Edge Functions)
- **Notifications**: Telegram Bot API

## Project Highlights
- **Premium UI**: Minimalist monochrome design with custom infinite-scroll marquee.
- **Admin Dashboard**: Real-time order management with revenue/profit analytics.
- **Optimized Performance**: Automated client-side image compression for proof-of-payment uploads.
- **Instant Alerts**: Telegram notifications for new orders via Supabase Edge Functions.

## Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### 2. Supabase Configuration
- **Database**: Run the migration in `supabase/migrations` (already applied).
- **Storage**: The `screenshots` bucket is configured (public read).
- **Edge Functions**:
  - Set secrets via Supabase Dashboard or CLI:
    - `TELEGRAM_BOT_TOKEN`: `8608420199:AAHpXh9hxK6jeS3RXhy0n8LmY_EnnlVDWPQ`
    - `TELEGRAM_CHAT_ID`: `8466967948`

## Project Structure
- `frontend/src/pages`: Home, Selection, Checkout, Admin, Success.
- `frontend/src/components`: UI components (Marquee, GameCard, etc.).
- `frontend/src/hooks`: Real-time order subscriptions.
- `supabase/functions`: Notification logic.
- `supabase/migrations`: Database schema and RLS policies.
