import { NextResponse } from "next/server";

async function sendTelegramMessage(token: string, chatId: string, message: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Failed to send message");
  return data;
}

async function sendTelegramPhoto(token: string, chatId: string, file: File, caption: string) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption || "New order 📦");
  form.append("photo", file);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Failed to send photo");
  return data;
}

export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { success: false, error: "Missing token or chatId" },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // JSON request support
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const message = body.message;
      if (!message) {
        return NextResponse.json(
          { success: false, error: "Missing message" },
          { status: 400 }
        );
      }

      const data = await sendTelegramMessage(token, chatId, message);
      console.log("Telegram response (JSON):", data);
      return NextResponse.json({ success: true });
    }

    // Multipart/form-data (file + message)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const message = formData.get("message") as string;
      const file = formData.get("photo") as File | null;

      if (file) {
        const data = await sendTelegramPhoto(token, chatId, file, message || "New order 📦");
        console.log("Telegram response (Photo):", data);
      } else if (message) {
        const data = await sendTelegramMessage(token, chatId, message);
        console.log("Telegram response (Text only):", data);
      } else {
        return NextResponse.json(
          { success: false, error: "No message or file provided" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Invalid request type
    return NextResponse.json(
      { success: false, error: "Invalid request type" },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Telegram send error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
