/**
 * Refresh the committed GitHub snapshot used by ingest.
 *
 * Uses the public API only — no scraping. An optional GITHUB_TOKEN raises the
 * rate limit; without it the unauthenticated quota is enough for one user and
 * one repo list. On network failure the last committed snapshot is left alone.
 *
 *   npm run ingest   (calls this)
 *   npx tsx --env-file-if-exists=.env.local scripts/github-snapshot.ts
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOGIN = 'c00p75';
const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/data/github-snapshot.json');

export type GithubSnapshot = {
  fetchedAt: string;
  profile: {
    login: string;
    name: string;
    bio: string;
    location: string;
    blog: string;
    htmlUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
    createdAt: string;
  };
  repos: {
    name: string;
    description: string;
    language: string;
    stars: number;
    htmlUrl: string;
  }[];
};

type GithubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

type GithubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
  pushed_at: string;
};

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    accept: 'application/vnd.github+json',
    'user-agent': 'georgemsapenda-portfolio-ingest',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

async function gh<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, { headers: headers() });
  if (!response.ok) {
    throw new Error(`GitHub ${path} returned ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function loadSnapshot(): Promise<GithubSnapshot> {
  return JSON.parse(await readFile(OUTPUT, 'utf8')) as GithubSnapshot;
}

export async function refreshSnapshot(): Promise<GithubSnapshot> {
  const previous = await loadSnapshot().catch(() => null);

  try {
    const [user, repos] = await Promise.all([
      gh<GithubUser>(`/users/${LOGIN}`),
      gh<GithubRepo[]>(`/users/${LOGIN}/repos?per_page=100&sort=updated`),
    ]);

    const snapshot: GithubSnapshot = {
      fetchedAt: new Date().toISOString(),
      profile: {
        login: user.login,
        name: user.name ?? "George M'sapenda",
        bio: (user.bio ?? '').trim(),
        location: user.location ?? 'Lusaka, Zambia',
        blog: user.blog,
        htmlUrl: user.html_url,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
      },
      repos: repos
        .filter((r) => !r.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at))
        .slice(0, 12)
        .map((r) => ({
          name: r.name,
          description: (r.description ?? '').trim(),
          language: r.language ?? '',
          stars: r.stargazers_count,
          htmlUrl: r.html_url,
        })),
    };

    await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    return snapshot;
  } catch (error) {
    if (previous) {
      console.warn(
        `  ! GitHub refresh failed (${error instanceof Error ? error.message : error}) — using snapshot from ${previous.fetchedAt}`,
      );
      return previous;
    }
    throw error;
  }
}

function githubPreamble(snap: GithubSnapshot): string {
  const p = snap.profile;
  const year = new Date(p.createdAt).getFullYear();
  const repos = snap.repos
    .map((r) => {
      const lang = r.language ? `, ${r.language}` : '';
      const desc = r.description ? ` — ${r.description}` : '';
      return `${r.name} (${r.stars} stars${lang})${desc}. ${r.htmlUrl}`;
    })
    .join('\n');

  return [
    `George M'sapenda's public GitHub profile is ${p.htmlUrl}, login ${p.login}.`,
    p.bio,
    `Based in ${p.location}. The account was created in ${year}. It has ${p.publicRepos} public repositories, ${p.followers} followers and follows ${p.following} accounts.`,
    p.blog ? `Older portfolio: ${p.blog}` : '',
    repos ? `Notable public repositories, ranked by stars:\n${repos}` : '',
    `Snapshot taken ${snap.fetchedAt}. This is public GitHub data, not a scrape of private activity.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Flatten the snapshot into the same shape ingest already chunks. */
export function githubDocument(snap: GithubSnapshot): {
  id: string;
  url: string;
  title: string;
  raw: string;
  preamble: string;
} {
  return {
    id: 'profile:github',
    url: snap.profile.htmlUrl,
    title: "George M'sapenda on GitHub",
    raw: '',
    preamble: githubPreamble(snap),
  };
}

const invokedDirectly = process.argv[1]?.endsWith('github-snapshot.ts');
if (invokedDirectly) {
  refreshSnapshot()
    .then((snap) => {
      console.log(`  ✓ GitHub snapshot: ${snap.profile.publicRepos} repos, ${snap.repos.length} indexed`);
    })
    .catch((error) => {
      console.error('✗ GitHub snapshot failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
