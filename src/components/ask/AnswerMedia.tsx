import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { ChatMedia } from '@/lib/rag/media';

/**
 * Pictures under an answer. Colours come from `currentColor` so the same tile
 * sits on the cream widget and the ink sandbox without a theme prop.
 */
export function AnswerMedia({ items }: { items: ChatMedia[] }) {
  if (items.length === 0) return null;
  const pair = items.length > 1;

  return (
    <ul className={cn('mt-3 grid gap-2', pair && 'grid-cols-2')}>
      {items.map((item) => {
        const figure = (
          <figure className="overflow-hidden rounded-xl border border-current/15">
            <Image
              src={item.src}
              width={item.width}
              height={item.height}
              alt={item.alt}
              sizes={pair ? '(max-width: 640px) 45vw, 200px' : '(max-width: 640px) 90vw, 400px'}
              className={cn(
                'w-full object-cover object-[center_30%]',
                pair ? 'aspect-[4/5]' : 'h-auto max-h-80',
              )}
            />
            {item.caption ? (
              <figcaption className="font-mono px-3 py-2 text-[0.625rem] leading-snug tracking-wide uppercase opacity-75">
                {item.caption}
              </figcaption>
            ) : null}
          </figure>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link href={item.href} className="block transition-opacity hover:opacity-85">
                {figure}
              </Link>
            ) : (
              figure
            )}
          </li>
        );
      })}
    </ul>
  );
}
