import type { NextApiRequest, NextApiResponse } from "next";

type PaymentRequest = {
  name: string;
  email?: string;
  phone: string;
  product: string;
  amount: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, phone, product, amount }: PaymentRequest = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
  const orderId = `TEST-${Date.now()}`;

  const message = `
✅ Fake Payment Received
Order ID: ${orderId}
Product: ${product}
Amount: ${amount} AMD
Name: ${name}
Phone: ${phone}
Email: ${email || "N/A"}
`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
  });

  return res.status(200).json({ success: true, orderId });
}
