import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeAccountIdToUsers1717928375991
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "stripe_account_id" character varying;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "stripe_account_id";
        `);
  }
}
