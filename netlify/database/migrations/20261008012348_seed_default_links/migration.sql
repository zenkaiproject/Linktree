-- Seed the links that were previously hardcoded in src/constants.ts
INSERT INTO "links" ("title", "url", "icon", "color", "position") VALUES
  ('Portfolio', 'https://tod-ai-pearl.vercel.app', 'Briefcase', 'bg-indigo-600', 1),
  ('Traktir Kopi', 'https://sociabuzz.com/zenkaitsu/tribe', 'Coffee', 'bg-amber-600', 2),
  ('WhatsApp', 'https://wa.me/6285183729186', 'MessageCircle', 'bg-green-600', 3),
  ('Instagram', 'https://instagram.com/zenkaiproject99', 'Instagram', 'bg-pink-600', 4),
  ('YouTube', 'https://youtube.com/@zenkaitsu', 'Youtube', 'bg-red-600', 5),
  ('TikTok', 'https://tiktok.com/@zenkaitsu', 'Music2', 'bg-zinc-900', 6);
