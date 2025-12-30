import { prisma } from "@/lib/prisma";

async function listUsers() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
}

listUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
