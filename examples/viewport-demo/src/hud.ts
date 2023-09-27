import { App } from './app';

export class HUD {
  public static template = `
    <div>
      <h2>HUD</h2>
      <h3 pui=" === app.initialized">Player: \${app.player.x}, \${app.player.y}</h3>
      <h3 pui=" === app.initialized">Camera: \${app.viewport.camera.x}, \${app.viewport.camera.y}</h3>
    </div>
  `;

  public constructor(public app: App) { }
}
