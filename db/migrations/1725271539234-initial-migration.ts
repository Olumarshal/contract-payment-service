import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1725271539234 implements MigrationInterface {
  name = 'InitialMigration1725271539234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."profiles_role_enum" AS ENUM('client', 'contractor')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "profession" character varying NOT NULL, "balance" numeric(10,2) NOT NULL, "role" "public"."profiles_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2c0c7196c89bdcc9b04f29f3fe6" UNIQUE ("uuid"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_status_enum" AS ENUM('new', 'in_progress', 'terminated')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contracts" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "terms" text NOT NULL, "status" "public"."contracts_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "contractorId" integer NOT NULL, "clientId" integer NOT NULL, CONSTRAINT "UQ_d47764660e5f64763194e3c66f1" UNIQUE ("uuid"), CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "jobs" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "isPaid" boolean NOT NULL DEFAULT false, "paidDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "contractId" integer NOT NULL, CONSTRAINT "UQ_2ad99c480880ac224b7e39338ba" UNIQUE ("uuid"), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_25e8a897e43bfc4dde1f0918995" FOREIGN KEY ("contractorId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_62a5163bebb9d95e503b01c0fb0" FOREIGN KEY ("clientId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_f4f2e7125f414668e5d0bef8233" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_f4f2e7125f414668e5d0bef8233"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_62a5163bebb9d95e503b01c0fb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_25e8a897e43bfc4dde1f0918995"`,
    );
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TABLE "contracts"`);
    await queryRunner.query(`DROP TYPE "public"."contracts_status_enum"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_role_enum"`);
  }
}
