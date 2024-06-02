import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItems1717363198098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "order_items" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "order_id" uuid NOT NULL,
            "inventory_id" uuid NOT NULL,
            "quantity" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TRIGGER update_order_items_updated_at_trigger
        BEFORE UPDATE ON "order_items"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();

        ALTER TABLE "order_items"
        ADD CONSTRAINT "FK_order_items_inventories_id" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id");

        ALTER TABLE "order_items"
        ADD CONSTRAINT "FK_order_items_orders_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "order_items"
        DROP CONSTRAINT "FK_order_items_orders_id";
        
        ALTER TABLE "order_items"
        DROP CONSTRAINT "FK_order_items_inventories_id";

        DROP TRIGGER IF EXISTS update_order_items_updated_at_trigger ON "order_items";
        DROP TABLE IF EXISTS "order_items";
    `);
  }
}
