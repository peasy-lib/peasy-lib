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
  public deltaTimeRender = 0;
  public totalTimeRender = 0;
  public engineRender: Engine;

  public deltaTimePhysics = 0;
  public totalTimePhysics = 0;
  public enginePhysics: Engine;

  public deltaTimeOneTime = 0;
  public totalTimeOneTime = 0;
  public engineOneTime: Engine;

  public constructor() {
    this.engineRender = Engine.create(this.update);
    this.enginePhysics = Engine.create({ callback: this.updatePhysics, fps: 240, started: false });
    this.engineOneTime = Engine.create({ callback: this.updateOneTime, ms: 2000, started: false, oneTime: true });
  }

  public update = (delta: number, total: number) => {
    // console.log('Update', delta, total, this);
    this.deltaTimeRender = delta;
    this.totalTimeRender = total;
  }
  public startRender = () => {
    this.engineRender.start();
  }
  public stopRender = () => {
    this.engineRender.stop();
  }
  public pauseRender = () => {
    this.engineRender.pause();
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

  public updateOneTime = (delta: number, total: number) => {
    this.deltaTimeOneTime = delta;
    this.totalTimeOneTime = total;
    alert('2 seconds runtime for one-time engine, creating new one-time engine');
    this.engineOneTime = Engine.create({ callback: this.updateOneTime, ms: 2000, started: false, oneTime: true });
  }
  public startOneTime = () => {
    this.engineOneTime.start();
  }
  public stopOneTime = () => {
    this.engineOneTime.stop();
  }
  public pauseOneTime = () => {
    this.engineOneTime.pause();
  }

  public start = () => {
    Engine.start();
  }
  public stop = () => {
    Engine.stop();
  }
  public pause = () => {
    Engine.pause();
  }
}
