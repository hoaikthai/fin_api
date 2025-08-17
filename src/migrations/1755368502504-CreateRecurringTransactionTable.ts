import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecurringTransactionTable1755368502504
  implements MigrationInterface
{
  name = 'CreateRecurringTransactionTable1755368502504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."recurring_transaction_type_enum" AS ENUM('income', 'expense')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."recurring_transaction_frequency_enum" AS ENUM('daily', 'weekly', 'monthly', 'yearly')
        `);
    await queryRunner.query(`
            CREATE TABLE "recurring_transaction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "type" "public"."recurring_transaction_type_enum" NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "description" character varying NOT NULL,
                "categoryId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "accountId" uuid NOT NULL,
                "frequency" "public"."recurring_transaction_frequency_enum" NOT NULL,
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP,
                "nextDueDate" TIMESTAMP,
                "isActive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_6f2199a889c8e4de41bcc2ca46c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "recurringTransactionId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_cfd18ed127ef44ee22791329320" FOREIGN KEY ("recurringTransactionId") REFERENCES "recurring_transaction"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction"
            ADD CONSTRAINT "FK_9df125eeb66acd35b815debd369" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction"
            ADD CONSTRAINT "FK_0d61863f6aab3544868b1a39510" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction"
            ADD CONSTRAINT "FK_9c4a7f8db1af0576c1a3dffb2a9" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction" DROP CONSTRAINT "FK_9c4a7f8db1af0576c1a3dffb2a9"
        `);
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction" DROP CONSTRAINT "FK_0d61863f6aab3544868b1a39510"
        `);
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction" DROP CONSTRAINT "FK_9df125eeb66acd35b815debd369"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_cfd18ed127ef44ee22791329320"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "recurringTransactionId"
        `);
    await queryRunner.query(`
            DROP TABLE "recurring_transaction"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."recurring_transaction_frequency_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."recurring_transaction_type_enum"
        `);
  }
}
