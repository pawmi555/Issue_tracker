import "dotenv/config";

import { prisma } from "./client.js";
import { runMasterSeeds } from "./seed/seed.master.js";

async function main() {
  console.log("Starting master seed...");

  await runMasterSeeds();

  console.log("Master seed completed.");
}

main()
  .catch((error: unknown) => {
    console.error("Master seed failed.", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
