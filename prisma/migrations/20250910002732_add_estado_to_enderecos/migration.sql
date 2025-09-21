/*
  Warnings:

  - Added the required column `estado` to the `enderecos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_endereco` to the `enderecos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "enderecos" ADD COLUMN     "estado" VARCHAR(2) NOT NULL,
ADD COLUMN     "tipo_endereco" TEXT NOT NULL,
ALTER COLUMN "cidade" DROP DEFAULT;
