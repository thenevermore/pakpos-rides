'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, MessageCircle, Send, Link2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${text}\n\n${shareUrl}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      setOpen(!open);
    }
  };

  const shareTo = (platform: string) => {
    const encoded = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };
    window.open(links[platform], '_blank', 'width=600,height=500');
    setOpen(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
        title="Bagikan"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Bagikan</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2">
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Bagikan ke</p>

            <button
              onClick={() => shareTo('whatsapp')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              WhatsApp
            </button>

            <button
              onClick={() => shareTo('telegram')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-[#0088cc] rounded-full flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              Telegram
            </button>

            <button
              onClick={() => shareTo('twitter')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white dark:fill-black"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </div>
              X (Twitter)
            </button>

            <button
              onClick={() => shareTo('facebook')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              Facebook
            </button>

            <hr className="my-1.5 border-gray-100 dark:border-gray-800" />

            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                {copied ? <Check className="w-4 h-4 text-white" /> : <Link2 className="w-4 h-4 text-white" />}
              </div>
              {copied ? 'Link disalin!' : 'Salin Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
