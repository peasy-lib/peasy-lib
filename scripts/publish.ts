/* eslint-disable no-console */
import { loadPackageJson } from './package.json';
import project from './project';
import { execSync } from 'child_process';
import { join } from 'path';
import { c } from './logger';
import yargs from 'yargs';

(async function (): Promise<void> {
  const [, , channel/* dev or latest */] = process.argv;

  console.log(`Publishing for channel: ${channel}`);

  const args = yargs
    .usage('$0 <cmd> [args]')
    .option('p', {
      alias: 'packages',
      describe: 'specify packages to publish',
      array: true,
    })
    .parseSync();

  const onlyPackages = args.p;

  for (const { name, folder }
    of project.packages
      .filter(
        p => !p.name.kebab.includes('_')
          && p.folder.includes('packages') &&
          (onlyPackages == null || onlyPackages.includes(p.name.kebab))
      )
  ) {
    // eslint-disable-next-line no-await-in-loop
    const pkg = await loadPackageJson(folder, name.kebab);
    if (pkg.private) {
      console.log(`Ignoring ${c.bold('private')} package at ${join(folder, name.kebab)}...`);
      continue;
    }
    console.log(`publishing [${channel}] ${c.green(join(folder, name.kebab))}...`);

    execSync(`cd ${join(folder, name.kebab)} && npm run publish:${channel}`);
  }

  console.log('Done.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
