import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";

import { PrismaClient } from "@prisma/client";

const prisma=new PrismaClient()

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  [key: string]: unknown;
  bytes:number;
  duration?:number
}

export async function POST(request: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
  }

  if (
    ! process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY||
  ! process.env.CLOUDINARY_API_SECRET
  ) {
        return NextResponse.json({ error: "cloudinary credentials is not found" }, { status: 401 });

  }

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const title=formData.get("title") as string;
    const description=formData.get("description") as string
    const originalSize=formData.get("originalSize") as string
    

    if (!file) {
      return NextResponse.json({ error: "file is not found" });
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

   const result= await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const upload_stream = cloudinary.uploader.upload_stream(
        { folder: "video-upload" ,
            resource_type:"video",
           
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        }
      );
      upload_stream.end(buffer);
    });
  const video=await prisma.video.create({
    data:{
        title:title,
        description:description,
        publicId:result.public_id,
        originalSize:originalSize,
        compressedSize:String(result.bytes),
        duration:result.duration || 0

    }
  })
    
    return NextResponse.json(video,{status:200})
  } catch (error) {
 console.log("Upload video  failed",error);
 return NextResponse.json({error:error},{status:500})
  }
  finally{
    await prisma.$disconnect()
  }
}
