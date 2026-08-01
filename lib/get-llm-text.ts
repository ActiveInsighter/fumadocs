import { source } from '@/lib/source';

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const raw = await page.data.getText('raw');

  return `# ${page.data.title}

Source: ${page.url}

${raw}`;
}
