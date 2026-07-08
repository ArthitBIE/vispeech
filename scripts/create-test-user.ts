import { createClient } from "@supabase/supabase-js";

const EMAIL = process.env.E2E_TEST_EMAIL || "test@vispeech.com";
const PASSWORD = process.env.E2E_TEST_PASSWORD || "test123456";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    if (error.message?.includes("already exists") || error.code === "email_exists") {
      console.log(`User ${EMAIL} already exists — reusing it.`);
      console.log(`  Email:    ${EMAIL}`);
      console.log(`  Password: ${PASSWORD}`);
      process.exit(0);
    }

    console.error("Create failed:", error.message, error.code);
    console.dir(error, { depth: null });
    process.exit(1);
  }

  console.log("User created:", data.user.id);
  console.log("Email:", data.user.email);
  console.log("Confirmed:", data.user.email_confirmed_at);
  console.log("\nSet these in your shell before running e2e tests:");
  console.log(`  export E2E_TEST_EMAIL=${data.user.email}`);
  console.log(`  export E2E_TEST_PASSWORD=${PASSWORD}`);
}

main();
