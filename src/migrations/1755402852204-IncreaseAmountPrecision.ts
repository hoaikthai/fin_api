import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseAmountPrecision1755402852204
  implements MigrationInterface
{
  name = 'IncreaseAmountPrecision1755402852204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction"
            ALTER COLUMN "amount" TYPE numeric(15, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "amount" TYPE numeric(15, 2)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "amount" TYPE numeric(10, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "recurring_transaction"
            ALTER COLUMN "amount" TYPE numeric(10, 2)
        `);
  }
}
