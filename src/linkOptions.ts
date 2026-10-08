// Shared between the frontend and Netlify Functions — keep this file dependency-free.

export const ICON_NAMES = [
  'ExternalLink',
  'Briefcase',
  'Coffee',
  'MessageCircle',
  'Instagram',
  'Youtube',
  'Music2',
  'Music',
  'Globe',
  'Camera',
  'ShoppingBag',
  'Github',
  'Twitter',
  'Linkedin',
  'Mail',
] as const;

// Full class names so Tailwind picks them up when scanning source files.
export const COLOR_OPTIONS = [
  'bg-indigo-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-red-600',
  'bg-amber-600',
  'bg-green-600',
  'bg-teal-600',
  'bg-sky-600',
  'bg-blue-600',
  'bg-zinc-900',
] as const;

export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export interface ApiLink {
  id: number;
  title: string;
  url: string;
  icon: string;
  color: string;
  logoUrl: string | null;
  position: number;
}
