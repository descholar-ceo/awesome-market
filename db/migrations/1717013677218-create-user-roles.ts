import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRoles1717013677218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "user_roles" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "user_id" uuid NOT NULL,
            "role_id" uuid NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TRIGGER update_user_roles_updated_at_trigger
        BEFORE UPDATE ON "user_roles"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TRIGGER IF EXISTS update_user_roles_updated_at_trigger ON "user_roles";
        DROP TABLE IF EXISTS "user_roles";
    `);
  }
}
