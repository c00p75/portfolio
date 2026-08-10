export const THEME_KEY = 'theme';

/**
 * Applies the stored theme before first paint. Inlined and blocking on purpose:
 * deferring it produces a flash of the wrong palette on every navigation.
 * No stored preference means no attribute, which lets the CSS
 * `prefers-color-scheme` block decide — the three-state model the tokens expect.
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
