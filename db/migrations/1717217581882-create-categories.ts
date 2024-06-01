import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategories1717217581882 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "categories" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL UNIQUE,
            "description" character varying,
            "created_by" uuid NOT NULL,
            "updated_by" uuid NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TRIGGER update_categories_updated_at_trigger
        BEFORE UPDATE ON "categories"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TRIGGER IF EXISTS update_categories_updated_at_trigger ON "categories";
        DROP TABLE IF EXISTS "categories";
    `);
  }
}
