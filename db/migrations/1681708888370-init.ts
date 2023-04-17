import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1681708888370 implements MigrationInterface {
    name = 'Init1681708888370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer)`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "serving_size" integer NOT NULL, "serving_unit" varchar CHECK( "serving_unit" IN ('g','ml') ) NOT NULL, "serving_per_package" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "product_sub_products_product" ("product_id_1" integer NOT NULL, "productId" integer NOT NULL, PRIMARY KEY ("product_id_1", "productId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f" ON "product_sub_products_product" ("product_id_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_43572c24451d97bfd6c6e69ef1" ON "product_sub_products_product" ("productId") `);
        await queryRunner.query(`CREATE TABLE "product_materials_material" ("productId" integer NOT NULL, "materialId" integer NOT NULL, PRIMARY KEY ("productId", "materialId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b880e7d98f8d76eda293ecafcd" ON "product_materials_material" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb060ce864867b3cb139d2b9be" ON "product_materials_material" ("materialId") `);
        await queryRunner.query(`CREATE TABLE "temporary_material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer, CONSTRAINT "FK_a2fdcd9734f6b22c4cdc5f5e952" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId" FROM "material"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`ALTER TABLE "temporary_material" RENAME TO "material"`);
        await queryRunner.query(`DROP INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f"`);
        await queryRunner.query(`DROP INDEX "IDX_43572c24451d97bfd6c6e69ef1"`);
        await queryRunner.query(`CREATE TABLE "temporary_product_sub_products_product" ("product_id_1" integer NOT NULL, "productId" integer NOT NULL, CONSTRAINT "FK_b2d8e8c9191f2e3e4ad6922a2f4" FOREIGN KEY ("product_id_1") REFERENCES "product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_43572c24451d97bfd6c6e69ef1e" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("product_id_1", "productId"))`);
        await queryRunner.query(`INSERT INTO "temporary_product_sub_products_product"("product_id_1", "productId") SELECT "product_id_1", "productId" FROM "product_sub_products_product"`);
        await queryRunner.query(`DROP TABLE "product_sub_products_product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product_sub_products_product" RENAME TO "product_sub_products_product"`);
        await queryRunner.query(`CREATE INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f" ON "product_sub_products_product" ("product_id_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_43572c24451d97bfd6c6e69ef1" ON "product_sub_products_product" ("productId") `);
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
        await queryRunner.query(`DROP INDEX "IDX_43572c24451d97bfd6c6e69ef1"`);
        await queryRunner.query(`DROP INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f"`);
        await queryRunner.query(`ALTER TABLE "product_sub_products_product" RENAME TO "temporary_product_sub_products_product"`);
        await queryRunner.query(`CREATE TABLE "product_sub_products_product" ("product_id_1" integer NOT NULL, "productId" integer NOT NULL, PRIMARY KEY ("product_id_1", "productId"))`);
        await queryRunner.query(`INSERT INTO "product_sub_products_product"("product_id_1", "productId") SELECT "product_id_1", "productId" FROM "temporary_product_sub_products_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product_sub_products_product"`);
        await queryRunner.query(`CREATE INDEX "IDX_43572c24451d97bfd6c6e69ef1" ON "product_sub_products_product" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f" ON "product_sub_products_product" ("product_id_1") `);
        await queryRunner.query(`ALTER TABLE "material" RENAME TO "temporary_material"`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer)`);
        await queryRunner.query(`INSERT INTO "material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId" FROM "temporary_material"`);
        await queryRunner.query(`DROP TABLE "temporary_material"`);
        await queryRunner.query(`DROP INDEX "IDX_fb060ce864867b3cb139d2b9be"`);
        await queryRunner.query(`DROP INDEX "IDX_b880e7d98f8d76eda293ecafcd"`);
        await queryRunner.query(`DROP TABLE "product_materials_material"`);
        await queryRunner.query(`DROP INDEX "IDX_43572c24451d97bfd6c6e69ef1"`);
        await queryRunner.query(`DROP INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f"`);
        await queryRunner.query(`DROP TABLE "product_sub_products_product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
    }

}
