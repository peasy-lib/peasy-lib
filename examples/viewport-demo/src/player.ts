import { Vector } from '@peasy-lib/peasy-viewport';
import { App } from './app';
import { Gravel } from './gravel';

export class Player {
  public startX = 0; //200;
  public startY = 0; // 780;

  public x = this.startX;
  public y = this.startY;
  public jumping = false;
  public jumpStep = 0;
  public jumpHeight = 40;

  public move(x: number, y: number): void {
    this.x += x;
    this.y += y;
    this.x = Math.max(this.x, -200);
  }

  public jump() {
    if (this.jumping) {
      return;
    }
    this.jumpStep = this.jumpHeight * 2;
    this.jumping = true;
  }

  public update(app: App) {
    if (this.jumping) {
      if (this.jumpStep >= this.jumpHeight) {
        this.y -= 2;
        this.jumpStep -= 2;
      } else if (this.jumpStep > 0) {
        this.y += 2;
        this.jumpStep -= 2;
      } else {
        this.y = this.startY;
        this.jumpStep = 0;
        this.jumping = false;

        const { x, y } = app.viewport.translate(new Vector(this.x + 16, this.y + 64 + 2), app.viewport.getLayer('world'), app.viewport.getLayer('effects'));
        Gravel.create(app, x, y);
      }
    }
    // app.setCamera(this.x - this.startX, this.y - this.startY);
    app.setCamera(this.x, this.y);
  }
}

