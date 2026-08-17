/**
 * The prefix this deployment is served under — `/v1` in production, where the
 * current portfolio proxies this app in on the same domain, and empty locally.
 *
 * Next applies `basePath` to routing, `next/link` and `next/image`, so almost
 * nothing needs this. It exists for the paths Next cannot see: ones written as
 * plain strings, like a raw `<a href>` to a file in `public/`, or a URL built
 * at runtime and handed to CSS.
 *
 * Read from a `NEXT_PUBLIC_` variable so the value is inlined at build time and
 * matches whatever next.config.js was given.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Prefix a public-directory path, e.g. `/docs/Resume.pdf`. */
export const asset = (path) => `${BASE_PATH}${path}`;
