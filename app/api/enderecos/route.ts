// Caminho: app/api/enderecos/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Função para BUSCAR os endereços do usuário logado
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);

    const enderecos = await prisma.endereco.findMany({
      where: { usuarioId: usuarioId },
    });

    const enderecosSeguros = enderecos.map(e => ({...e, id: e.id.toString(), usuarioId: e.usuarioId.toString()}));

    return NextResponse.json(enderecosSeguros);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar endereços.' }, { status: 500 });
  }
}

// Função para CRIAR um novo endereço para o usuário logado
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);

    const body = await request.json();
    const { logradouro, numero, bairro, cep, cidade, estado, complemento, referencia } = body;
    
    if (!logradouro || !bairro || !cep || !cidade) {
        return NextResponse.json({ error: 'Campos obrigatórios do endereço faltando.'}, { status: 400 });
    }

    const novoEndereco = await prisma.endereco.create({
      data: {
        usuarioId,
        logradouro,
        numero,
        bairro,
        cep,
        cidade,
        estado: estado || 'PR',
        complemento,
        referencia,
        tipoEndereco: 'entrega', // Fixo por enquanto
      },
    });

    const enderecoSeguro = {...novoEndereco, id: novoEndereco.id.toString(), usuarioId: novoEndereco.usuarioId.toString()};
    return NextResponse.json(enderecoSeguro, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar endereço:", error)
    return NextResponse.json({ error: 'Erro ao criar endereço.' }, { status: 500 });
  }
}