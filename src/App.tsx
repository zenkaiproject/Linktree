import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  MoreHorizontal, 
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import { DEFAULT_LINKS, SOCIAL_LINKS, ICON_MAP, LinkItem } from './constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

interface LinkCardProps {
  key?: string | number;
  link: LinkItem;
  isDarkMode: boolean;
}

export const LinkLogo = ({ link, size = 'w-12 h-12' }: { link: LinkItem; size?: string }) => {
  const Icon = ICON_MAP[link.icon] || ICON_MAP.ExternalLink;

  if (link.logoUrl) {
    return (
      <div className={`flex items-center justify-center ${size} rounded-xl overflow-hidden bg-white/10 shadow-lg shrink-0`}>
        <img src={link.logoUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${size} rounded-xl ${link.color || 'bg-zinc-500'} text-white shadow-lg shrink-0`}>
      <Icon size={24} />
    </div>
  );
};

const LinkCard = ({ link, isDarkMode }: LinkCardProps) => {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      variants={itemVariants}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex items-center p-4 w-full rounded-2xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/5' 
          : 'bg-white hover:bg-zinc-50 border border-zinc-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="mr-4 group-hover:rotate-6 transition-transform">
        <LinkLogo link={link} />
      </div>
      <div className="flex-1 text-left">
        <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{link.title}</h3>
      </div>
      <div className={`${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-zinc-600 transition-colors`}>
        <ChevronRight size={20} />
      </div>
    </motion.a>
  );
};

export const GalaxyBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#020617]">
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
      
      {/* Nebulas */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px]" />
      
      {/* Shooting Stars */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: '120%', y: '-20%', opacity: 0 }}
            animate={{
              x: '-20%',
              y: '120%',
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 0.5,
              repeat: Infinity,
              delay: Math.random() * 15,
              ease: "linear"
            }}
            className="absolute w-[200px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent rotate-[-45deg]"
          />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [links, setLinks] = useState<LinkItem[] | null>(null);

  useEffect(() => {
    fetch('/api/links')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setLinks)
      .catch(() => setLinks(DEFAULT_LINKS));
  }, []);

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden">
      <GalaxyBackground />
      
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 0px;
          }
          .custom-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* Floating Controls */}
      <div className="fixed top-6 right-6 flex gap-3 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }}
          className="p-3 rounded-full glass-dark text-white shadow-lg backdrop-blur-md"
        >
          <Share2 size={20} />
        </motion.button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-12 pb-32 px-4 sm:px-6 touch-pan-y">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md mx-auto flex flex-col items-center will-change-transform"
        >
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="relative mb-8 flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Animated Border Ring */}
              <motion.div 
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.08, 1],
                }}
                whileHover={{ 
                  scale: 1.15,
                  opacity: 1,
                  filter: "blur(4px)"
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.3 },
                  filter: { duration: 0.3 }
                }}
                className="absolute -inset-2 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-[2px] transition-all duration-500"
              />
              
              {/* Inner Glow */}
              <div className="absolute -inset-2 rounded-full bg-white/10 blur-xl group-hover:bg-indigo-500/30 transition-all duration-700" />
              
              {/* Image Container */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-32 h-32 rounded-full border-2 border-white/40 shadow-2xl overflow-hidden z-10"
              >
                <img 
                  src="https://drive.google.com/thumbnail?id=1eT4bFwqK_Lpu98hTeQAfk7KR5A--72TV&sz=w1000" 
                  alt="Zen Profile" 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
            
            <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-white text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Zen
            </h1>
            <p className="mt-2 text-center font-medium text-zinc-400 tracking-widest uppercase text-[10px]">
              Digital Creator & Gamer
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants} className="flex gap-4 mb-10">
            {SOCIAL_LINKS.map((social) => (
              <motion.a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl transition-all bg-white/10 text-white hover:bg-white/20 border border-white/5"
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </motion.div>

          {/* Links List */}
          {links ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="w-full space-y-4"
            >
              {links.map((link) => (
                <LinkCard 
                  key={link.id} 
                  link={link} 
                  isDarkMode={true} 
                />
              ))}
            </motion.div>
          ) : (
            <div className="w-full space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 w-full rounded-2xl bg-zinc-800/40 border border-white/5 animate-pulse" />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Fixed Footer */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-50 py-6 flex flex-col items-center gap-2 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent pointer-events-none"
      >
        <div className="flex items-center gap-2 font-display font-bold text-lg text-white pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            Z
          </div>
          <span>Zenkai Project</span>
        </div>
        <p className="text-xs text-white/40 pointer-events-auto">© 2026 Zenkai Project. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
