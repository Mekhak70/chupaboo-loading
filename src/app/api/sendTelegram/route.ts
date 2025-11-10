import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    const token = '8570155850:AAEcJ5ExCVBdYhn5V_ITnwirbYqVABf8w7c';
    const chatIds = [1630974229, 596488469];

    if (!token || chatIds.length === 0) {
      return NextResponse.json({ success: false, error: "Missing token or chatId" }, { status: 500 });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const message = (formData.get("message") as string) || "New order 📦";
      const file = formData.get("photo") as File | null;

      for (const chatId of chatIds) {
        if (file) {
          const form = new FormData();
          form.append("chat_id", chatId.toString());
          form.append("caption", message);
          form.append("photo", file);

          const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: "POST",
            body: form,
          });
          const data = await res.json();
          if (!data.ok) throw new Error(data.description);
        } else {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message }),
          });
          const data = await res.json();
          if (!data.ok) throw new Error(data.description);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid request type" }, { status: 400 });
  } catch (err: unknown) { // ✅ вместо any используем unknown
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Telegram send error:", err);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
