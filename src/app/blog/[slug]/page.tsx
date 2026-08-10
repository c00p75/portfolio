import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allPosts, formatDate, postBySlug } from '@/lib/content';
import { MDXContent } from '@/components/mdx/MDXContent';
import { EdgeRail, InkCard } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Tag } from '@/components/ui/Sticker';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: post.image ? [post.image.src] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left="Writing"
        center={`${post.metadata.readingTime} min read`}
        right={formatDate(post.publishedAt)}
      />

      <div className="px-gutter">
        <InkCard className="px-gutter py-14 sm:py-20">
          <h1 className="font-display max-w-5xl text-jumbo text-balance uppercase">{post.title}</h1>
          <p className="text-on-ink-muted mt-8 max-w-3xl text-lg leading-relaxed text-pretty">
            {post.description}
          </p>
          {post.tags.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <li key={t}>
                  <Tag>{t}</Tag>
                </li>
              ))}
            </ul>
          ) : null}
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <MDXContent code={post.body} />
        </InkCard>
      </section>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-12">
          <ArrowLink href="/blog" className="text-on-ink-muted hover:text-on-ink">
            All writing
          </ArrowLink>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left="Writing" right={formatDate(post.publishedAt)} />
    </>
  );
}
