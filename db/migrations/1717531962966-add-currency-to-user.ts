import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyToUser1717531962966 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "currency" character varying NOT NULL DEFAULT 'rwf';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
        DROP COLUMN "currency";
    `);
  }
}
