import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviews1717340639195 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "reviews" (
                "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
                "rating" integer NOT NULL,
                "comment" character varying NOT NULL,
                "rated_by" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "updated_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TRIGGER update_reviews_updated_at_trigger
            BEFORE UPDATE ON "reviews"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_function();

            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_reviews_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id");

            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_reviews_rated_by" FOREIGN KEY ("rated_by") REFERENCES "users"("id");

            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_reviews_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reviews"
      DROP CONSTRAINT "FK_reviews_updated_by",

      ALTER TABLE "reviews"
      DROP CONSTRAINT "FK_reviews_rated_by";
      
      ALTER TABLE "reviews"
      DROP CONSTRAINT "FK_reviews_product_id";

      DROP TRIGGER IF EXISTS update_reviews_updated_at_trigger ON "reviews";

      DROP TABLE IF EXISTS "reviews";
    `);
  }
}
