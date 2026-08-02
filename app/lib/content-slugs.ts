import { getSlugs } from 'fumadocs-core/source';

// Linux filesystems limit a single path component to 255 bytes. React Router
// writes prerendered data files using URI-encoded URL segments plus `.data`, so
// long non-ASCII titles can exceed that limit after percent encoding.
const MAX_ENCODED_SEGMENT_LENGTH = 180;
const READABLE_PREFIX_LENGTH = 12;

function stableHash(value: string): string {
  let first = 0xdeadbeef ^ value.length;
  let second = 0x41c6ce57 ^ value.length;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    first = Math.imul(first ^ code, 2654435761);
    second = Math.imul(second ^ code, 1597334677);
  }

  first =
    Math.imul(first ^ (first >>> 16), 2246822507) ^
    Math.imul(second ^ (second >>> 13), 3266489909);
  second =
    Math.imul(second ^ (second >>> 16), 2246822507) ^
    Math.imul(first ^ (first >>> 13), 3266489909);

  return `${(first >>> 0).toString(36)}${(second >>> 0).toString(36)}`;
}

function compactSlugSegment(encodedSegment: string): string {
  if (encodedSegment.length <= MAX_ENCODED_SEGMENT_LENGTH) {
    return encodedSegment;
  }

  const decodedSegment = decodeURI(encodedSegment);
  const readable = decodedSegment
    .normalize('NFKC')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  const prefix = Array.from(readable)
    .slice(0, READABLE_PREFIX_LENGTH)
    .join('')
    .replace(/-+$/gu, '');
  const compact = `${prefix || 'page'}-${stableHash(decodedSegment)}`;

  return encodeURI(compact);
}

export function getContentSlugs(filePath: string): string[] {
  return getSlugs(filePath).map(compactSlugSegment);
}

export function getCustomContentSlugs(
  filePath: string,
): string[] | undefined {
  const original = getSlugs(filePath);
  const compacted = original.map(compactSlugSegment);

  return compacted.some((segment, index) => segment !== original[index])
    ? compacted
    : undefined;
}
