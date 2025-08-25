// Caminho: app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      // O middleware já deve ter barrado isso, mas é uma segurança extra.
      return NextResponse.json({ error: 'Token não encontrado.' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = payload.usuarioId as string;

    const usuario = await prisma.usuario.findUnique({
      where: { id: BigInt(usuarioId) },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        tipoUsuario: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário do token não encontrado.' }, { status: 404 });
    }

    // Converte o BigInt para string para a resposta JSON
    const usuarioSeguro = {
      ...usuario,
      id: usuario.id.toString(),
    };

    return NextResponse.json(usuarioSeguro);

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados do usuário.' }, { status: 500 });
  }
}