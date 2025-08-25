

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    // 1. Validação de entrada
    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    // 2. Encontrar o usuário no banco de dados
    const usuario = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (!usuario) {
      // Usamos uma mensagem genérica por segurança, para não revelar se o email existe ou não.
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 }); // 401 Unauthorized
    }

    // 3. Comparar a senha enviada com a senha criptografada do banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaCorreta) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    // 4. Se a senha estiver correta, gerar o Token JWT
    const tokenPayload = {
      usuarioId: usuario.id.toString(), // Converte o BigInt para string
      tipoUsuario: usuario.tipoUsuario,
      nome: usuario.nomeCompleto,
    };

    // Assina o token com a chave secreta e define uma validade
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '1d', // Token válido por 1 dia
    });

    // 5. Retornar o token para o cliente
    return NextResponse.json({ token: token });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}