import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1681802740256 implements MigrationInterface {
    name = 'Init1681802740256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_05290e39dd1ef4fbbcfe329f7bd" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer, CONSTRAINT "UQ_f7e289dde0c4fdfba5bee2de40b" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "material_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "material_id" integer NOT NULL, "product_id" integer NOT NULL, "material_quantity" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3388e717d2105465c59edcf13b" ON "material_product" ("material_id", "product_id") `);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "serving_size" integer NOT NULL, "serving_unit" varchar CHECK( "serving_unit" IN ('g','ml') ) NOT NULL, "serving_per_package" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "product_sub_products_product" ("product_id_1" integer NOT NULL, "productId" integer NOT NULL, PRIMARY KEY ("product_id_1", "productId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f" ON "product_sub_products_product" ("product_id_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_43572c24451d97bfd6c6e69ef1" ON "product_sub_products_product" ("productId") `);
        await queryRunner.query(`CREATE TABLE "temporary_material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer, CONSTRAINT "UQ_f7e289dde0c4fdfba5bee2de40b" UNIQUE ("name"), CONSTRAINT "FK_a2fdcd9734f6b22c4cdc5f5e952" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId" FROM "material"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`ALTER TABLE "temporary_material" RENAME TO "material"`);
        await queryRunner.query(`DROP INDEX "IDX_3388e717d2105465c59edcf13b"`);
        await queryRunner.query(`CREATE TABLE "temporary_material_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "material_id" integer NOT NULL, "product_id" integer NOT NULL, "material_quantity" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_b4f92677ba1ae798c1971908412" FOREIGN KEY ("material_id") REFERENCES "material" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_317e70d8f17cc0c17a74b0f3a46" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_material_product"("id", "material_id", "product_id", "material_quantity", "created_at", "updated_at") SELECT "id", "material_id", "product_id", "material_quantity", "created_at", "updated_at" FROM "material_product"`);
        await queryRunner.query(`DROP TABLE "material_product"`);
        await queryRunner.query(`ALTER TABLE "temporary_material_product" RENAME TO "material_product"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3388e717d2105465c59edcf13b" ON "material_product" ("material_id", "product_id") `);
        await queryRunner.query(`DROP INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f"`);
        await queryRunner.query(`DROP INDEX "IDX_43572c24451d97bfd6c6e69ef1"`);
        await queryRunner.query(`CREATE TABLE "temporary_product_sub_products_product" ("product_id_1" integer NOT NULL, "productId" integer NOT NULL, CONSTRAINT "FK_b2d8e8c9191f2e3e4ad6922a2f4" FOREIGN KEY ("product_id_1") REFERENCES "product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_43572c24451d97bfd6c6e69ef1e" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("product_id_1", "productId"))`);
        await queryRunner.query(`INSERT INTO "temporary_product_sub_products_product"("product_id_1", "productId") SELECT "product_id_1", "productId" FROM "product_sub_products_product"`);
        await queryRunner.query(`DROP TABLE "product_sub_products_product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product_sub_products_product" RENAME TO "product_sub_products_product"`);
        await queryRunner.query(`CREATE INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f" ON "product_sub_products_product" ("product_id_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_43572c24451d97bfd6c6e69ef1" ON "product_sub_products_product" ("productId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_43572c24451d97bfd6c6e69ef1"`);
        await queryRunner.query(`DROP INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f"`);
        await queryRunner.query(`ALTER TABLE "product_sub_products_product" RENAME TO "temporary_product_sub_products_product"`);
        await queryRunner.query(`CREATE TABLE "product_sub_products_product" ("product_id_1" integer NOT NULL, "productId" integer NOT NULL, PRIMARY KEY ("product_id_1", "productId"))`);
        await queryRunner.query(`INSERT INTO "product_sub_products_product"("product_id_1", "productId") SELECT "product_id_1", "productId" FROM "temporary_product_sub_products_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product_sub_products_product"`);
        await queryRunner.query(`CREATE INDEX "IDX_43572c24451d97bfd6c6e69ef1" ON "product_sub_products_product" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f" ON "product_sub_products_product" ("product_id_1") `);
        await queryRunner.query(`DROP INDEX "IDX_3388e717d2105465c59edcf13b"`);
        await queryRunner.query(`ALTER TABLE "material_product" RENAME TO "temporary_material_product"`);
        await queryRunner.query(`CREATE TABLE "material_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "material_id" integer NOT NULL, "product_id" integer NOT NULL, "material_quantity" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "material_product"("id", "material_id", "product_id", "material_quantity", "created_at", "updated_at") SELECT "id", "material_id", "product_id", "material_quantity", "created_at", "updated_at" FROM "temporary_material_product"`);
        await queryRunner.query(`DROP TABLE "temporary_material_product"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3388e717d2105465c59edcf13b" ON "material_product" ("material_id", "product_id") `);
        await queryRunner.query(`ALTER TABLE "material" RENAME TO "temporary_material"`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer, CONSTRAINT "UQ_f7e289dde0c4fdfba5bee2de40b" UNIQUE ("name"))`);
        await queryRunner.query(`INSERT INTO "material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId" FROM "temporary_material"`);
        await queryRunner.query(`DROP TABLE "temporary_material"`);
        await queryRunner.query(`DROP INDEX "IDX_43572c24451d97bfd6c6e69ef1"`);
        await queryRunner.query(`DROP INDEX "IDX_b2d8e8c9191f2e3e4ad6922a2f"`);
        await queryRunner.query(`DROP TABLE "product_sub_products_product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP INDEX "IDX_3388e717d2105465c59edcf13b"`);
        await queryRunner.query(`DROP TABLE "material_product"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
    }

}
