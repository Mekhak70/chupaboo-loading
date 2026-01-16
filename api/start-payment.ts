import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, phone, email, product, amount } = req.body;

  const orderId = `ORD-${Date.now()}`;

  const paymentUrl = `https://bank-payment-page.am/pay?orderId=${orderId}&amount=${amount}`;

  res.status(200).json({ paymentUrl });
}
