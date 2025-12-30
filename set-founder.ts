import { prisma } from "@/lib/prisma";

async function setFounder() {
  const email = "a.kobaladze19@gmail.com";
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'FOUNDER' },
  });
  console.log("User updated:", user);
}

setFounder()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
