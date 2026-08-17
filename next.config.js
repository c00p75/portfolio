const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */

/*
 * This site is v1. The current portfolio is a separate app on the same domain,
 * which proxies this deployment in at /v1 — so every URL this app produces has
 * to carry that prefix, or the two would collide at the root. In particular
 * both serve /_next/*, and without a prefix the proxy would hand v1's pages
 * the other app's chunks.
 *
 * basePath covers routing, next/link, next/image and /_next/*; assetPrefix
 * covers the static assets. What neither covers is a path written as a plain
 * string — a raw <a href>, or a CSS url() — so those carry BASE_PATH by hand
 * (see src/constants/basePath.js).
 *
 * Overridable, and empty by default outside production, so this still runs at
 * the root with `npm run dev`.
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
}

module.exports = withContentlayer(nextConfig)
