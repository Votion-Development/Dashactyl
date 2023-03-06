import { PrismaClient } from '@prisma/client';
import { createCommand } from 'commander';

createCommand()
  .description('Deletes a user from the database')
  .argument('id', 'The ID of the user account')
  .action(async (id: string) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      console.error('User with that ID not found');
      process.exit(1);
    }

    await prisma.user.delete({ where: { id } });
    console.log(`Deleted user (was ${user.email})`);
  })
  .parse(process.argv);
