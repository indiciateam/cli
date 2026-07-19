import { type Feature, kebabCase, listByCategory } from '../features.js';
import { type OutputOptions, writeOutput } from '../output.js';

export async function listCommand(
  features: Feature[],
  options: OutputOptions,
): Promise<void> {
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
          version: f.version,
          streaming: f.streaming,
          description: f.description,
          bodyFields: f.bodyFields,
          priceKey: f.priceKey,
        })),
      },
      options,
    );
    return;
  }

  const byCategory = listByCategory(features);
  const lines: string[] = ['Available searches:', ''];

  for (const [category, list] of Object.entries(byCategory)) {
    lines.push(`${category}:`);
    for (const f of list) {
      const alias = `${f.category}/${f.name}`;
      const streamingFlag = f.streaming ? ' [streaming]' : '';
      const bodyHint = f.bodyFields?.length
        ? ` [flags: ${f.bodyFields.map(k => `--${kebabCase(k)}`).join(', ')}]`
        : '';
      lines.push(
        `  ${alias.padEnd(36)} ${f.description}${streamingFlag}${bodyHint}`,
      );
    }
    lines.push('');
  }

  lines.push('Usage:');
  lines.push('  indicia search <category>/<name> <query>');
  lines.push(
    '  indicia search intelligence/person --name "John Doe" --state CA',
  );
  lines.push(
    '  indicia search tools/crypto --address <address> --network ethereum',
  );
  lines.push(
    '  indicia search tools/intelx --storage-id <id> --bucket leaks.public',
  );
  console.log(lines.join('\n'));
}
