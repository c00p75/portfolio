import Link from 'next/link';
import { VARIANTS } from '@/lib/miyagi';
import './variant-bar.css';

/**
 * A chooser strip across the top of every /miyagi variant.
 *
 * Temporary scaffolding: it exists so the five stylings can be compared
 * side by side, and comes out once one is picked.
 */
export function VariantBar({ current }: { current: string }) {
  return (
    <div className="vb">
      <span className="vb-label">Styling</span>
      <nav className="vb-list" aria-label="Page styling variants">
        {VARIANTS.map((v) => {
          const active = v.slug === current;
          return (
            <Link
              key={v.slug}
              href={v.slug}
              className={`vb-item${active ? ' vb-on' : ''}`}
              aria-current={active ? 'page' : undefined}
              title={v.note}
            >
              {v.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
