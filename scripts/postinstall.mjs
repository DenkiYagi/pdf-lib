import { execSync } from 'child_process';

// Do not use ts-patch if installing pdf-lib in another project
if (process.env.INIT_CWD === process.cwd()) {
  execSync('yarn run ts-patch install -s', { stdio: 'inherit' });
}
