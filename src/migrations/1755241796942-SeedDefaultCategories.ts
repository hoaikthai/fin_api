import { MigrationInterface, QueryRunner } from "typeorm";
import { randomUUID } from "crypto";

export class SeedDefaultCategories1755241796942 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Parent category constants
        const FOOD_BEVERAGE_ID = randomUUID();
        const BILLS_UTILITIES_ID = randomUUID();
        const TRANSPORTATION_ID = randomUUID();
        const SHOPPING_ID = randomUUID();
        const FAMILY_ID = randomUUID();
        const HEALTH_FITNESS_ID = randomUUID();
        const EDUCATION_ID = randomUUID();
        const ENTERTAINMENT_ID = randomUUID();
        const GIFT_DONATION_ID = randomUUID();
        const INSURANCES_ID = randomUUID();
        const OTHER_EXPENSE_ID = randomUUID();
        const OUTGOING_TRANSFER_ID = randomUUID();
        const TRAVEL_ID = randomUUID();

        // Insert parent expense categories
        await queryRunner.query(`
            INSERT INTO "category" ("id", "name", "type", "isDefault", "userId", "parentId")
            VALUES 
                ('${FOOD_BEVERAGE_ID}', 'Food & Beverage', 'expense', true, null, null),
                ('${BILLS_UTILITIES_ID}', 'Bills & Utilities', 'expense', true, null, null),
                ('${TRANSPORTATION_ID}', 'Transportation', 'expense', true, null, null),
                ('${SHOPPING_ID}', 'Shopping', 'expense', true, null, null),
                ('${FAMILY_ID}', 'Family', 'expense', true, null, null),
                ('${HEALTH_FITNESS_ID}', 'Health & Fitness', 'expense', true, null, null),
                ('${EDUCATION_ID}', 'Education', 'expense', true, null, null),
                ('${ENTERTAINMENT_ID}', 'Entertainment', 'expense', true, null, null),
                ('${GIFT_DONATION_ID}', 'Gift & Donation', 'expense', true, null, null),
                ('${INSURANCES_ID}', 'Insurances', 'expense', true, null, null),
                ('${OTHER_EXPENSE_ID}', 'Other expense', 'expense', true, null, null),
                ('${OUTGOING_TRANSFER_ID}', 'Outgoing transfer', 'expense', true, null, null),
                ('${TRAVEL_ID}', 'Travel', 'expense', true, null, null);
        `);

        // Insert child expense categories
        await queryRunner.query(`
            INSERT INTO "category" ("id", "name", "type", "isDefault", "userId", "parentId")
            VALUES 
                -- Food & Beverage children
                ('${randomUUID()}', 'Café', 'expense', true, null, '${FOOD_BEVERAGE_ID}'),
                ('${randomUUID()}', 'Restaurant', 'expense', true, null, '${FOOD_BEVERAGE_ID}'),
                ('${randomUUID()}', 'Bread and Noodles', 'expense', true, null, '${FOOD_BEVERAGE_ID}'),
                
                -- Bills & Utilities children
                ('${randomUUID()}', 'Phone bill', 'expense', true, null, '${BILLS_UTILITIES_ID}'),
                ('${randomUUID()}', 'Television Bill', 'expense', true, null, '${BILLS_UTILITIES_ID}'),
                ('${randomUUID()}', 'Internet Bill', 'expense', true, null, '${BILLS_UTILITIES_ID}'),
                ('${randomUUID()}', 'Piggy bank', 'expense', true, null, '${BILLS_UTILITIES_ID}'),
                
                -- Transportation children
                ('${randomUUID()}', 'Vehicle maintenance', 'expense', true, null, '${TRANSPORTATION_ID}'),
                ('${randomUUID()}', 'Parking fees', 'expense', true, null, '${TRANSPORTATION_ID}'),
                ('${randomUUID()}', 'Petrol', 'expense', true, null, '${TRANSPORTATION_ID}'),
                ('${randomUUID()}', 'Taxi', 'expense', true, null, '${TRANSPORTATION_ID}'),
                
                -- Shopping children
                ('${randomUUID()}', 'Electronic devices', 'expense', true, null, '${SHOPPING_ID}'),
                ('${randomUUID()}', 'Makeup', 'expense', true, null, '${SHOPPING_ID}'),
                ('${randomUUID()}', 'Clothing', 'expense', true, null, '${SHOPPING_ID}'),
                ('${randomUUID()}', 'Footwear', 'expense', true, null, '${SHOPPING_ID}'),
                ('${randomUUID()}', 'Apps', 'expense', true, null, '${SHOPPING_ID}'),
                
                -- Health & Fitness children
                ('${randomUUID()}', 'Fitness', 'expense', true, null, '${HEALTH_FITNESS_ID}'),
                ('${randomUUID()}', 'Doctor', 'expense', true, null, '${HEALTH_FITNESS_ID}'),
                ('${randomUUID()}', 'Personal care', 'expense', true, null, '${HEALTH_FITNESS_ID}'),
                ('${randomUUID()}', 'Pharmacy', 'expense', true, null, '${HEALTH_FITNESS_ID}'),
                ('${randomUUID()}', 'Sports', 'expense', true, null, '${HEALTH_FITNESS_ID}'),
                ('${randomUUID()}', 'Barber', 'expense', true, null, '${HEALTH_FITNESS_ID}'),
                
                -- Education children
                ('${randomUUID()}', 'Books', 'expense', true, null, '${EDUCATION_ID}'),
                
                -- Entertainment children
                ('${randomUUID()}', 'Streaming service', 'expense', true, null, '${ENTERTAINMENT_ID}'),
                ('${randomUUID()}', 'Games', 'expense', true, null, '${ENTERTAINMENT_ID}'),
                ('${randomUUID()}', 'Movies', 'expense', true, null, '${ENTERTAINMENT_ID}'),
                ('${randomUUID()}', 'Musics', 'expense', true, null, '${ENTERTAINMENT_ID}'),
                
                -- Gift & Donation children
                ('${randomUUID()}', 'Friends & Lover', 'expense', true, null, '${GIFT_DONATION_ID}'),
                ('${randomUUID()}', 'Funeral', 'expense', true, null, '${GIFT_DONATION_ID}'),
                ('${randomUUID()}', 'Marriage', 'expense', true, null, '${GIFT_DONATION_ID}'),
                ('${randomUUID()}', 'Lucky money', 'expense', true, null, '${GIFT_DONATION_ID}'),
                
                -- Travel children
                ('${randomUUID()}', 'Hotel', 'expense', true, null, '${TRAVEL_ID}');
        `);

        // Insert income categories
        await queryRunner.query(`
            INSERT INTO "category" ("id", "name", "type", "isDefault", "userId", "parentId")
            VALUES 
                ('${randomUUID()}', 'Salary', 'income', true, null, null),
                ('${randomUUID()}', 'Incoming transfer', 'income', true, null, null),
                ('${randomUUID()}', 'Collect interest', 'income', true, null, null),
                ('${randomUUID()}', 'Gifts', 'income', true, null, null),
                ('${randomUUID()}', 'Award', 'income', true, null, null),
                ('${randomUUID()}', 'Selling', 'income', true, null, null);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove all default categories
        await queryRunner.query(`DELETE FROM "category" WHERE "isDefault" = true;`);
    }

}
