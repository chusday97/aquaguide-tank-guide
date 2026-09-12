process.env.ADMIN_LOCAL_FILE_MODE = 'true';
process.env.WEB_PORT ||= '3003';
process.env.VITE_ADMIN_LOCAL_MODE = 'true';
process.env.VITE_ADMIN_LOCAL_FILE_MODE = 'true';
process.env.START_SEO_ADMIN = 'true';
process.env.VITE_SEO_ADMIN_PORT ||= process.env.SEO_ADMIN_PORT || '3010';
await import('./dev-with-api.mjs');
