import { execSync } from 'child_process';

import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

execSync('drizzle-kit migrate --config src/config/drizzle.config.ts', {
  stdio: 'inherit'
});
