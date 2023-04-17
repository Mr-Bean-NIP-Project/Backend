import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1681703985071 implements MigrationInterface {
    name = 'Init1681703985071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplier_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "serving_size" integer NOT NULL, "serving_unit" varchar CHECK( "serving_unit" IN ('g','ml') ) NOT NULL, "serving_per_package" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "sub_product_ids" text array NOT NULL, "material_ids" text array NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "product_materials_material" ("productId" integer NOT NULL, "materialId" integer NOT NULL, PRIMARY KEY ("productId", "materialId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b880e7d98f8d76eda293ecafcd" ON "product_materials_material" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb060ce864867b3cb139d2b9be" ON "product_materials_material" ("materialId") `);
        await queryRunner.query(`CREATE TABLE "temporary_material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplier_id" integer NOT NULL, CONSTRAINT "FK_673c8b8d44a232721f2d9e58338" FOREIGN KEY ("supplier_id") REFERENCES "supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id" FROM "material"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`ALTER TABLE "temporary_material" RENAME TO "material"`);
        await queryRunner.query(`DROP INDEX "IDX_b880e7d98f8d76eda293ecafcd"`);
        await queryRunner.query(`DROP INDEX "IDX_fb060ce864867b3cb139d2b9be"`);
        await queryRunner.query(`CREATE TABLE "temporary_product_materials_material" ("productId" integer NOT NULL, "materialId" integer NOT NULL, CONSTRAINT "FK_b880e7d98f8d76eda293ecafcd0" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_fb060ce864867b3cb139d2b9be9" FOREIGN KEY ("materialId") REFERENCES "material" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("productId", "materialId"))`);
        await queryRunner.query(`INSERT INTO "temporary_product_materials_material"("productId", "materialId") SELECT "productId", "materialId" FROM "product_materials_material"`);
        await queryRunner.query(`DROP TABLE "product_materials_material"`);
        await queryRunner.query(`ALTER TABLE "temporary_product_materials_material" RENAME TO "product_materials_material"`);
        await queryRunner.query(`CREATE INDEX "IDX_b880e7d98f8d76eda293ecafcd" ON "product_materials_material" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb060ce864867b3cb139d2b9be" ON "product_materials_material" ("materialId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_fb060ce864867b3cb139d2b9be"`);
        await queryRunner.query(`DROP INDEX "IDX_b880e7d98f8d76eda293ecafcd"`);
        await queryRunner.query(`ALTER TABLE "product_materials_material" RENAME TO "temporary_product_materials_material"`);
        await queryRunner.query(`CREATE TABLE "product_materials_material" ("productId" integer NOT NULL, "materialId" integer NOT NULL, PRIMARY KEY ("productId", "materialId"))`);
        await queryRunner.query(`INSERT INTO "product_materials_material"("productId", "materialId") SELECT "productId", "materialId" FROM "temporary_product_materials_material"`);
        await queryRunner.query(`DROP TABLE "temporary_product_materials_material"`);
        await queryRunner.query(`CREATE INDEX "IDX_fb060ce864867b3cb139d2b9be" ON "product_materials_material" ("materialId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b880e7d98f8d76eda293ecafcd" ON "product_materials_material" ("productId") `);
        await queryRunner.query(`ALTER TABLE "material" RENAME TO "temporary_material"`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplier_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplier_id" FROM "temporary_material"`);
        await queryRunner.query(`DROP TABLE "temporary_material"`);
        await queryRunner.query(`DROP INDEX "IDX_fb060ce864867b3cb139d2b9be"`);
        await queryRunner.query(`DROP INDEX "IDX_b880e7d98f8d76eda293ecafcd"`);
        await queryRunner.query(`DROP TABLE "product_materials_material"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
    }

}
