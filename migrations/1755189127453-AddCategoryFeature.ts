import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryFeature1755189127453 implements MigrationInterface {
    name = 'AddCategoryFeature1755189127453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."category_type_enum" AS ENUM('income', 'expense', 'transfer')
        `);
        await queryRunner.query(`
            CREATE TABLE "category" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "type" "public"."category_type_enum" NOT NULL,
                "isDefault" boolean NOT NULL DEFAULT false,
                "userId" uuid,
                "parentId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "category"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "categoryId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "category"
            ADD CONSTRAINT "FK_32b856438dffdc269fa84434d9f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "category"
            ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_d3951864751c5812e70d033978d" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_d3951864751c5812e70d033978d"
        `);
        await queryRunner.query(`
            ALTER TABLE "category" DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"
        `);
        await queryRunner.query(`
            ALTER TABLE "category" DROP CONSTRAINT "FK_32b856438dffdc269fa84434d9f"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "categoryId"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "categoryId" character varying
        `);
        await queryRunner.query(`
            DROP TABLE "category"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."category_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
                RENAME COLUMN "categoryId" TO "category"
        `);
    }

}
