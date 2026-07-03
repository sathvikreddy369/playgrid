import { runSeed } from './seeders/runner';

runSeed('demo').catch((e) => {
  console.error(e);
  process.exit(1);
});
