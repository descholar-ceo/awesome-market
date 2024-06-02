import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventories1717320883884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inventories" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL,
        "code" character varying NOT NULL UNIQUE,
        "owner_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "updated_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TRIGGER update_inventories_updated_at_trigger
      BEFORE UPDATE ON "inventories"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();

      ALTER TABLE "inventories"
      ADD CONSTRAINT "FK_inventories_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id");

      ALTER TABLE "inventories"
      ADD CONSTRAINT "FK_inventories_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id");

      ALTER TABLE "inventories"
      ADD CONSTRAINT "FK_inventories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inventories"
      DROP CONSTRAINT "FK_inventories_updated_by",

      ALTER TABLE "inventories"
      DROP CONSTRAINT "FK_inventories_owner_id";
      
      ALTER TABLE "inventories"
      DROP CONSTRAINT "FK_inventories_product_id";

      DROP TRIGGER IF EXISTS update_inventories_updated_at_trigger ON "inventories";

      DROP TABLE IF EXISTS "inventories";
    `);
  }
}
