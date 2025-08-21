// scripts/generate-env.mjs
import { writeFileSync, mkdirSync } from "fs";

const url = process.env.SUPABASE_URL ?? "";
const key = process.env.SUPABASE_KEY ?? "";

const content = `export const environment = {
  production: true,
  supabaseUrl: '${url}',
  supabaseKey: '${key}'
};`;

mkdirSync("src/environments", { recursive: true });
writeFileSync("src/environments/environment.prod.ts", content);

console.log("✔ environment.prod.ts generado desde variables de entorno");
