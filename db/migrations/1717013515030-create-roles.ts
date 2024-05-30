import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoles1717013515030 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
              CREATE TABLE "roles" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL UNIQUE,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
              );
              
              CREATE TRIGGER update_roles_updated_at_trigger
              BEFORE UPDATE ON "roles"
              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
              DROP TRIGGER IF EXISTS update_roles_updated_at_trigger ON "roles";
              DROP TABLE IF EXISTS "roles";
            `);
  }
}
