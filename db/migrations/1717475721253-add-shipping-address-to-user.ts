import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShippingAddressToUser1717475721253
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "shipping_address" character varying;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
        DROP COLUMN "shipping_address";
    `);
  }
}
