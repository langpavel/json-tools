import { build } from "vite";
import { ENTRIES } from "./entries.ts";

async function main() {
  const isDev = process.argv.includes("--dev");
  const mode = isDev ? "development" : "production";
  process.env.NODE_ENV = mode;

  for (const entry of ENTRIES) {
    process.env.ENTRY = entry;

    console.log(`Building entry: ${entry} (${mode})...`);
    await build({ mode });
  }
}

main()
  .then(() => {
    console.log("Build completed successfully.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
