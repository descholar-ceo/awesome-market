import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayout1717920119771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "payouts" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "order_id" uuid NOT NULL,
                "seller_id" uuid NOT NULL,
                "amount" integer NOT NULL,
                "processed_at" TIMESTAMP,
                "status" payment_statuses NOT NULL DEFAULT 'PENDING',
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TRIGGER update_payouts_updated_at_trigger
            BEFORE UPDATE ON "payouts"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();
    
            ALTER TABLE "payouts"
            ADD CONSTRAINT "FK_payouts_sellers_id" FOREIGN KEY ("seller_id") REFERENCES "users"("id");
    
            ALTER TABLE "payouts"
            ADD CONSTRAINT "FK_payouts_orders_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "payouts"
            DROP CONSTRAINT "FK_payouts_orders_id";
            
            ALTER TABLE "payouts"
            DROP CONSTRAINT "FK_payouts_sellers_id";
    
            DROP TRIGGER IF EXISTS update_payouts_updated_at_trigger ON "payouts";
            DROP TABLE IF EXISTS "payouts";
        `);
  }
}
