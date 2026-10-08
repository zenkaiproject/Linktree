import { 
  Github, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Globe, 
  Mail, 
  MessageCircle,
  ExternalLink,
  Music,
  ShoppingBag,
  Briefcase,
  Camera,
  Coffee,
  Music2
} from 'lucide-react';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  color?: string;
}

export interface SocialItem {
  id: string;
  platform: string;
  url: string;
  icon: any;
}

export const DEFAULT_LINKS: LinkItem[] = [
  {
    id: '1',
    title: 'Portfolio',
    url: 'https://tod-ai-pearl.vercel.app',
    icon: 'Briefcase',
    color: 'bg-indigo-600'
  },
  {
    id: '2',
    title: 'Traktir Kopi',
    url: 'https://sociabuzz.com/zenkaitsu/tribe',
    icon: 'Coffee',
    color: 'bg-amber-600'
  },
  {
    id: '3',
    title: 'WhatsApp',
    url: 'https://wa.me/6285183729186',
    icon: 'MessageCircle',
    color: 'bg-green-600'
  },
  {
    id: '4',
    title: 'Instagram',
    url: 'https://instagram.com/zenkaiproject99',
    icon: 'Instagram',
    color: 'bg-pink-600'
  },
  {
    id: '5',
    title: 'YouTube',
    url: 'https://youtube.com/@zenkaitsu',
    icon: 'Youtube',
    color: 'bg-red-600'
  },
  {
    id: '6',
    title: 'TikTok',
    url: 'https://tiktok.com/@zenkaitsu',
    icon: 'Music2',
    color: 'bg-black'
  },
  {
    id: '7',
    title: 'Download Aux Labs',
    url: '/AUX-Lab-0.3.6.apk',
    icon: 'AuxLab',
    color: 'bg-black'
  }
];

export const SOCIAL_LINKS: SocialItem[] = [
  { id: 's3', platform: 'GitHub', url: 'https://github.com/zenkaiproject', icon: Github },
  { id: 's5', platform: 'Email', url: 'mailto:umaidifirmanardiyanto@gmail.com', icon: Mail },
];

export const ICON_MAP: Record<string, any> = {
  Briefcase,
  Youtube,
  ShoppingBag,
  Music,
  Coffee,
  Globe,
  Camera,
  MessageCircle,
  Instagram,
  ExternalLink,
  Music2
};
