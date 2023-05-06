import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1683337224166 implements MigrationInterface {
    name = 'Init1683337224166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_sub_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "parent_id" integer NOT NULL, "child_id" integer NOT NULL, "quantity" decimal(10,2) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_de9e9ce9cfd69a1fd0d57f7968" ON "product_sub_product" ("child_id", "parent_id") `);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "serving_size" decimal(10,2) NOT NULL, "serving_unit" varchar CHECK( "serving_unit" IN ('g','ml','mg','kcal') ) NOT NULL, "serving_per_package" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "material_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "material_id" integer NOT NULL, "product_id" integer NOT NULL, "material_quantity" decimal(10,2) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3388e717d2105465c59edcf13b" ON "material_product" ("material_id", "product_id") `);
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_05290e39dd1ef4fbbcfe329f7bd" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer, CONSTRAINT "UQ_f7e289dde0c4fdfba5bee2de40b" UNIQUE ("name"))`);
        await queryRunner.query(`DROP INDEX "IDX_de9e9ce9cfd69a1fd0d57f7968"`);
        await queryRunner.query(`CREATE TABLE "temporary_product_sub_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "parent_id" integer NOT NULL, "child_id" integer NOT NULL, "quantity" decimal(10,2) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_a857e2eab179d3033cd7e688f57" FOREIGN KEY ("parent_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_e7d536e5d360d61ebd24b2a597e" FOREIGN KEY ("child_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_product_sub_product"("id", "parent_id", "child_id", "quantity", "created_at", "updated_at") SELECT "id", "parent_id", "child_id", "quantity", "created_at", "updated_at" FROM "product_sub_product"`);
        await queryRunner.query(`DROP TABLE "product_sub_product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product_sub_product" RENAME TO "product_sub_product"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_de9e9ce9cfd69a1fd0d57f7968" ON "product_sub_product" ("child_id", "parent_id") `);
        await queryRunner.query(`DROP INDEX "IDX_3388e717d2105465c59edcf13b"`);
        await queryRunner.query(`CREATE TABLE "temporary_material_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "material_id" integer NOT NULL, "product_id" integer NOT NULL, "material_quantity" decimal(10,2) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_b4f92677ba1ae798c1971908412" FOREIGN KEY ("material_id") REFERENCES "material" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_317e70d8f17cc0c17a74b0f3a46" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_material_product"("id", "material_id", "product_id", "material_quantity", "created_at", "updated_at") SELECT "id", "material_id", "product_id", "material_quantity", "created_at", "updated_at" FROM "material_product"`);
        await queryRunner.query(`DROP TABLE "material_product"`);
        await queryRunner.query(`ALTER TABLE "temporary_material_product" RENAME TO "material_product"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3388e717d2105465c59edcf13b" ON "material_product" ("material_id", "product_id") `);
        await queryRunner.query(`CREATE TABLE "temporary_material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer, CONSTRAINT "UQ_f7e289dde0c4fdfba5bee2de40b" UNIQUE ("name"), CONSTRAINT "FK_a2fdcd9734f6b22c4cdc5f5e952" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId" FROM "material"`);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`ALTER TABLE "temporary_material" RENAME TO "material"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material" RENAME TO "temporary_material"`);
        await queryRunner.query(`CREATE TABLE "material" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "energy" varchar NOT NULL DEFAULT ('0'), "protein" varchar NOT NULL DEFAULT ('0'), "total_fat" varchar NOT NULL DEFAULT ('0'), "saturated_fat" varchar NOT NULL DEFAULT ('0'), "trans_fat" varchar NOT NULL DEFAULT ('0'), "cholesterol" varchar NOT NULL DEFAULT ('0'), "carbohydrate" varchar NOT NULL DEFAULT ('0'), "sugars" varchar NOT NULL DEFAULT ('0'), "dietary_fibre" varchar NOT NULL DEFAULT ('0'), "sodium" varchar NOT NULL DEFAULT ('0'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "supplierId" integer, CONSTRAINT "UQ_f7e289dde0c4fdfba5bee2de40b" UNIQUE ("name"))`);
        await queryRunner.query(`INSERT INTO "material"("id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId") SELECT "id", "name", "energy", "protein", "total_fat", "saturated_fat", "trans_fat", "cholesterol", "carbohydrate", "sugars", "dietary_fibre", "sodium", "created_at", "updated_at", "supplierId" FROM "temporary_material"`);
        await queryRunner.query(`DROP TABLE "temporary_material"`);
        await queryRunner.query(`DROP INDEX "IDX_3388e717d2105465c59edcf13b"`);
        await queryRunner.query(`ALTER TABLE "material_product" RENAME TO "temporary_material_product"`);
        await queryRunner.query(`CREATE TABLE "material_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "material_id" integer NOT NULL, "product_id" integer NOT NULL, "material_quantity" decimal(10,2) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "material_product"("id", "material_id", "product_id", "material_quantity", "created_at", "updated_at") SELECT "id", "material_id", "product_id", "material_quantity", "created_at", "updated_at" FROM "temporary_material_product"`);
        await queryRunner.query(`DROP TABLE "temporary_material_product"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3388e717d2105465c59edcf13b" ON "material_product" ("material_id", "product_id") `);
        await queryRunner.query(`DROP INDEX "IDX_de9e9ce9cfd69a1fd0d57f7968"`);
        await queryRunner.query(`ALTER TABLE "product_sub_product" RENAME TO "temporary_product_sub_product"`);
        await queryRunner.query(`CREATE TABLE "product_sub_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "parent_id" integer NOT NULL, "child_id" integer NOT NULL, "quantity" decimal(10,2) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "product_sub_product"("id", "parent_id", "child_id", "quantity", "created_at", "updated_at") SELECT "id", "parent_id", "child_id", "quantity", "created_at", "updated_at" FROM "temporary_product_sub_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product_sub_product"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_de9e9ce9cfd69a1fd0d57f7968" ON "product_sub_product" ("child_id", "parent_id") `);
        await queryRunner.query(`DROP TABLE "material"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`DROP INDEX "IDX_3388e717d2105465c59edcf13b"`);
        await queryRunner.query(`DROP TABLE "material_product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP INDEX "IDX_de9e9ce9cfd69a1fd0d57f7968"`);
        await queryRunner.query(`DROP TABLE "product_sub_product"`);
    }

}
