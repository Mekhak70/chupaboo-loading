import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
export async function mobileAuth(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw Error("Սերվերի Supabase կարգավորումները բացակայում են։");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.email_confirmed_at) return null;
  return { client, user: data.user };
}
