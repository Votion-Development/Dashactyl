import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createCommand } from 'commander';

createCommand()
  .description('Creates a user in the database')
  .argument('username', 'The username for the account')
  .argument('email', 'The email for the account')
  .argument('password', 'The password for the account')
  .action(async (username: string, email: string, password: string) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });
    console.log(`Successfully created user\nID: ${user.id}\nPermissions: ${user.permissions}`);

    await prisma.$disconnect();
  })
  .parse(process.argv);
