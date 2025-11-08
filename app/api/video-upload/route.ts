import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import streamifier from "streamifier";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ FORCE Node.js runtime in production
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ Parse formData once
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ✅ Convert File to Buffer (safe)
    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ Upload to Cloudinary with streamifier
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "video-upload", resource_type: "video" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });

    // ✅ Save video info to DB
    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: (uploadResult as any).public_id,
        originalSize,
        compressedSize: String((uploadResult as any).bytes),
        duration: (uploadResult as any).duration || 0,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
