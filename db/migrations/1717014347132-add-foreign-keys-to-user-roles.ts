import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeysToUserRoles1717014347132
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id");
        ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "roles" ("id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user_roles" DROP CONSTRAINT "fk_user_roles_user_id";
        ALTER TABLE "user_roles" DROP CONSTRAINT "fk_user_roles_role_id";
    `);
  }
}
