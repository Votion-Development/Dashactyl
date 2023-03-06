import { PrismaClient } from '@prisma/client';
import { createCommand } from 'commander';

createCommand()
  .description('Lists the users in the database')
  .action(async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} user(s):`);
    for (let user of users) {
      console.log(
        `- ${user.id}: ${user.username} (${user.email}) [${user.permissions}]`
      );
    }
  })
  .parse(process.argv);
