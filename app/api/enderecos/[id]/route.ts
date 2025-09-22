// Caminho: app/api/enderecos/[id]/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUserFromToken(request: NextRequest) {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secret);
        return BigInt(payload.usuarioId as string);
    } catch (error) {
        return null;
    }
}

// ATUALIZAR UM ENDEREÇO EXISTENTE
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const usuarioId = await getUserFromToken(request);
    if (!usuarioId) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    try {
        const id = BigInt(params.id);
        const endereco = await prisma.endereco.findUnique({ where: { id } });

        if (!endereco || endereco.usuarioId !== usuarioId) {
            return NextResponse.json({ error: 'Endereço não encontrado ou você não tem permissão.' }, { status: 404 });
        }

        const body = await request.json();
        const { logradouro, numero, bairro, cep, cidade, estado, complemento, referencia } = body;

        const enderecoAtualizado = await prisma.endereco.update({
            where: { id },
            data: { logradouro, numero, bairro, cep, cidade, estado, complemento, referencia }
        });

        const enderecoSeguro = {...enderecoAtualizado, id: enderecoAtualizado.id.toString(), usuarioId: enderecoAtualizado.usuarioId.toString()};
        return NextResponse.json(enderecoSeguro);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar endereço.' }, { status: 500 });
    }
}

// EXCLUIR UM ENDEREÇO
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const usuarioId = await getUserFromToken(request);
    if (!usuarioId) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    try {
        const id = BigInt(params.id);
        const endereco = await prisma.endereco.findUnique({ where: { id } });

        if (!endereco || endereco.usuarioId !== usuarioId) {
            return NextResponse.json({ error: 'Endereço não encontrado ou você não tem permissão.' }, { status: 404 });
        }

        await prisma.endereco.delete({ where: { id } });
        return new NextResponse(null, { status: 204 }); // Sucesso, sem conteúdo
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao excluir endereço.' }, { status: 500 });
    }
}