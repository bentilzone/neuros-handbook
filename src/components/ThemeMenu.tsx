// System, light or dark, from a small menu: the handbook follows the device until the reader picks.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

type Choice = 'light' | 'dark' | null;

const Monitor = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
const Sun = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const Moon = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
const Check = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5L20 7" /></svg>;

const CHOICES: { value: Choice; label: string; icon: () => ReactNode }[] = [
  { value: null, label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export default function ThemeMenu(): ReactNode {
  const { colorModeChoice, setColorMode } = useColorMode();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  const Current = (CHOICES.find((c) => c.value === colorModeChoice) ?? CHOICES[0]).icon;
  return (
    <div className="nh-theme" ref={root}>
      <button type="button" className="nh-theme__button" aria-label="Theme" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Current />
      </button>
      {open && (
        <div className="nh-theme__menu" role="menu">
          {CHOICES.map(({ value, label, icon: Icon }) => (
            <button key={label} type="button" role="menuitemradio" aria-checked={colorModeChoice === value} className="nh-theme__item" onClick={() => { setColorMode(value); setOpen(false); }}>
              <Icon />
              <span>{label}</span>
              {colorModeChoice === value && <Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
