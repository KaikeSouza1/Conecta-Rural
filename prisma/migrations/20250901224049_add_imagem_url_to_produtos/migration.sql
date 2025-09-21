-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "logradouro" VARCHAR(255) NOT NULL,
    "numero" VARCHAR(20),
    "bairro" VARCHAR(100) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL DEFAULT 'União da Vitória',
    "cep" VARCHAR(9) NOT NULL,
    "referencia" TEXT,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "pedido_id" BIGINT NOT NULL,
    "produto_id" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario_compra" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("pedido_id","produto_id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" BIGSERIAL NOT NULL,
    "consumidor_id" BIGINT NOT NULL,
    "endereco_entrega_id" BIGINT NOT NULL,
    "valor_produtos" DECIMAL(10,2) NOT NULL,
    "valor_entrega" DECIMAL(10,2) DEFAULT 0.00,
    "valor_comissao" DECIMAL(10,2),
    "valor_total" DECIMAL(10,2),
    "status_pedido" VARCHAR(50) NOT NULL DEFAULT 'pendente',
    "criado_em" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6),

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" BIGSERIAL NOT NULL,
    "vendedor_id" BIGINT NOT NULL,
    "categoria_id" INTEGER,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "imagem_url" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "unidade_medida" VARCHAR(20) NOT NULL,
    "estoque" INTEGER,
    "ativo" BOOLEAN DEFAULT true,
    "criado_em" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6),

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nome_completo" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "cpf_cnpj" VARCHAR(18) NOT NULL,
    "telefone" VARCHAR(20),
    "tipo_usuario" VARCHAR(20) NOT NULL,
    "nome_negocio" VARCHAR(255),
    "descricao_negocio" TEXT,
    "criado_em" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE INDEX "pedidos_consumidor_id_idx" ON "pedidos"("consumidor_id");

-- CreateIndex
CREATE INDEX "pedidos_status_pedido_idx" ON "pedidos"("status_pedido");

-- CreateIndex
CREATE INDEX "produtos_categoria_id_idx" ON "produtos"("categoria_id");

-- CreateIndex
CREATE INDEX "produtos_vendedor_id_idx" ON "produtos"("vendedor_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_cnpj_key" ON "usuarios"("cpf_cnpj");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_consumidor_id_fkey" FOREIGN KEY ("consumidor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_endereco_entrega_id_fkey" FOREIGN KEY ("endereco_entrega_id") REFERENCES "enderecos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
