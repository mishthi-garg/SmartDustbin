import { createClient } from 'npm:@supabase/supabase-js@2'

const TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const CHAT_ID = Deno.env.get('TELEGRAM_GUARD_CHAT_ID')!
const HOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!

// SUPABASE_URL and SERVICE_ROLE_KEY are injected automatically
const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const NIGHT_START = 22   // 10 pm IST
const NIGHT_END = 6      // 6 am IST

function isNightIST(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata',
    }).format(new Date())
  )
  return hour >= NIGHT_START || hour < NIGHT_END
}

Deno.serve(async (req) => {
  // the anon key is public, so a JWT check alone isn't security: use our own secret
  if (req.headers.get('x-webhook-secret') !== HOOK_SECRET) {
    return new Response('forbidden', { status: 403 })
  }

  const { type, table, record: a } = await req.json()
  if (type !== 'INSERT' || table !== 'alerts') return new Response('ignored')
  if (a.type !== 'fire' && a.type !== 'animal') return new Response('not a guard alert')
  if (a.type === 'animal' && !isNightIST()) return new Response('daytime animal alert: skipped')

  const { data: bin } = await sb
    .from('bins').select('name, lat, lng').eq('id', a.bin_id).single()
  const name = bin?.name ?? a.bin_id
  const map = bin ? `\nhttps://www.google.com/maps?q=${bin.lat},${bin.lng}` : ''

  const text =
    a.type === 'fire'
      ? `🔥 FIRE / SMOKE ALERT\nBin: ${name}\n${a.message ?? ''}\nGo and check immediately.${map}`
      : `🐾 Animal activity (night)\nBin: ${name}\nTime: ${new Date(a.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}${map}`

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: true }),
  })

  if (!res.ok) {
    console.error('telegram failed', res.status, await res.text())
    return new Response('telegram error', { status: 502 })
  }
  return new Response('sent')
})