import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { allAdrs, allPlaybooks, allPosts } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url('/'), priority: 1, changeFrequency: 'monthly' },
    { url: url('/architecture'), priority: 0.9, changeFrequency: 'monthly' },
    { url: url('/sandbox'), priority: 0.8, changeFrequency: 'monthly' },
    { url: url('/playbooks'), priority: 0.8, changeFrequency: 'monthly' },
    { url: url('/blog'), priority: 0.7, changeFrequency: 'monthly' },
    { url: url('/about'), priority: 0.6, changeFrequency: 'yearly' },
    { url: url('/contact'), priority: 0.5, changeFrequency: 'yearly' },
  ];

  return [
    ...staticRoutes,
    ...allAdrs().map((a) => ({ url: url(a.url), lastModified: new Date(a.date), priority: 0.9 })),
    ...allPlaybooks().map((p) => ({ url: url(p.url), lastModified: new Date(p.date), priority: 0.7 })),
    ...allPosts().map((p) => ({
      url: url(p.url),
      lastModified: new Date(p.updatedAt ?? p.publishedAt),
      priority: 0.6,
    })),
  ];
}
