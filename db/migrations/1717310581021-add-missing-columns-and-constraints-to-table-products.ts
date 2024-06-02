import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumnsAndConstraintsToTableProducts1717310581021
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD COLUMN "category_id" uuid NOT NULL,
            ADD CONSTRAINT "FK_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id");

            ALTER TABLE "products"
            ADD CONSTRAINT "FK_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id");
    
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products"
            DROP CONSTRAINT "FK_category",
            DROP COLUMN "category_id";
    
            ALTER TABLE "products"
            DROP CONSTRAINT "FK_created_by";
            
            ALTER TABLE "products"
            DROP CONSTRAINT "FK_updated_by";
      `);
  }
}
