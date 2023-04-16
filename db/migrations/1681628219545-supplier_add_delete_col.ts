import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierAddDeleteCol1681628219545 implements MigrationInterface {
    name = 'SupplierAddDeleteCol1681628219545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
        await queryRunner.query(`INSERT INTO "temporary_supplier"("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM "supplier"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`ALTER TABLE "temporary_supplier" RENAME TO "supplier"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" RENAME TO "temporary_supplier"`);
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "supplier"("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM "temporary_supplier"`);
        await queryRunner.query(`DROP TABLE "temporary_supplier"`);
    }

}
