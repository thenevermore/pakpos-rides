'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      title={`Theme: ${theme}`}
      aria-label={`Toggle theme (current: ${theme})`}
    >
      {theme === 'light' && <Sun className="w-4.5 h-4.5" />}
      {theme === 'dark' && <Moon className="w-4.5 h-4.5" />}
      {theme === 'system' && <Monitor className="w-4.5 h-4.5" />}
    </button>
  );
}
