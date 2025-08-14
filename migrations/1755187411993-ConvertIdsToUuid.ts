import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertIdsToUuid1755187411993 implements MigrationInterface {
    name = 'ConvertIdsToUuid1755187411993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension if not already enabled
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Step 1: Drop all foreign key constraints
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_60328bf27019ff5498c4b977421"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_3d6e89b14baa44a71870450d14d"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ac8efff1e2135ddfd0ab1796c5a"`);

        // Step 2: Add new UUID columns alongside existing integer ones
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "uuid_id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "account" ADD COLUMN "uuid_id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "account" ADD COLUMN "uuid_userId" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD COLUMN "uuid_id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD COLUMN "uuid_userId" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD COLUMN "uuid_accountId" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD COLUMN "uuid_toAccountId" uuid`);

        // Step 3: Create a mapping table to store old ID to new UUID relationships
        await queryRunner.query(`
            CREATE TEMP TABLE user_id_mapping AS
            SELECT id as old_id, uuid_id as new_id FROM "user"
        `);
        
        await queryRunner.query(`
            CREATE TEMP TABLE account_id_mapping AS
            SELECT id as old_id, uuid_id as new_id FROM "account"
        `);

        // Step 4: Update foreign key references to use UUIDs
        await queryRunner.query(`
            UPDATE "account" 
            SET "uuid_userId" = um.new_id 
            FROM user_id_mapping um 
            WHERE "account"."userId" = um.old_id
        `);

        await queryRunner.query(`
            UPDATE "transaction" 
            SET "uuid_userId" = um.new_id 
            FROM user_id_mapping um 
            WHERE "transaction"."userId" = um.old_id
        `);

        await queryRunner.query(`
            UPDATE "transaction" 
            SET "uuid_accountId" = am.new_id 
            FROM account_id_mapping am 
            WHERE "transaction"."accountId" = am.old_id
        `);

        await queryRunner.query(`
            UPDATE "transaction" 
            SET "uuid_toAccountId" = am.new_id 
            FROM account_id_mapping am 
            WHERE "transaction"."toAccountId" = am.old_id AND "transaction"."toAccountId" IS NOT NULL
        `);

        // Step 5: Drop old primary keys and columns
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9"`);

        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "accountId"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "toAccountId"`);

        // Step 6: Rename UUID columns to original names
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "uuid_id" TO "id"`);
        await queryRunner.query(`ALTER TABLE "account" RENAME COLUMN "uuid_id" TO "id"`);
        await queryRunner.query(`ALTER TABLE "account" RENAME COLUMN "uuid_userId" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "uuid_id" TO "id"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "uuid_userId" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "uuid_accountId" TO "accountId"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "uuid_toAccountId" TO "toAccountId"`);

        // Step 7: Set NOT NULL constraints where needed
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "accountId" SET NOT NULL`);

        // Step 8: Add new primary key constraints
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id")`);

        // Step 9: Recreate foreign key constraints
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_3d6e89b14baa44a71870450d14d" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ac8efff1e2135ddfd0ab1796c5a" FOREIGN KEY ("toAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This is a destructive migration - downgrade is not recommended
        // If needed, you would need to:
        // 1. Drop UUID foreign keys
        // 2. Convert UUIDs back to integers (losing original integer values)
        // 3. Recreate integer columns and constraints
        
        throw new Error("Downgrade from UUID to integer IDs is not supported. This would result in data loss.");
    }
}