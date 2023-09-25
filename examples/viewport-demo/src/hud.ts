import { App } from './app';

export class HUD {
  public static template = `
    <h1>HUD</h1>
    <h2 pui=" === app.initialized">Camera: \${app.viewport.camera.x}, \${app.viewport.camera.y}</h2>
    `;

  public constructor(public app: App) { }
}
