import { PrismaClient } from '@prisma/client';
import { createCommand } from 'commander';

createCommand()
  .description('Creates an API key for a user in the database')
  .argument('id', 'The ID of the user account')
  .argument('perms', 'The permissions to set for the key')
  .action(async (id: string, perms: string) => {
    const permissions = Number(perms) || 0;
    const prisma = new PrismaClient();
    await prisma.$connect();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      console.error('User with that ID not found');
      process.exit(1);
    }

    const key = await prisma.apiKey.create({
      data: {
        userId: user.id,
        permissions,
      },
    });

    console.log(
      `Successfully created API key\nID: ${key.id}\nPermissions: ${key.permissions}`
    );

    await prisma.$disconnect();
  })
  .parse(process.argv);
