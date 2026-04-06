/**
 * Test connexion Supabase + écriture dans restaurant_orders.
 * Usage : npm run test:db
 * Prérequis : .env.local avec NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
 */

const path = require("node:path");
const { config } = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

async function main() {
  if (!url || !key) {
    console.error(
      "Variables manquantes. Crée un fichier .env.local à la racine du projet avec :\n" +
        "  NEXT_PUBLIC_SUPABASE_URL=...\n" +
        "  SUPABASE_SERVICE_ROLE_KEY=...\n" +
        "(Les valeurs ne doivent pas être seulement dans .env.example — Next ne le charge pas.)",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const testLine = {
    id: "test-script",
    name: "Test connexion (npm run test:db)",
    price: 0.01,
    qty: 1,
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("restaurant_orders")
    .insert({
      table_label: "Table test (script)",
      lines: [testLine],
      total: 0.01,
    })
    .select("id, created_at, table_label, total")
    .single();

  if (insertErr) {
    console.error("Échec insertion :", insertErr.message);
    console.error(insertErr);
    process.exit(1);
  }

  console.log("Insertion OK :", inserted);

  const { data: last, error: selErr } = await supabase
    .from("restaurant_orders")
    .select("id, created_at, table_label, total")
    .order("created_at", { ascending: false })
    .limit(5);

  if (selErr) {
    console.error("Lecture liste :", selErr.message);
    process.exit(1);
  }

  console.log("\n5 dernières lignes dans restaurant_orders :");
  console.table(last);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
