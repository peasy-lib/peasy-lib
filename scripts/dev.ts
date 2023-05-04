/* eslint-disable no-console */
import concurrently from 'concurrently';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { c } from './logger';

const args = yargs
  .usage('$0 <cmd> [args]')
  .option('d', {
    alias: 'dev',
    describe: 'add extra packages to development',
    array: true,
  })
  .option('t', {
    alias: 'test',
    describe: 'add extra test folders to development',
    array: true,
  })
  .option('a', {
    alias: 'app',
    describe: 'add extra example apps to development',
    array: true,
  })
  .option('e2e', {
    alias: 'e',
    describe: 'add extra e2e test setup to development',
    type: 'string',
    array: true,
  })
  .parseSync();

const envVars = { DEV_MODE: true };
// const testPatterns = (args.t ?? []).join(' ');
// const hasValidTestPatterns = testPatterns !== '';

const e2e = args.e2e;
// const validE2e = [
//   'peasy-ui',
//   'peasy-lighting',
//   'peasy-input',
//   'peasy-physics',
// ];
// const hasValidE2e = e2e?.length && e2e.every(e => validE2e.includes(e));

// if (!hasValidTestPatterns && !hasValidE2e) {
//   console.log(
// `There are no test pattern or e2e tests specified. Aborting...
// If it is intended to run e2e test, then specified --e2e + one of the following: ${validE2e}`);
//   process.exit(0);
// }

const devCmd = 'npm run dev';
const buildCmd = 'npm run build';

const validPackages = [
  'peasy-ui',
  'peasy-lighting',
  'peasy-input',
  'peasy-physics',
  'peasy-assets',
  'peasy-engine',
];

const devPackages = (args.d ?? []) as string[];
if (devPackages.some(d => !validPackages.includes(d))) {
  throw new Error(`Invalid package config, valid packages are: ${validPackages}`);
}

validPackages
  .filter(pkg => !isEsmBuilt(path.resolve(__dirname, `../packages/${pkg}`)))
  .forEach((pkgName) => {
    const start = Date.now();
    const pkgDisplay = c.green(pkgName);
    console.log(`Package ${pkgDisplay} has not been built before, building it...`);
    execSync(buildCmd, { cwd: `packages/${pkgName}` });
    console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
  });

const toolingPackages = [
  // 'ts-jest',
  // 'babel-jest',
  // 'parcel-transformer',
  // 'webpack-loader',
];

const apps = (args.a ?? []) as string[];
const validApps = [
  'ui-demo',
  'lighting-demo',
  'input-demo',
  'physics-demo',
  'assets-demo',
  'engine-demo',

  'platformer-tutorial-1',
  'todo-mvc',
  '3d-world',
];

if (apps.length > 0) {
  if (apps.some(a => !validApps.includes(a))) {
    throw new Error(`Invalid apps, valid options are: ${validApps}`);
  }

  toolingPackages
    .forEach(pkgName => {
      const start = Date.now();
      const pkgDisplay = c.green(pkgName);
      console.log(`${pkgDisplay} has not been built before, building...`);
      console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
    });
}

const baseAppPort = 9000;
concurrently([
  ...devPackages.map((folder: string) => ({
    command: devCmd,
    cwd: `packages/${folder}`,
    name: folder,
    env: envVars
  })),
  ...(e2e ?? []).map(e => ({ command: 'npm run test:watch', cwd: `packages/__e2e__/${e}`, env: envVars, name: `__e2e__(${e})` })),
  ...apps.map((appFolder, i) => ({
    command: devCmd,
    cwd: `examples/${appFolder}`,
    name: `${appFolder} (app)`,
    env: { ...envVars, WEBPACK_PORT: baseAppPort + i },
  })),
].filter(Boolean), {
  prefix: '[{name}]',
  killOthers: 'failure',
  prefixColors: [
    'green',
    'blue',
    'cyan',
    'greenBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
    'white',
  ]
});

function isEsmBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/esm/index.mjs`);
}

function isCjsBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/cjs/index.cjs`);
}

function getElapsed(now: number, then: number) {
  return ((now - then) / 1000).toFixed(2);
}
