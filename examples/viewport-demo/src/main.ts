import { UI } from "@peasy-lib/peasy-ui";
import 'styles.css';
import { App } from './app';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

let app: any;
async function main(): Promise<void> {
  app = new App();
  UI.create(document.body, app, app.template);

  UI.queue(() => UI.queue(() => {
    app.start();
  }));
}



