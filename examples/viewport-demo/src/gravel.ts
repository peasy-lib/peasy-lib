import { App } from './app';

export class Gravel {
  public static gravels: Gravel[] = [];

  constructor(public app: App, public x: number, public y: number, public radius: number, public speed: number) { }

  public static create(app: App, x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const radius = Math.random() * 4 + 2;
      const speed = Math.random() * 2 + 1;
      const particle = new Gravel(app, x, y, radius, speed);
      Gravel.gravels.push(particle);
    }
  }

  public static update(ctx: CanvasRenderingContext2D) {
    if (ctx == null) {
      return;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < Gravel.gravels.length; i++) {
      Gravel.gravels[i].move();
      Gravel.gravels[i].draw(ctx);

      if (Gravel.gravels[i].y < 0) {
        Gravel.gravels.splice(i, 1);
        i--;
      }
    }
  }

  move() {
    this.y -= this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.app.getCamera();
    const zoom = this.app.viewport.camera.zoom;
    const origin = this.app.viewport.origin;
    ctx.beginPath();
    ctx.arc(this.x - x, this.y - y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "gray";
    ctx.fill();
    ctx.closePath();

    // ctx.beginPath();
    // ctx.arc(240, 700, 10, 0, Math.PI * 2);
    // ctx.fillStyle = "white";
    // ctx.fill();
    // ctx.closePath();
  }
}
