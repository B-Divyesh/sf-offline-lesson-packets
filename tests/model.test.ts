import { describe, expect, it } from 'vitest';
import { readFile, readdir, stat } from 'node:fs/promises';
import { safeFilename, sanitizeImportedPacket, starterPacket, validatePacket } from '../src/model';
import { buildPacketHtml } from '../src/packet';

describe('packet model', () => {
  it('accepts a complete starter packet', () => {
    expect(validatePacket(starterPacket())).toEqual([]);
  });

  it('reports missing lesson and activity content', () => {
    const packet = starterPacket();
    packet.title = '';
    packet.activities = [];
    expect(validatePacket(packet).map((issue) => issue.fieldId)).toEqual(expect.arrayContaining(['lesson-title', 'activities']));
  });

  it('sanitizes imported text and regenerates block ids', () => {
    const source = starterPacket();
    source.title = 'Safe\u0000 title';
    source.activities[0].id = '<script>';
    const clean = sanitizeImportedPacket(source);
    expect(clean.title).toBe('Safe title');
    expect(clean.activities[0].id).not.toBe('<script>');
  });

  it('rejects unsupported templates and oversized activity collections', () => {
    expect(() => sanitizeImportedPacket({ version: 2, activities: [] })).toThrow(/version/i);
    expect(() => sanitizeImportedPacket({ ...starterPacket(), activities: Array(21).fill(starterPacket().activities[0]) })).toThrow(/at most 20/i);
  });

  it('makes portable filenames', () => {
    expect(safeFilename('  Photosynthesis: Day 1! ', 'html')).toBe('photosynthesis-day-1.html');
    expect(safeFilename('你好', 'json')).toBe('lesson-packet.json');
  });
});

describe('standalone packet export', () => {
  it('escapes displayed markup and script-breaking input', () => {
    const packet = starterPacket();
    packet.title = '</script><img src=x onerror=alert(1)>';
    const html = buildPacketHtml(packet);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;/script&gt;');
    expect(html).toContain('\\u003c/script>');
  });

  it('contains no network or external asset dependency', () => {
    const html = buildPacketHtml(starterPacket());
    expect(html).toContain('<!doctype html>');
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/<link[^>]+stylesheet/);
  });
});

describe('release policy', () => {
  it('ships Azure Static Web Apps security and cache rules', async () => {
    const config = JSON.parse(await readFile(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'));
    expect(config.globalHeaders).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-Frame-Options': 'SAMEORIGIN',
    });
    expect(config.routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }),
      expect.objectContaining({ route: '/sw.js', headers: { 'Cache-Control': 'no-cache' } }),
    ]));
  });

  it('keeps built JavaScript and CSS inside static product budgets', async () => {
    const assets = new URL('../dist/assets/', import.meta.url);
    const files = await readdir(assets);
    const js = files.find((file) => /^main-.*\.js$/.test(file));
    const css = files.find((file) => /^styles-.*\.css$/.test(file));
    expect(js).toBeTruthy();
    expect(css).toBeTruthy();
    expect((await stat(new URL(js!, assets))).size).toBeLessThanOrEqual(200_000);
    expect((await stat(new URL(css!, assets))).size).toBeLessThanOrEqual(50_000);
  });
});
