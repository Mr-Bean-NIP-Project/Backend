import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSupplierMaterial1681653737262 implements MigrationInterface {
    name = 'InitSupplierMaterial1681653737262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplier_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplier_id" integer NOT NULL, CONSTRAINT "FK_673c8b8d44a232721f2d9e58338" FOREIGN KEY ("supplier_id") REFERENCES "supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id" FROM "material"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`ALTER TABLE "temporary_material" RENAME TO "material"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material" RENAME TO "temporary_material"`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplier_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id" FROM "temporary_material"`);
        await queryRunner.query(`DROP TABLE "temporary_material"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
    }

}
