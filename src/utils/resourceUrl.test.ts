import { describe, expect, it } from 'vitest';
import { detectResourceType, getResourcePreview, githubBlobToRaw, isSafeHttpUrl } from './resourceUrl';

describe('resource URL handling', () => {
  it('converts only GitHub blob links to raw GitHub content', () => {
    expect(githubBlobToRaw('https://github.com/example/study/blob/main/notes/week%201.md'))
      .toBe('https://raw.githubusercontent.com/example/study/main/notes/week%201.md');
    expect(githubBlobToRaw('https://github.com/example/study/tree/main/notes')).toBe('https://github.com/example/study/tree/main/notes');
  });

  it('rejects unsafe URLs', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(getResourcePreview('not a URL', 'General website')).toBeNull();
  });

  it('uses the appropriate preview form for YouTube, PDF, image, and text', () => {
    expect(getResourcePreview('https://youtu.be/abc123', 'YouTube video')).toMatchObject({ kind: 'youtube', embedUrl: 'https://www.youtube-nocookie.com/embed/abc123' });
    expect(getResourcePreview('https://github.com/example/study/blob/main/notes/a.pdf', 'GitHub-hosted PDF')).toMatchObject({ kind: 'pdf', sourceUrl: 'https://raw.githubusercontent.com/example/study/main/notes/a.pdf' });
    expect(getResourcePreview('https://cdn.example.com/chart.png', 'General website')).toMatchObject({ kind: 'image' });
    expect(getResourcePreview('https://raw.githubusercontent.com/example/study/main/notes/a.md', 'Raw GitHub text or Markdown')).toMatchObject({ kind: 'text' });
  });

  it('detects a resource type from a linked note URL', () => {
    expect(detectResourceType('https://github.com/example/study/blob/main/notes/a.pdf')).toBe('GitHub-hosted PDF');
    expect(detectResourceType('https://www.youtube.com/playlist?list=PL123')).toBe('YouTube playlist');
  });
});
