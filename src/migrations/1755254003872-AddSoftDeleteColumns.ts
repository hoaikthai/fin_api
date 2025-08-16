import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteColumns1755254003872 implements MigrationInterface {
  name = 'AddSoftDeleteColumns1755254003872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "account"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "category"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "deletedAt" TIMESTAMP
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "category" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "account" DROP COLUMN "deletedAt"
        `);
  }
}
