import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { allAdrs, allPlaybooks, allPosts, allProjects } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;

  /* `/architecture` and `/playbooks` are gone — both now permanently redirect
     (see next.config.mjs), and a redirecting URL does not belong in a sitemap.
     Their detail pages keep their URLs and are still listed below. */
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url('/'), priority: 1, changeFrequency: 'monthly' },
    { url: url('/work'), priority: 0.9, changeFrequency: 'monthly' },
    { url: url('/sandbox'), priority: 0.8, changeFrequency: 'monthly' },
    /* The product page for the MCP server, aimed at developers arriving from
       npm or the registry rather than at anyone reading the portfolio. */
    { url: url('/miyagi'), priority: 0.8, changeFrequency: 'monthly' },
    { url: url('/blog'), priority: 0.7, changeFrequency: 'monthly' },
    { url: url('/about'), priority: 0.6, changeFrequency: 'yearly' },
    { url: url('/contact'), priority: 0.5, changeFrequency: 'yearly' },
  ];

  return [
    ...staticRoutes,
    ...allProjects().map((p) => ({ url: url(p.url), priority: 0.9 as const })),
    ...allAdrs().map((a) => ({ url: url(a.url), lastModified: new Date(a.date), priority: 0.8 })),
    ...allPlaybooks().map((p) => ({ url: url(p.url), lastModified: new Date(p.date), priority: 0.7 })),
    ...allPosts().map((p) => ({
      url: url(p.url),
      lastModified: new Date(p.updatedAt ?? p.publishedAt),
      priority: 0.6,
    })),
  ];
}
