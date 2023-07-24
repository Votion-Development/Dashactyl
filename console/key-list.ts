import { PrismaClient } from '@prisma/client';
import { createCommand } from 'commander';

createCommand()
  .description('Lists the API keys in the database')
  .action(async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const keys = await prisma.apiKey.findMany();
    console.log(`Found ${keys.length} API key(s):`);
    for (const key of keys) {
      console.log(`- ${key.id}: ${key.userId} [${key.permissions}]`);
    }
  })
  .parse(process.argv);
