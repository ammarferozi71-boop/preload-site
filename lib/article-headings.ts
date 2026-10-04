import type { BodyBlock } from '@/lib/types';

export function extractHeadings(body: BodyBlock[]): { id: string; text: string; level: number }[] {
  return body
    .filter((block) => block.type === 'heading')
    .map((block) => {
      const text = (block as { text: string }).text;
      const level = (block as { level: number }).level;
      const id = (block as { id?: string }).id || text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      return { id, text, level };
    });
}
