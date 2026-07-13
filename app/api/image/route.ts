import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL" }, { status: 400 });
  }

  const match = url.match(/\/d\/([^/]+)/);

  if (!match) {
    return NextResponse.json(
      { error: "Invalid Google Drive URL" },
      { status: 400 }
    );
  }

  const fileId = match[1];

  try {
    const imageUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=view&confirm=t`;

    const response = await fetch(imageUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    const contentType = response.headers.get("content-type") || "";

    console.log("STATUS:", response.status);
    console.log("TYPE:", contentType);
    console.log("URL:", response.url);

    if (!response.ok || !contentType.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Google returned non-image",
          status: response.status,
          type: contentType,
        },
        { status: 404 }
      );
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public,max-age=31536000,immutable",
      },
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}