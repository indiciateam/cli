import { loginWithBrowser, loginWithDevice } from '../auth.js';
import { writeError } from '../output.js';

export async function loginCommand(options: {
  browser?: boolean;
}): Promise<void> {
  const result = options.browser
    ? await loginWithBrowser()
    : await loginWithDevice();
  writeError(`Logged in. Credentials saved to ${result.path}`);
}
