// =============================================================================
// nexoCRMVendas (oxlify sales) - PM2 (backend NestJS/Bun no host)
// =============================================================================
// postgres/redis/minio no Docker (loopback 5435/6382/9002). Frontend/admin na
// Vercel. Backend em Bun. Tunel: sales-api.oxlify.com -> 127.0.0.1:3001.
// Backend le backend/.env (Bun carrega .env do cwd automaticamente).
// =============================================================================
const path = require('path');
const BUN = path.join(process.env.APPDATA, 'npm', 'node_modules', 'bun', 'bin', 'bun.exe');

module.exports = {
  apps: [
    {
      name: 'crmvendas-backend',
      cwd: './backend',
      script: BUN,
      args: 'run dist/main.js',
      interpreter: 'none',
      autorestart: true,
      exp_backoff_restart_delay: 2000,
    },
  ],
};
