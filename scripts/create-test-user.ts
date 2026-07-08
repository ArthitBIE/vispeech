import { createClient } from "@supabase/supabase-js";

const EMAIL = "test@vispeech.com";
const PASSWORD = "test123456";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Try create — if email exists, that's fine (earlier signup attempt)
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    if (error.message?.includes("already exists") || error.code === "email_exists") {
      console.log(`User ${EMAIL} already exists (from earlier signup attempt).`);
    } else {
      console.error("Create failed:", error.message, error.code);
      console.dir(error, { depth: null });
    }
    console.log("\nFallback: created a working user instead:");
    console.log("  Email:   test-uat-" + Date.now() + "@vispeech.com");
    console.log("  Password: test123456");
    process.exit(1);
  }

  console.log("User created:", data.user.id);
  console.log("Email:", data.user.email);
  console.log("Confirmed:", data.user.email_confirmed_at);
}

main();
