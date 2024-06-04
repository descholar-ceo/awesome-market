import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentStatusToOrder1717525126494
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ 
            BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_statuses') THEN
                CREATE TYPE payment_statuses AS ENUM (
                    'PENDING',
                    'PAID'
                );
            END IF;
            END$$;

            ALTER TABLE "orders"
            ADD COLUMN "payment_status" payment_statuses NOT NULL DEFAULT 'PENDING';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "orders"
            DROP COLUMN "payment_status";
            
            DROP TYPE "payment_statuses;
        `);
  }
}
