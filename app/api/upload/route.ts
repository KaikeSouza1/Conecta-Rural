// Caminho: app/api/upload/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configura o Cloudinary com as suas credenciais (que virão do .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    // Faz o upload do buffer da imagem para o Cloudinary
    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({}, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
      uploadStream.end(buffer);
    });

    // Retorna a URL segura que o Cloudinary gerou
    return NextResponse.json({ success: true, url: (response as any).secure_url });

  } catch (error) {
    console.error("Erro no upload para Cloudinary:", error);
    return NextResponse.json({ success: false, error: 'Erro ao fazer upload da imagem.' });
  }
}