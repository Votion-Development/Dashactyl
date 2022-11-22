import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1669142784412 implements MigrationInterface {
    name = 'migration1669142784412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "username" varchar NOT NULL,
                "email" varchar NOT NULL,
                "password" varchar NOT NULL,
                "permissions" integer NOT NULL DEFAULT (0),
                "coins" integer NOT NULL DEFAULT (0),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "user"
        `);
    }

}
