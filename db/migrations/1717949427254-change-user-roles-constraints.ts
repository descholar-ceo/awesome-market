import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserRolesConstraints1717949427254
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "user_roles"
          DROP CONSTRAINT "fk_user_roles_user_id",
          DROP CONSTRAINT "fk_user_roles_role_id";
    
          ALTER TABLE "user_roles"
          ADD CONSTRAINT "fk_user_roles_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id")
          ON DELETE CASCADE;
          
          ALTER TABLE "user_roles"
          ADD CONSTRAINT "fk_user_roles_role_id"
          FOREIGN KEY ("role_id") REFERENCES "roles" ("id")
          ON DELETE RESTRICT;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "user_roles"
          DROP CONSTRAINT "fk_user_roles_user_id",
          DROP CONSTRAINT "fk_user_roles_role_id";
    
          ALTER TABLE "user_roles"
          ADD CONSTRAINT "fk_user_roles_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id");
    
          ALTER TABLE "user_roles"
          ADD CONSTRAINT "fk_user_roles_role_id"
          FOREIGN KEY ("role_id") REFERENCES "roles" ("id");
        `);
  }
}
