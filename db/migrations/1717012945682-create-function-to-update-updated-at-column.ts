import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionToUpdateUpdatedAtColumn1717012945682
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column_function() RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at := NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS update_updated_at_column_function();',
    );
  }
}
