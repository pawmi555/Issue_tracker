import "dotenv/config";

import { prisma } from "./client.js";

import { runMasterSeeds } from "./seed/seed.master.js";
import { runDevSeeds } from "./seed/seed.dev.js";

async function main() {
  console.log("Start seeding...");

  await runMasterSeeds();
  console.log("MASTER DONE");

  if (process.env.NODE_ENV !== "production") {
    await runDevSeeds();
  }
  console.log("DEV DONE");
  console.log("Seed completed.");
}

main()
  .then(() => {
    console.log("SUCCESS");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
