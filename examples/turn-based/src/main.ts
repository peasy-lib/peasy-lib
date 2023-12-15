import { UI } from "@peasy-lib/peasy-ui";
import 'styles.css';
import { App } from './app';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

let app: any;
async function main(): Promise<void> {
  app = new App();
  UI.initialize();
  await UI.create(document.body, app, app.template).attached;
  await app.start();
}



