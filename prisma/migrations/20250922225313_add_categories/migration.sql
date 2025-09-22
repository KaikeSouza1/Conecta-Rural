-- DropIndex
DROP INDEX "produtos_categoria_id_idx";

-- AlterTable
ALTER TABLE "pedidos" ALTER COLUMN "status_pedido" SET DEFAULT 'processando';
