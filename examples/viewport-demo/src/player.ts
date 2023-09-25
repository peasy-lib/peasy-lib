import { App } from './app';
import { Gravel } from './gravel';

export class Player {
  public x = 200;
  public y = 780;
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
        this.y = 780;
        this.jumpStep = 0;
        this.jumping = false;

        Gravel.create(app, this.x + 16, this.y + 64 + 2);
      }
    }
    app.setCamera(this.x - 200, this.y - 780);
  }
}

