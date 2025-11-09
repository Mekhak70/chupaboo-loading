import type { NextApiRequest, NextApiResponse } from "next";

type Data = { success: boolean; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") return res.status(405).end();

  const { message } = req.body;
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  if (!token || !chatId) return res.status(500).json({ success: false, error: "Missing token or chatId" });

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    res.status(200).json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: errorMessage });
  }
}
