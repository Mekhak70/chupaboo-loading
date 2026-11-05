import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(request:NextRequest) {
  const token=process.env.TELEGRAM_BOT_TOKEN;
  const chatId=process.env.TELEGRAM_CHAT_ID;
  const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Tracking is optional; missing environment variables never block shopping.
  if(!token||!chatId||!supabaseUrl)return new NextResponse(null,{status:204});
  const origin=request.headers.get("origin");
  if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid origin"},{status:403});
  try{
    const reader=request.body?.getReader();if(!reader)return NextResponse.json({error:"Empty request"},{status:400});
    const chunks:Uint8Array[]=[];let length=0;
    while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;
      if(length>5000){await reader.cancel();return NextResponse.json({error:"Request too large"},{status:413});}chunks.push(value);}
    const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    const payload=JSON.parse(new TextDecoder().decode(bytes));
    if(typeof payload.productName!=="string"||payload.productName.length>200||typeof payload.imageSrc!=="string")return NextResponse.json({error:"Invalid product"},{status:400});
    const image=new URL(payload.imageSrc);const storage=new URL(supabaseUrl);
    if(image.protocol!=="https:"||image.origin!==storage.origin||!image.pathname.startsWith("/storage/v1/object/public/catalog-images/"))return new NextResponse(null,{status:204});
    const response=await fetch(`https://api.telegram.org/bot${token}/sendPhoto`,{
      method:"POST",headers:{"Content-Type":"application/json"},signal:AbortSignal.timeout(8000),
      body:JSON.stringify({chat_id:chatId,photo:image.href,caption:`🛒 New User View:\n📦 ${payload.productName}\n🕒 ${new Date().toISOString()}`}),
    });
    if(!response.ok)console.warn("Product-view notification could not be delivered.");
    return new NextResponse(null,{status:204});
  }catch{return new NextResponse(null,{status:204});}
}
