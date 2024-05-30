import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProducts1717015082007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE "products" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "description" character varying,
            "code" character varying NOT NULL UNIQUE,
            "unit_price" integer NOT NULL,
            "thumbnail" character varying NOT NULL,
            "created_by" uuid NOT NULL,
            "updated_by" uuid NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE TRIGGER update_products_updated_at_trigger
          BEFORE UPDATE ON "products"
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP TRIGGER IF EXISTS update_products_updated_at_trigger ON "products";
          DROP TABLE IF EXISTS "products";
        `);
  }
}
