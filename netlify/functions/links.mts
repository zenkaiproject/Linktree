import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { links, type Link } from "../../db/schema.js";
import { COLOR_OPTIONS, ICON_NAMES, LOGO_TYPES, MAX_LOGO_BYTES } from "../../src/linkOptions.js";

const logos = () => getStore("link-logos");

const toApi = (link: Link) => ({
  id: link.id,
  title: link.title,
  url: link.url,
  icon: link.icon,
  color: link.color,
  logoUrl: link.logoKey ? `/logos/${link.logoKey}` : null,
  position: link.position,
});

const error = (message: string, status: number) => Response.json({ error: message }, { status });

const isAdmin = async () => {
  const user = await getUser();
  return !!user?.roles?.includes("admin");
};

// Cookie-based auth: reject cross-site mutation requests.
const isSameOrigin = (req: Request) => req.headers.get("origin") === new URL(req.url).origin;

const isValidUrl = (value: string) => {
  try {
    return ["http:", "https:", "mailto:", "tel:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const saveLogo = async (file: File) => {
  if (!LOGO_TYPES.includes(file.type)) throw new Error("Format logo harus PNG, JPG, WEBP, atau GIF");
  if (file.size > MAX_LOGO_BYTES) throw new Error("Ukuran logo maksimal 2 MB");
  const key = crypto.randomUUID();
  await logos().set(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
  return key;
};

const getFile = (form: FormData) => {
  const file = form.get("logo");
  return file instanceof File && file.size > 0 ? file : null;
};

export default async (req: Request) => {
  const id = Number(new URL(req.url).pathname.split("/")[3]);

  if (req.method === "GET") {
    const rows = await db.select().from(links).orderBy(asc(links.position), asc(links.id));
    return Response.json(rows.map(toApi));
  }

  if (!isSameOrigin(req)) return error("Forbidden", 403);
  if (!(await isAdmin())) return error("Unauthorized", 401);

  if (req.method === "POST") {
    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim();
    const url = String(form.get("url") ?? "").trim();
    const icon = String(form.get("icon") ?? "ExternalLink");
    const color = String(form.get("color") ?? COLOR_OPTIONS[0]);

    if (!title) return error("Judul wajib diisi", 400);
    if (!isValidUrl(url)) return error("URL tidak valid", 400);
    if (!(ICON_NAMES as readonly string[]).includes(icon)) return error("Ikon tidak valid", 400);
    if (!(COLOR_OPTIONS as readonly string[]).includes(color)) return error("Warna tidak valid", 400);

    let logoKey: string | null = null;
    const file = getFile(form);
    if (file) {
      try {
        logoKey = await saveLogo(file);
      } catch (e) {
        return error((e as Error).message, 400);
      }
    }

    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${links.position}), 0) + 1` })
      .from(links);
    const [link] = await db
      .insert(links)
      .values({ title, url, icon, color, logoKey, position: Number(next) })
      .returning();
    return Response.json(toApi(link), { status: 201 });
  }

  if (!Number.isInteger(id) || id <= 0) return error("Not found", 404);
  const [existing] = await db.select().from(links).where(eq(links.id, id));
  if (!existing) return error("Link tidak ditemukan", 404);

  // Update logo/icon of an existing link
  if (req.method === "PATCH") {
    const form = await req.formData();
    const updates: Partial<Link> = {};

    const icon = form.get("icon");
    if (icon !== null) {
      if (!(ICON_NAMES as readonly string[]).includes(String(icon))) return error("Ikon tidak valid", 400);
      updates.icon = String(icon);
    }

    const file = getFile(form);
    if (file) {
      try {
        updates.logoKey = await saveLogo(file);
      } catch (e) {
        return error((e as Error).message, 400);
      }
    } else if (form.get("removeLogo") === "1") {
      updates.logoKey = null;
    }

    if (Object.keys(updates).length === 0) return Response.json(toApi(existing));

    const [link] = await db.update(links).set(updates).where(eq(links.id, id)).returning();
    if ("logoKey" in updates && existing.logoKey) await logos().delete(existing.logoKey);
    return Response.json(toApi(link));
  }

  if (req.method === "DELETE") {
    await db.delete(links).where(eq(links.id, id));
    if (existing.logoKey) await logos().delete(existing.logoKey);
    return new Response(null, { status: 204 });
  }

  return error("Method not allowed", 405);
};

export const config: Config = {
  path: ["/api/links", "/api/links/:id"],
};
