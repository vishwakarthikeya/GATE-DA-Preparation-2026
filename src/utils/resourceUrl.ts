import type { ResourceType } from '../types';

export type ResourcePreview =
  | { kind: 'youtube'; sourceUrl: string; embedUrl: string }
  | { kind: 'pdf'; sourceUrl: string; embedUrl: string; googleViewerUrl: string }
  | { kind: 'image'; sourceUrl: string }
  | { kind: 'text'; sourceUrl: string }
  | { kind: 'website'; sourceUrl: string };

const textExtensions = new Set(['md', 'markdown', 'txt', 'csv', 'json', 'py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css']);
const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif']);

export function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function githubBlobToRaw(value: string) {
  const url = new URL(value);
  if (url.hostname !== 'github.com') return value;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 5 || parts[2] !== 'blob') return value;
  const [owner, repository, , branch, ...path] = parts;
  const encodePathSegment = (segment: string) => {
    try { return encodeURIComponent(decodeURIComponent(segment)); }
    catch { return encodeURIComponent(segment); }
  };
  return new URL(`https://raw.githubusercontent.com/${owner}/${repository}/${branch}/${path.map(encodePathSegment).join('/')}`).toString();
}

function extension(value: string) {
  try {
    const path = new URL(value).pathname;
    const file = path.split('/').pop() || '';
    return file.includes('.') ? file.split('.').pop()!.toLowerCase() : '';
  } catch {
    return '';
  }
}

function youtubeEmbed(value: string) {
  const url = new URL(value);
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
  }
  if (host !== 'youtube.com' && host !== 'm.youtube.com') return null;
  const list = url.searchParams.get('list');
  if (url.pathname === '/playlist' && list) return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}`;
  const id = url.searchParams.get('v') || (url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : '');
  if (!id) return null;
  const params = list ? `?list=${encodeURIComponent(list)}` : '';
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${params}`;
}

export function getResourcePreview(value: string, type: ResourceType): ResourcePreview | null {
  if (!isSafeHttpUrl(value)) return null;
  const sourceUrl = githubBlobToRaw(value.trim());
  const ext = extension(sourceUrl);
  const youtube = youtubeEmbed(value);
  if (youtube || type === 'YouTube video' || type === 'YouTube playlist') {
    return youtube ? { kind: 'youtube', sourceUrl, embedUrl: youtube } : { kind: 'website', sourceUrl };
  }
  if (type === 'GitHub-hosted image' || imageExtensions.has(ext)) return { kind: 'image', sourceUrl };
  if (type === 'GitHub-hosted PDF' || ext === 'pdf') {
    return {
      kind: 'pdf',
      sourceUrl,
      embedUrl: sourceUrl,
      googleViewerUrl: `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(sourceUrl)}`
    };
  }
  if (type === 'Raw GitHub text or Markdown' || textExtensions.has(ext)) return { kind: 'text', sourceUrl };
  return { kind: 'website', sourceUrl };
}

export function detectResourceType(value: string): ResourceType {
  if (!isSafeHttpUrl(value)) return 'General website';
  const preview = getResourcePreview(value, 'General website');
  if (preview?.kind === 'youtube') return new URL(value).pathname === '/playlist' ? 'YouTube playlist' : 'YouTube video';
  if (preview?.kind === 'pdf') return 'GitHub-hosted PDF';
  if (preview?.kind === 'image') return 'GitHub-hosted image';
  if (preview?.kind === 'text') return 'Raw GitHub text or Markdown';
  return 'General website';
}
