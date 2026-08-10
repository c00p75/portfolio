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
   * The blog moved from /blogs to /blog in the redesign. These are permanent so
   * existing inbound links and search rankings follow rather than 404.
   */
  async redirects() {
    return [
      { source: '/blogs', destination: '/blog', permanent: true },
      { source: '/blogs/categories/:slug', destination: '/blog', permanent: true },
      { source: '/blogs/:slug', destination: '/blog/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
