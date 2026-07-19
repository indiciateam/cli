import { features, listByCategory } from '../features.js';
import { type OutputOptions, writeOutput } from '../output.js';

export async function listCommand(options: OutputOptions): Promise<void> {
  if (options.json) {
    writeOutput(
      {
        success: true,
        feature: 'list',
        category: 'cli',
        data: features.map(f => ({
          name: f.name,
          category: f.category,
          path: f.path,
          streaming: f.streaming,
          description: f.description,
        })),
      },
      options,
    );
    return;
  }

  const byCategory = listByCategory();
  const lines: string[] = ['Available searches:', ''];

  for (const [category, list] of Object.entries(byCategory)) {
    lines.push(`${category}:`);
    for (const f of list) {
      const alias = `${f.category}/${f.name}`;
      const streamingFlag = f.streaming ? ' [streaming]' : '';
      lines.push(`  ${alias.padEnd(36)} ${f.description}${streamingFlag}`);
    }
    lines.push('');
  }

  lines.push('Use: indicia search <category>/<name> <query>');
  lines.push('     indicia search tools/crypto --body \'{"address":"..."}\'');
  console.log(lines.join('\n'));
}
