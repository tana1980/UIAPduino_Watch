import { defineConfig } from 'astro/config';
const repo = process.env.GITHUB_REPOSITORY || 'tana1980/info_uiapduino';
const [owner, name] = repo.split('/');
const base = process.env.BASE_PATH ?? (name.endsWith('.github.io') ? '/' : `/${name}/`);
export default defineConfig({
  site: process.env.SITE_URL || `https://${owner}.github.io`,
  base,
  trailingSlash: 'always',
  output: 'static',
});
