import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const artist = searchParams.get("artist") ?? "";
    const song = searchParams.get("song") ?? "";
    const image_url = searchParams.get("image_url");
    const data_url = image_url ? await createDataURL(image_url) : null;

    return new ImageResponse(
      (
        <div
          style={{
            fontFamily: "Noto Sans",
            fontSize: 48,
            fontWeight: 600,
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0A0A0A",
            color: "#FAFAFA",
            gap: "8rem",
          }}
        >
          <div
            style={{
              left: 42,
              top: 42,
              position: "absolute",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                background: "#FAFAFA",
              }}
            />
            <span
              style={{
                marginLeft: 8,
                fontSize: 24,
              }}
            >
              guess the lyrics.
            </span>
          </div>
          {data_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${artist} - ${song}, album cover`}
              src={data_url}
              height="300"
              width="300"
              style={{ borderRadius: "40px" }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p>{song}</p>
            <p style={{ opacity: "0.5" }}>{artist}</p>
          </div>
        </div>
      ),
      {
        width: 1600,
        height: 800,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

async function createDataURL(image_url: string) {
  const response = await fetch(new Request(image_url));
  if (!response.ok) {
    throw new Error(`Failed to fetch the image: ${response.statusText}`);
  }
  const blob = await response.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const data_url = `data:${blob.type};base64,${buffer.toString("base64")}`;
  return data_url;
}
