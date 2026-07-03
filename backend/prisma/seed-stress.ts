import { runSeed } from './seeders/runner';

runSeed('stress').catch((e) => {
  console.error(e);
  process.exit(1);
});
