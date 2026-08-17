import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { adrBySlug, allAdrs } from '@/lib/content';
import { site } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Prerender one card per record at build time. Without this the route is served
 * on demand, and the first crawler to request it — usually the one that matters,
 * because it is the link someone just pasted into LinkedIn — pays the render.
 */
export function generateStaticParams() {
  return allAdrs().map((a) => ({ slug: a.slug }));
}

/* The palette is duplicated from globals.css rather than imported: this renders
   through satori, which never sees a stylesheet or a CSS custom property. */
const INK = '#0b0b0b';
const ON_INK = '#efeae2';
const MUTED = '#94908c';
const LINE = '#2b2b2b';

const accents = {
  cyan: '#63d6c6',
  pink: '#ff2e6b',
  yellow: '#f7d91c',
  orange: '#f5821f',
  lime: '#93cc46',
} as const;

/** Read once per process; the same two faces are used for every card. */
const fontDir = path.join(process.cwd(), 'src/assets/fonts');
const loadFonts = async () =>
  Promise.all([
    readFile(path.join(fontDir, 'Anton-Regular.ttf')),
    readFile(path.join(fontDir, 'JetBrainsMono-Bold.ttf')),
  ]);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adr = adrBySlug(slug);
  const [anton, mono] = await loadFonts();

  const accent = accents[adr?.accent ?? 'cyan'];
  const title = adr?.title ?? 'Architecture decision record';
  const ref = adr ? `ADR-${String(adr.number).padStart(3, '0')}` : 'ADR';

  /* Anton is extremely condensed, so it takes a lot of characters before a
     title needs stepping down. Two breakpoints is enough for the range the
     schema allows (title is capped at 120 characters). */
  const titleSize = title.length > 78 ? 68 : title.length > 46 ? 84 : 104;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: INK,
          color: ON_INK,
          padding: '64px 72px',
          fontFamily: 'JetBrains Mono',
        }}
      >
        {/* Top rail: record number, status, domain — the same three facts the
            page header leads with. */}
        {/* Built as a flat array rather than nested fragments: satori resolves
            `align-items` against direct flex children only, so a divider inside
            a fragment gets stretched to the line height instead of centred. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 24 }}>
          {[
            <span key="ref" style={{ color: accent, letterSpacing: '0.08em' }}>
              {ref}
            </span>,
            <span
              key="rule-1"
              style={{ width: 40, height: 2, background: LINE, flexShrink: 0 }}
            />,
            <span
              key="status"
              style={{ color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              {adr?.status ?? 'accepted'}
            </span>,
            ...(adr?.domain
              ? [
                  <span
                    key="rule-2"
                    style={{ width: 40, height: 2, background: LINE, flexShrink: 0 }}
                  />,
                  <span
                    key="domain"
                    style={{ color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em' }}
                  >
                    {adr.domain}
                  </span>,
                ]
              : []),
          ]}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            // Satori has no text-wrap balancing, so the box is bounded instead
            // and the size steps down for long titles.
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              fontFamily: 'Anton',
              fontSize: titleSize,
              lineHeight: 1.02,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 72, height: 6, background: accent }} />
            <span style={{ fontSize: 24, color: MUTED, letterSpacing: '0.04em' }}>
              Decision record
            </span>
          </div>
        </div>

        {/* Bottom rail: whose site this is. The one thing a crawler card has to
            carry that the page itself does not repeat. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 24,
            color: MUTED,
            letterSpacing: '0.06em',
          }}
        >
          <span style={{ color: ON_INK }}>{site.name}</span>
          <span>{site.url.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Anton', data: anton, style: 'normal', weight: 400 },
        { name: 'JetBrains Mono', data: mono, style: 'normal', weight: 700 },
      ],
    },
  );
}
