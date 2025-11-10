import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId)
      return NextResponse.json({ success: false, error: "Missing token or chatId" }, { status: 500 });

    // 📩 Եթե գալիս է multipart form (նկարով)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const message = formData.get("message") as string;
      const file = formData.get("photo") as File | null;

      // 🖼️ եթե կա ֆայլ՝ ուղարկում ենք որպես `sendPhoto`
      if (file) {
        const form = new FormData();
        form.append("chat_id", chatId);
        form.append("caption", message || "New order 📦");
        form.append("photo", file);

        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.description);
      } else {
        // 💬 եթե ֆայլ չկա՝ ուղարկում ենք տեքստային հաղորդագրություն
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: message }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.description);
      }

      return NextResponse.json({ success: true });
    }

    // ⚠️ Եթե ֆորմատը սխալ է
    return NextResponse.json({ success: false, error: "Invalid request type" }, { status: 400 });
  } catch (err: any) {
    console.error("Telegram send error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
