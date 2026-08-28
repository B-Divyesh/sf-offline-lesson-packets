import { describe, expect, it } from 'vitest';
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
