process.env.ADMIN_LOCAL_FILE_MODE = 'true';
process.env.WEB_PORT ||= '3003';
process.env.VITE_ADMIN_LOCAL_MODE = 'true';
process.env.VITE_ADMIN_LOCAL_FILE_MODE = 'true';
await import('./dev-with-api.mjs');
