import { useTheme } from 'next-themes';

export function useThemeToggle() {
  const { theme, setTheme } = useTheme();

  function toggle() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return { theme, toggle };
}
