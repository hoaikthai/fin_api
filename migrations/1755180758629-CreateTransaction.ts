import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransaction1755180758629 implements MigrationInterface {
    name = 'CreateTransaction1755180758629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."transaction_type_enum" AS ENUM('income', 'expense', 'transfer')
        `);
        await queryRunner.query(`
            CREATE TABLE "transaction" (
                "id" SERIAL NOT NULL,
                "type" "public"."transaction_type_enum" NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "description" character varying NOT NULL,
                "category" character varying,
                "userId" integer NOT NULL,
                "accountId" integer NOT NULL,
                "toAccountId" integer,
                "transactionDate" TIMESTAMP NOT NULL DEFAULT now(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_3d6e89b14baa44a71870450d14d" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_ac8efff1e2135ddfd0ab1796c5a" FOREIGN KEY ("toAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_ac8efff1e2135ddfd0ab1796c5a"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_3d6e89b14baa44a71870450d14d"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"
        `);
        await queryRunner.query(`
            DROP TABLE "transaction"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."transaction_type_enum"
        `);
    }

}
