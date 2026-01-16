import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function POST(req: Request) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Missing env variables")
    }

    const { name, email, message } = await req.json()

    const text = `
<b>Նոր հաղորդագրություն հաճախորդից</b>

<b>Անուն:</b> ${name}
<b>Էլ. հասցե:</b> ${email}
<b>Հաղորդագրություն:</b>
${message}
    `

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    )

    if (!telegramRes.ok) {
      const errorText = await telegramRes.text()
      throw new Error(errorText)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Telegram error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
