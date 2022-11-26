import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "dashactyl@votion.dev";

  await prisma.user.delete({ where: { email } }).catch(() => {});
  await prisma.user.create({
    data: {
      username: 'Dashactyl',
      email,
      password: await bcrypt.hash('dashactylv3', 10)
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
