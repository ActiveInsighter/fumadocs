import { source } from '@/lib/source';

export async function getLLMText(page: (typeof source)['$inferPage']) {
  // Raw source text is available without exporting a second processed copy
  // from every MDX module, which keeps the large question bank buildable.
  const markdown = await page.data.getText('raw');

  return `# ${page.data.title}\n\nSource: ${page.url}\n\n${markdown}`;
}
