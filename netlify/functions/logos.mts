import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  const key = new URL(req.url).pathname.split("/").pop();
  if (!key) return new Response("Not found", { status: 404 });

  const result = await getStore("link-logos").getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.data, {
    headers: {
      "Content-Type": String(result.metadata.contentType ?? "application/octet-stream"),
      // Keys are random UUIDs and never reused, so the content is immutable
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

export const config: Config = {
  path: "/logos/:key",
};
