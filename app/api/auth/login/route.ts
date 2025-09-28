// Caminho: app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    // --- CORREÇÃO APLICADA AQUI ---
    // Trocado 'usuario.senha' por 'usuario.senhaHash' para bater com o banco de dados.
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    // --- FIM DA CORREÇÃO ---
    
    if (!senhaValida) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET não está definido no ambiente.');
      return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }

    const key = new TextEncoder().encode(secret);

    const token = await new SignJWT({ usuarioId: usuario.id.toString() })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(key);

    return NextResponse.json({ token });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Não foi possível fazer o login.' }, { status: 500 });
  }
}