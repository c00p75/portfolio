import type { Metadata } from 'next';
import Link from 'next/link';
import { allPosts, formatDate } from '@/lib/content';
import { EdgeRail, InkCard } from '@/components/ui/Frame';
import { Tag } from '@/components/ui/Sticker';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Longer-form writing on software development, tooling and engineering practice.',
};

export default function BlogIndex() {
  const posts = allPosts();

  return (
    <>
      <EdgeRail className="pt-2 pb-3" left="Writing" center="Notes & articles" right={`${posts.length} posts`} />

      <div className="px-gutter">
        <InkCard className="px-gutter py-14 sm:py-20">
          <h1 className="font-display text-jumbo text-balance uppercase">Writing</h1>
          <p className="text-on-ink-muted mt-8 max-w-2xl text-lg leading-relaxed text-pretty">
            Longer-form notes. For the architectural arguments, the{' '}
            <Link href="/architecture" className="text-on-ink underline decoration-cyan underline-offset-4">
              decision records
            </Link>{' '}
            are the better read.
          </p>
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          {posts.length > 0 ? (
            <ul className="divide-ink-line divide-y">
              {posts.map((post) => (
                <li key={post.slug}>
                  <article className="group relative flex flex-col gap-3 py-8 lg:flex-row lg:items-baseline lg:gap-10">
                    <span className="font-mono text-on-ink-muted shrink-0 text-micro uppercase lg:w-32">
                      {formatDate(post.publishedAt)}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-display text-title text-balance uppercase">
                        <Link href={post.url} className="before:absolute before:inset-0 hover:text-cyan">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-on-ink-muted mt-3 max-w-2xl text-sm leading-relaxed text-pretty">
                        {post.description}
                      </p>
                      {post.tags.length > 0 ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((t) => (
                            <li key={t}>
                              <Tag>{t}</Tag>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <span className="font-mono text-on-ink-muted shrink-0 text-micro uppercase">
                      {post.metadata.readingTime} min
                    </span>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-ink-muted text-sm">No posts yet.</p>
          )}
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left="Writing" right={`${posts.length} posts`} />
    </>
  );
}
