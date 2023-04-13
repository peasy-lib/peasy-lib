import { UI } from '@peasy-lib/peasy-ui';
import { Engine } from '@peasy-lib/peasy-engine';
import 'styles.css';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

async function main(): Promise<void> {
  const app = new App();
  UI.create(document.body, '#app', app);
}

class App {
  public deltaTime = 0;
  public totalTime = 0;
  public engine: Engine;

  public deltaTimePhysics = 0;
  public totalTimePhysics = 0;
  public enginePhysics: Engine;

  public constructor() {
    this.engine = Engine.create(this.update);
    this.enginePhysics = Engine.create({ callback: this.updatePhysics, fps: 240, started: false });
  }

  public update = (delta: number, total: number) => {
    // console.log('Update', delta, total, this);
    this.deltaTime = delta;
    this.totalTime = total;
  }
  public start = () => {
    this.engine.start();
  }
  public stop = () => {
    this.engine.stop();
  }
  public pause = () => {
    this.engine.pause();
  }

  public updatePhysics = (delta: number, total: number) => {
    // console.log('Update', delta, total, this);
    this.deltaTimePhysics = delta;
    this.totalTimePhysics = total;
  }
  public startPhysics = () => {
    this.enginePhysics.start();
  }
  public stopPhysics = () => {
    this.enginePhysics.stop();
  }
  public pausePhysics = () => {
    this.enginePhysics.pause();
  }
}
