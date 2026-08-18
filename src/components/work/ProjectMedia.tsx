import Image from 'next/image';
import type { Project } from '@/lib/content';
import { cn } from '@/lib/cn';
import { accentText } from '@/components/ui/Sticker';

type VeliteImage = { src: string; width?: number; height?: number; blurDataURL?: string };

/**
 * A screenshot taller than it is wide came off a handset, not a desktop.
 *
 * It matters because the two cannot share a layout. A desktop capture is about
 * 16:10, so "full width, height follows the aspect" is right for it. The same
 * rule applied to a 1:2.2 phone screen renders a column of a page more than two
 * thousand pixels tall — the picture is not wrong, it is just being asked to be
 * a shape it is not.
 */
function isPortrait(img: VeliteImage) {
  return (img.height ?? 0) > (img.width ?? 0);
}

/**
 * The width a phone screenshot is shown at: close enough to a real handset that
 * the UI in it reads at roughly the size its users see, rather than blown up to
 * fill whatever column it landed in.
 */
const PHONE_WIDTH = 'w-full max-w-[19rem]';

/**
 * Case-study media: optional screen recording, then a screenshot gallery.
 * Cover lives on the card / hero — this block is the evidence strip.
 */
export function ProjectMedia({
  video,
  gallery,
}: {
  video?: Project['video'];
  gallery: Project['gallery'];
}) {
  if (!video && gallery.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {video ? (
        <figure>
          <div className="border-ink-line overflow-hidden rounded-panel border bg-black/40">
            <video
              className="aspect-video w-full"
              controls
              playsInline
              preload="metadata"
              poster={video.poster ? (video.poster as VeliteImage).src : undefined}
            >
              <source src={video.src} type="video/mp4" />
            </video>
          </div>
          {video.caption ? (
            <figcaption className="font-mono text-on-ink-muted mt-3 text-micro uppercase">
              {video.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {gallery.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2">
          {gallery.map((item) => {
            const img = item.image as VeliteImage;
            const phone = isPortrait(img);
            return (
              <li key={img.src}>
                <figure
                  className={cn(
                    'border-ink-line overflow-hidden rounded-panel border',
                    // Centred rather than left-aligned: a narrow picture pinned to
                    // one edge of a wide cell reads as a layout mistake.
                    phone && 'mx-auto',
                    phone && PHONE_WIDTH,
                  )}
                >
                  <Image
                    src={img.src}
                    alt={item.alt}
                    width={img.width ?? 1600}
                    height={img.height ?? 1000}
                    className="h-auto w-full object-cover object-top"
                    sizes={phone ? '19rem' : '(max-width: 640px) 100vw, 50vw'}
                  />
                  {item.caption ? (
                    <figcaption className="font-mono text-on-ink-muted border-ink-line border-t px-4 py-3 text-micro uppercase">
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Cover image for project cards. Deliberately a wide band rather than a
 * near-square: the card is a scan target, so the screenshot is a hint at what
 * the thing looks like, not a viewing experience.
 */
const BAND = 'border-ink-line relative aspect-2/1 overflow-hidden border-b bg-black/20';

/** First letters of the project name — the placeholder's only real content. */
function monogram(title: string) {
  return title
    .split(/[\s—–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Stands in for a cover on projects with no shippable screenshot — several are
 * internal systems with nothing I can publish a picture of. Deliberately
 * abstract and labelled as such: a mocked-up fake screenshot would be a claim
 * about what the product looks like, and this is not that.
 */
export function ProjectCoverPlaceholder({
  title,
  accent,
  className,
}: {
  title: string;
  accent: Project['accent'];
  className?: string;
}) {
  return (
    <div className={cn(BAND, 'grid place-items-center', className)} aria-hidden="true">
      {/* Diagonal hatch, drawn in the accent at low alpha via `currentColor`
          so the one accent class below tints the whole band. */}
      <div className={cn('absolute inset-0', accentText[accent])}>
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)',
          }}
        />
        <div className="absolute inset-0 bg-radial-[at_50%_45%] from-transparent to-black/70" />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <span
          className={cn(
            'font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-none tracking-tight uppercase opacity-70',
            accentText[accent],
          )}
        >
          {monogram(title)}
        </span>
        <span className="font-mono text-on-ink-muted text-micro tracking-[0.14em] uppercase">
          No public screenshot
        </span>
      </div>
    </div>
  );
}

export function ProjectCover({
  cover,
  title,
  accent,
  priority = false,
  className,
}: {
  cover?: Project['cover'];
  title: string;
  /** Tints the placeholder when there is no cover image. */
  accent?: Project['accent'];
  priority?: boolean;
  className?: string;
}) {
  if (!cover) {
    return accent ? (
      <ProjectCoverPlaceholder title={title} accent={accent} className={className} />
    ) : null;
  }
  const img = cover as VeliteImage;
  const phone = isPortrait(img);
  return (
    <div className={className ?? BAND}>
      {/* A portrait screenshot cropped to a 2:1 band shows a horizontal slice of
          a phone, which is unreadable and looks like a mistake. Shown whole
          instead, against a blurred copy of itself so the band still has a
          ground rather than two black gutters. */}
      {phone ? (
        <Image
          src={img.src}
          alt=""
          fill
          aria-hidden="true"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="scale-110 object-cover opacity-40 blur-2xl"
        />
      ) : null}
      <Image
        src={img.src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={cn(
          'transition-transform duration-500 group-hover:scale-[1.02]',
          phone ? 'object-contain' : 'object-cover object-top',
        )}
      />
      <span className="sr-only">{title} preview</span>
    </div>
  );
}

/**
 * The case study's opening image.
 *
 * Split out of the page so the phone/desktop distinction lives next to the
 * gallery's copy of it rather than being restated in the route.
 */
export function ProjectHeroCover({
  cover,
  title,
  className,
}: {
  cover: NonNullable<Project['cover']>;
  title: string;
  className?: string;
}) {
  const img = cover as VeliteImage;
  const phone = isPortrait(img);
  return (
    <div
      className={cn(
        'border-ink-line overflow-hidden rounded-panel border',
        // A handset gets a ground to stand on. Without one it floats in the
        // middle of the column with two empty gutters and no reason for them.
        phone && 'bg-black/20 px-6 py-10',
        className,
      )}
    >
      <Image
        src={img.src}
        alt={`${title} interface`}
        width={img.width ?? 1600}
        height={img.height ?? 1000}
        priority
        className={cn(
          'h-auto object-top',
          phone ? cn('mx-auto rounded-[1.5rem]', PHONE_WIDTH) : 'w-full object-cover',
        )}
        sizes={phone ? '19rem' : '(max-width: 1100px) 100vw, 1100px'}
      />
    </div>
  );
}
