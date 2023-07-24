import { PrismaClient } from '@prisma/client';
import { createCommand } from 'commander';

createCommand()
  .description('Deletes an API key from the database')
  .argument('id', 'The ID of the API key')
  .action(async (id: string) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      console.error('API key with that ID not found');
      process.exit(1);
    }

    await prisma.apiKey.delete({ where: { id } });
    console.log(`Deleted API key (was ${key.id})`);
  })
  .parse(process.argv);
