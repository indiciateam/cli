import { clearAccessToken, credentialsPath } from '../config.js';
import { writeError } from '../output.js';

export async function logoutCommand(): Promise<void> {
  if (clearAccessToken()) {
    writeError(`Logged out. Removed ${credentialsPath()}`);
    return;
  }
  writeError('No saved credentials to remove.');
}
