import { execSync } from 'node:child_process';

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não definida para E2E. Configure DATABASE_URL_E2E no .env.test.',
    );
  }
}

export default async function globalSetup() {
  requireDatabaseUrl();
  execSync('pnpm drizzle:migrate', { stdio: 'inherit', env: process.env });
}
