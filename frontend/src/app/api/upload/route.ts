import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // File size limit: 250MB (supports videos and larger study materials)
    const MAX_SIZE = 250 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum permitted limit of 250MB.' },
        { status: 400 }
      );
    }

    // Supported extensions check including videos, documents, and archives
    const allowedExts = [
      '.pdf', '.doc', '.docx', '.ppt', '.pptx',
      '.xls', '.xlsx', '.txt', '.zip', '.rar',
      '.png', '.jpg', '.jpeg', '.webp',
      '.mp4', '.webm', '.mov', '.mkv', '.avi', '.flv', '.m4v'
    ];
    const originalExt = path.extname(file.name).toLowerCase();
    if (!allowedExts.includes(originalExt)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file format (${originalExt}). Allowed formats: MP4, WEBM, MOV, PDF, DOC, DOCX, PPT, XLS, TXT, ZIP, Images.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;
    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: formatBytes(file.size),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Upload failed.' }, { status: 500 });
  }
}
