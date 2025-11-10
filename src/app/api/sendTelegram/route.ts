import { NextResponse } from "next/server";

// ⚠️ Node.js runtime
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
      return NextResponse.json(
        { success: false, error: "Missing token or chatId" },
        { status: 500 }
      );
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const message = formData.get("message") as string;
      const file = formData.get("photo") as File | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const form = new FormData();
        form.append("chat_id", chatId);
        form.append("caption", message || "New order 📦");
        form.append("photo", new Blob([buffer]), (file as any).name || "photo.jpg");

        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.description || "Failed to send photo");
      } else {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: message }),
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.description || "Failed to send message");
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request type" },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Telegram send error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
