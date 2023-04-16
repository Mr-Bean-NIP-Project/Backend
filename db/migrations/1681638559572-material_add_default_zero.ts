import { MigrationInterface, QueryRunner } from "typeorm";

export class MaterialAddDefaultZero1681638559572 implements MigrationInterface {
    name = 'MaterialAddDefaultZero1681638559572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" integer NOT NULL DEFAULT (0), "protein" integer NOT NULL DEFAULT (0), "total_fat" integer NOT NULL DEFAULT (0), "saturated_fat" integer NOT NULL DEFAULT (0), "trans_fat" integer NOT NULL DEFAULT (0), "cholesterol" integer NOT NULL DEFAULT (0), "carbohydrate" integer NOT NULL DEFAULT (0), "sugars" integer NOT NULL DEFAULT (0), "dietary_fibre" integer NOT NULL DEFAULT (0), "sodium" integer NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "supplierId" integer, CONSTRAINT "FK_a2fdcd9734f6b22c4cdc5f5e952" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "deleted_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "deleted_at", "supplierId" FROM "material"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`ALTER TABLE "temporary_material" RENAME TO "material"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material" RENAME TO "temporary_material"`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" integer NOT NULL, "protein" integer NOT NULL, "total_fat" integer NOT NULL, "saturated_fat" integer NOT NULL, "trans_fat" integer NOT NULL, "cholesterol" integer NOT NULL, "carbohydrate" integer NOT NULL, "sugars" integer NOT NULL, "dietary_fibre" integer NOT NULL, "sodium" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "supplierId" integer, CONSTRAINT "FK_a2fdcd9734f6b22c4cdc5f5e952" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "deleted_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "deleted_at", "supplierId" FROM "temporary_material"`);
        await queryRunner.query(`DROP TABLE "temporary_material"`);
    }

}
