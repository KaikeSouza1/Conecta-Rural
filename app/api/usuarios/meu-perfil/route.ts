// Caminho: app/api/usuarios/meu-perfil/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Função para ATUALIZAR o perfil do usuário logado
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    
    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);

    const body = await request.json();
    const { nomeNegocio, descricaoNegocio, logoUrl } = body;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nomeNegocio,
        descricaoNegocio,
        logoUrl,
      },
    });
    
    // Remove dados sensíveis antes de retornar
    const { senhaHash, ...usuarioSeguro } = usuarioAtualizado;

    const responsePayload = {
        ...usuarioSeguro,
        id: usuarioSeguro.id.toString()
    }

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: 'Erro ao atualizar o perfil.' }, { status: 500 });
  }
}