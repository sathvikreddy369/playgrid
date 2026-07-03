import { runSeed } from './seeders/runner';

runSeed('dev').catch((e) => {
  console.error(e);
  process.exit(1);
});
