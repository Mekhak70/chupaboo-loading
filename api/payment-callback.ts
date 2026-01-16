import type { NextApiRequest, NextApiResponse } from "next";

type CallbackRequest = {
  orderId: string;
  product: string;
  amount: number;
  status: "SUCCESS" | "FAILED";
  name: string;
  phone: string;
  email?: string;
  // bանկը կավելացնի signature կամ hash՝ ստուգման համար
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    orderId,
    product,
    amount,
    status,
    name,
    phone,
    email,
  }: CallbackRequest = req.body;

  // ⚠️ TODO: Ստուգել signature / hash այստեղ իրական բանկի դեպքում

  if (status === "SUCCESS") {
    // Telegram notification
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

    const message = `
✅ New Payment Received
Order ID: ${orderId}
Product: ${product}
Amount: ${amount} AMD
Name: ${name}
Phone: ${phone}
Email: ${email || "N/A"}
`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
      });
    } catch (err) {
      console.error("Telegram notification failed:", err);
    }
  }

  // Վերադարձնում ենք բանկին պատասխան, որ callback-ը ընդունվեց
  res.status(200).json({ received: true });
}
