import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const BOT_TOKEN = Deno.env.get('TELEGRAM_TOKEN')?.trim()
  const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')?.trim()

  console.log('Notification function triggered')

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      throw new Error('Missing orderId in request body')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      throw new Error(`Order not found: ${fetchError?.message ?? 'Unknown'}`)
    }

    // Prepare message
    const message = `
🛒 *NEW ORDER* — \`${order.order_id}\`

🎮 Game: *${order.game_name}*
📦 Package: *${order.package_label}*
💰 Amount: *NPR ${order.price}*
🆔 Player ID: \`${order.player_id}\`${order.server_id ? `\n🌐 Server: \`${order.server_id}\`` : ''}
📝 Remark: ${order.remark || 'No remarks'}
⏰ Time: ${new Date(order.created_at).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}
    `

    // Send text message
    const textResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!textResp.ok) {
      const errorData = await textResp.json()
      console.error('Telegram Text Error:', errorData)
      throw new Error(`Telegram Text Error: ${JSON.stringify(errorData)}`)
    }

    // Send photo (screenshot)
    if (order.screenshot_url) {
      const photoResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          photo: order.screenshot_url,
          caption: `Payment Proof for ${order.order_id}`,
        }),
      })

      if (!photoResp.ok) {
        const errorData = await photoResp.json()
        console.error('Telegram Photo Error:', errorData)
        throw new Error(`Telegram Photo Error: ${JSON.stringify(errorData)}`)
      }
    }

    // Mark telegram_sent as true
    await supabase
      .from('orders')
      .update({ telegram_sent: true })
      .eq('id', order.id)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Edge Function Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
