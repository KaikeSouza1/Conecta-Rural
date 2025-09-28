// Caminho: app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 401 });
    }
    
    // --- LÓGICA DE VERIFICAÇÃO PADRONIZADA ---
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET não está definido no ambiente.');
      return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
    
    const key = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, key);
    // --- FIM DA PADRONIZAÇÃO ---
    
    const usuarioId = BigInt(payload.usuarioId as string);

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        tipoUsuario: true,
        nomeNegocio: true,
        descricaoNegocio: true,
        logoUrl: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Convertendo o BigInt para string para a resposta JSON
    const userResponse = {
      ...usuario,
      id: usuario.id.toString(),
    };

    return NextResponse.json(userResponse);

  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
  }
}