import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccount1755161704822 implements MigrationInterface {
    name = 'CreateAccount1755161704822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "account" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "currency" character varying(3) NOT NULL,
                "balance" numeric(10, 2) NOT NULL DEFAULT '0',
                "description" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "account"
            ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "account" DROP CONSTRAINT "FK_60328bf27019ff5498c4b977421"
        `);
        await queryRunner.query(`
            DROP TABLE "account"
        `);
    }

}
