import { getInfo } from '../client.js';
import { type OutputOptions, writeOutput } from '../output.js';

export async function infoCommand(options: OutputOptions): Promise<void> {
  const data = await getInfo();
  writeOutput(
    {
      success: true,
      feature: 'info',
      category: 'account',
      data,
    },
    options,
  );
}
