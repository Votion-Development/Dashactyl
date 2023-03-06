import { PrismaClient } from '@prisma/client';
import { createCommand } from 'commander';

interface Args {
  force: boolean;
}

createCommand()
  .description('Initializes a settings table')
  .option('-f, --force', 'Force overwrite existing tables', false)
  .action(async ({ force }: Args) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const all = await prisma.settings.findMany();
    if (all.length) {
      if (!force) {
        console.error(
          `${all.length} table(s) found\n`,
          "Remove the tables or rerun with '--force'"
        );
        process.exit(1);
      }

      await prisma.settings.deleteMany();
    }

    const set = await prisma.settings.create({ data: {} });
    console.log(`Successfully created settings table\nApp key: ${set.key}`);

    await prisma.$disconnect();
  })
  .parse(process.argv);
