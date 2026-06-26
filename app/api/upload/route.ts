import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"

// Client-side upload handler — lets large PDF files upload directly to Blob,
// bypassing serverless request body size limits.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // No-op: the exam record is created separately once the URL is known.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
