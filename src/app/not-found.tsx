import { EdgeRail, InkCard } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Sticker } from '@/components/ui/Sticker';

export default function NotFound() {
  return (
    <>
      <EdgeRail className="pt-2 pb-3" left="404" center="Not found" right="Wrong turn" />
      <div className="px-gutter">
        <InkCard className="px-gutter py-20 sm:py-28">
          <h1 className="font-display text-mega uppercase">404</h1>
          <p className="text-on-ink-muted mt-8 max-w-xl text-lg leading-relaxed text-pretty">
            That page doesn&apos;t exist. Nothing dramatic — a moved link or a typo.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ArrowLink href="/" variant="solid">Home</ArrowLink>
            <ArrowLink href="/architecture" variant="outline">Decision records</ArrowLink>
          </div>
          <div className="mt-14">
            <Sticker accent="pink" rotate={-4} caption="No route matched">Dead link</Sticker>
          </div>
        </InkCard>
      </div>
    </>
  );
}
