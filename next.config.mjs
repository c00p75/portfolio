/**
 * Kept as `.mjs` rather than `.ts` deliberately: Next transpiles a TS config to
 * CJS, which cannot use the top-level await that starts Velite in-process.
 *
 * Velite runs here rather than as a `predev`/`prebuild` script so `next dev`
 * gets content hot-reload and `next build` cannot race a stale `.velite`
 * directory. The env guard stops Next's worker forks each starting their own.
 */
const isDev = process.argv.includes('dev');
const isBuild = process.argv.includes('build');

if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1';
  const { build } = await import('velite');
  await build({ watch: isDev, clean: !isDev });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Next 16 writes AGENTS.md/CLAUDE.md into the repo root by default. */
  agentRules: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * Permanent so existing inbound links and search rankings follow rather than
   * 404.
   *
   * `/blogs` → `/blog` dates from the redesign. The two section indexes below
   * went away when the site stopped being organised around decision records:
   * records are now reached through the project they belong to, and playbooks
   * sit inside Writing. Both sets of detail pages keep their URLs — only the
   * indexes are gone — so `/architecture/:slug` and `/playbooks/:slug` must not
   * be caught by these rules.
   */
  async redirects() {
    return [
      { source: '/blogs', destination: '/blog', permanent: true },
      { source: '/blogs/categories/:slug', destination: '/blog', permanent: true },
      { source: '/blogs/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/architecture', destination: '/work', permanent: true },
      { source: '/playbooks', destination: '/blog', permanent: true },
    ];
  },

  /**
   * The previous portfolio, served from this domain at `/v1`.
   *
   * It stays its own deployment — a Next 13 app on contentlayer and bootstrap,
   * whose dependencies cannot share a build with this one — and is proxied in
   * rather than linked out, so the visitor never leaves the domain.
   *
   * `/v1` is in the destination as well as the source because that deployment
   * sets `basePath: '/v1'`. That is what keeps the two apps from colliding:
   * without it both would serve `/_next/*` from the root and the proxy would
   * hand v1's pages this app's chunks.
   *
   * With `V1_ORIGIN` unset there is no rule at all, so `/v1` simply 404s
   * instead of proxying to a host that isn't there.
   */
  async rewrites() {
    const origin = process.env.V1_ORIGIN;
    if (!origin) return [];
    const base = origin.replace(/\/$/, '');
    return [
      { source: '/v1', destination: `${base}/v1` },
      { source: '/v1/:path*', destination: `${base}/v1/:path*` },
    ];
  },
};

export default nextConfig;
