import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Telegram API response type
type TelegramResponse = {
  ok: boolean;
  description?: string;
};

// Helper: send text message
async function sendMessageToChat(token: string, chatId: string, text: string): Promise<TelegramResponse> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.json();
}

// Helper: send photo
async function sendPhotoToChat(
  token: string,
  chatId: string,
  blob: Blob,
  filename = "photo.jpg",
  caption = ""
): Promise<TelegramResponse> {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("photo", blob, filename);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });

  return res.json();
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatIdsRaw = process.env.TELEGRAM_CHAT_IDS; // comma-separated IDs

    if (!token || !chatIdsRaw) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_IDS");
      return NextResponse.json(
        { success: false, error: "Missing token or chatIds" },
        { status: 500 }
      );
    }

    // Parse chat IDs
    const chatIds = chatIdsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (chatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid chat IDs provided" },
        { status: 500 }
      );
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const message = (formData.get("message") as string) || "";
      const file = formData.get("photo");

      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const blob = new Blob([buffer]);
        const filename = file.name || "photo.jpg";

        const results = await Promise.allSettled(
          chatIds.map((chatId) => sendPhotoToChat(token, chatId, blob, filename, message || "New order 📦"))
        );

        const errors = results
          .map((r, i) => ({ result: r, chatId: chatIds[i] }))
          .filter((r) => {
            if (r.result.status === "rejected") return true;
            if (r.result.status === "fulfilled") {
              const data = r.result.value as TelegramResponse;
              return !data.ok;
            }
            return false;
          });

        if (errors.length > 0) {
          console.error("Some sendPhoto requests failed:", errors);
          return NextResponse.json(
            { success: false, error: "One or more sends failed", details: errors.map(e => ({ chatId: e.chatId })) },
            { status: 500 }
          );
        }
      } else {
        const text = message || "New order 📦";

        const results = await Promise.allSettled(chatIds.map((chatId) => sendMessageToChat(token, chatId, text)));

        const errors = results
          .map((r, i) => ({ result: r, chatId: chatIds[i] }))
          .filter((r) => {
            if (r.result.status === "rejected") return true;
            if (r.result.status === "fulfilled") {
              const data = r.result.value as TelegramResponse;
              return !data.ok;
            }
            return false;
          });

        if (errors.length > 0) {
          console.error("Some sendMessage requests failed:", errors);
          return NextResponse.json(
            { success: false, error: "One or more sends failed", details: errors.map(e => ({ chatId: e.chatId })) },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true });
    }

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
