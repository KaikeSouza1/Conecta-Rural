// Caminho: middleware.ts (na raiz do projeto)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Token de autenticação não fornecido.' },
      { status: 401 }
    );
  }

  try {
    // Verifica se o token é válido
    await jwtVerify(token, secret);
    // Se for válido, apenas continua para a rota solicitada
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido ou expirado.' },
      { status: 401 }
    );
  }
}

// Configuração para definir quais rotas serão protegidas pelo middleware
export const config = {
  matcher: '/api/auth/me', // Por enquanto, só protege esta rota
};