import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl !== "https://placeholder.supabase.co" &&
  supabaseAnonKey !== "placeholder_anon_key";

function createSupabaseClient() {
  if (!isSupabaseConfigured) {
    console.warn(
      "⚠️ vispeech: ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL " +
        "และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local"
    );
    return null as any;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

export const supabase = createSupabaseClient();
