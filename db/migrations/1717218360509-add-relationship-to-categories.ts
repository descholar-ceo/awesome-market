import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationshipToCategories1717218360509
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "users" ("id");
            ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users" ("id");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "categories" DROP CONSTRAINT "fk_categories_created_by";
            ALTER TABLE "categories" DROP CONSTRAINT "fk_categories_updated_by";
        `);
  }
}
