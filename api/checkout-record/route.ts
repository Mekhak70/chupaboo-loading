import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  // Reject browser cross-origin submissions. Public orders still need admin confirmation.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Պատվերների պահպանումը կարգավորված չէ։" }, { status: 503 });
  try {
    // Bound streamed body size too: Content-Length can be absent or inaccurate.
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Empty request" }, { status: 400 });
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.length;
      if (length > 250_000) { await reader.cancel(); return NextResponse.json({ error: "Պատվերի տվյալները չափազանց մեծ են։" }, { status: 413 }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.length; }
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id ?? "") ||
        !Array.isArray(data.items) || data.items.length < 1 || data.items.length > 100 ||
        typeof data.phone !== "string" || !data.phone.trim() || data.phone.length > 50 ||
        typeof data.delivery !== "object" || !data.delivery || Array.isArray(data.delivery) ||
        !Number.isFinite(data.deliveryFee) || data.deliveryFee < 0 || data.deliveryFee > 9999999999.99) {
      return NextResponse.json({ error: "Ստուգիր պատվերի տվյալները։" }, { status: 400 });
    }
    for (const item of data.items) {
      if (!item || typeof item.id !== "string" || item.id.length > 200 || !item.id ||
          typeof item.name !== "string" || !item.name.trim() || item.name.length > 200 ||
          !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000 ||
          !Number.isFinite(item.price) || item.price < 0 || item.price > 9999999999.99) {
        return NextResponse.json({ error: "Ապրանքի տվյալները սխալ են։" }, { status: 400 });
      }
    }
    const client = createClient(url,key,{ auth: { persistSession:false, autoRefreshToken:false } });
    const payload = { phone:data.phone, delivery:data.delivery, deliveryFee:data.deliveryFee, items:data.items };
    const { error } = await client.rpc("record_finance_checkout",{ p_id:data.id, p_payload:payload });
    if (error) { console.error("Checkout record failed:",error.code); return NextResponse.json({ error:"Պատվերը չպահպանվեց։ Փորձիր կրկին։" },{status:500}); }
    return NextResponse.json({ id:data.id, status:"pending" });
  } catch { return NextResponse.json({ error:"Չհաջողվեց կարդալ պատվերը։" },{status:400}); }
}
