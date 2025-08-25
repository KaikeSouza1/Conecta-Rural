import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome_completo, email, senha, cpf_cnpj, telefone, tipo_usuario, nome_negocio, descricao_negocio } = body;

    if (!email || !senha || !nome_completo || !cpf_cnpj || !tipo_usuario) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando.' }, { status: 400 });
    }
    if (tipo_usuario === 'vendedor' && !nome_negocio) {
      return NextResponse.json({ error: 'Vendedores devem informar o nome do negócio.' }, { status: 400 });
    }

    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email: email }, { cpfCnpj: cpf_cnpj }],
      },
    });

    if (usuarioExistente) {
      const campo = usuarioExistente.email === email ? 'E-mail' : 'CPF/CNPJ';
      return NextResponse.json({ error: `${campo} já está em uso.` }, { status: 409 });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nomeCompleto: nome_completo,
        email: email,
        senhaHash: senhaHash,
        cpfCnpj: cpf_cnpj,
        telefone: telefone,
        tipoUsuario: tipo_usuario,
        nomeNegocio: tipo_usuario === 'vendedor' ? nome_negocio : null,
        descricaoNegocio: tipo_usuario === 'vendedor' ? descricao_negocio : null,
      },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        tipoUsuario: true,
        criadoEm: true,
      },
    });
    
    const usuarioSeguroParaJSON = {
      ...novoUsuario,
      id: novoUsuario.id.toString(),
    };

    return NextResponse.json(usuarioSeguroParaJSON, { status: 201 });

  } catch (error) {
    console.error('Falha na criação do usuário:', error);

    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      const errorMessage = error.message;

      if (errorMessage.includes('CPF inválido') || errorMessage.includes('CNPJ inválido') || errorMessage.includes('Documento inválido')) {
        return NextResponse.json({ error: 'CPF ou CNPJ inválido.' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}