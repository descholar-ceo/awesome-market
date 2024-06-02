import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrders1717345093714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE order_status AS ENUM (
            'PENDING',
            'PROCESSING',
            'CANCELLED',
            'DELIVERED',
            'RETURNED'
        );

        CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL,
        "code" character varying NOT NULL UNIQUE,
        "buyer_id" uuid NOT NULL,
        "inventory_id" uuid NOT NULL,
        "updated_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" order_status NOT NULL DEFAULT 'PENDING'
        );
        
        CREATE TRIGGER update_orders_updated_at_trigger
        BEFORE UPDATE ON "orders"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();

        ALTER TABLE "orders"
        ADD CONSTRAINT "FK_orders_inventory_id" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id");

        ALTER TABLE "orders"
        ADD CONSTRAINT "FK_orders_buyer_id" FOREIGN KEY ("buyer_id") REFERENCES "users"("id");

        ALTER TABLE "orders"
        ADD CONSTRAINT "FK_orders_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "orders"
          DROP CONSTRAINT "FK_orders_updated_by",
    
          ALTER TABLE "orders"
          DROP CONSTRAINT "FK_orders_buyer_id";
          
          ALTER TABLE "orders"
          DROP CONSTRAINT "FK_orders_inventory_id";
    
          DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON "orders";
    
          DROP TABLE IF EXISTS "orders";
        `);
  }
}
