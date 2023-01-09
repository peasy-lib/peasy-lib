import { Circle } from './shapes/circle';
import { ExpandedRect } from './shapes/expanded-rect';
import { Line } from './shapes/line';
import { Polygon } from './shapes/polygon';
import { Ray } from './shapes/ray';
import { Rect } from './shapes/rect';
import { RoundedRect } from './shapes/rounded-rect';
import { Stadium } from './shapes/stadium';
import { Vector } from './vector';

export class Canvas {
  public logging = false;

  public constructor(public ctx: CanvasRenderingContext2D) { }

  public clear(): void {
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  public drawShape(shape: Rect | Circle | Line | Polygon | Ray | Stadium, color: string, fillColor?: string, debug = true) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    if (fillColor != null) {
      ctx.fillStyle = fillColor;
    }
    // if (debug && !this.debug) {
    //   return;
    // }

    if (shape instanceof Line) {
      ctx.beginPath();
      ctx.moveTo(shape.start.x, shape.start.y);
      ctx.lineTo(shape.end.x, shape.end.y);
      ctx.stroke();
    } else if (shape instanceof Ray) {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(shape.origin.x, shape.origin.y);
      ctx.lineTo(shape.end.x, shape.end.y);
      if (fillColor != null) {
        ctx.fill();
      }
      ctx.stroke();
      this.drawCross(shape.origin, color, 2);
    } else if (shape instanceof Stadium) {
      const PI = Math.PI;
      const position = shape.position;
      const r = shape.radius;
      ctx.beginPath();
      if (shape.horizontal) {
        ctx.arc(shape.right - r, position.y, r, PI / 2, PI * 1.5, true);
        ctx.lineTo(shape.left + r, shape.top);
        ctx.arc(shape.left + r, position.y, r, PI * 1.5, PI * 0.5, true);
        ctx.lineTo(shape.right - r, shape.bottom);
      } else {
        ctx.arc(position.x, shape.top + r, r, 0, PI, true);
        ctx.lineTo(shape.left, shape.bottom - r);
        ctx.arc(position.x, shape.bottom - r, r, PI, 0, true);
        ctx.lineTo(shape.right, shape.top + r);
      }
      if (fillColor != null) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(position, color, 2);
    } else if (shape instanceof RoundedRect) {
      const r = shape.radius;
      ctx.beginPath();
      ctx.arc(shape.left + r, shape.top + r, r, Math.PI * -0.5, Math.PI, true);
      ctx.lineTo(shape.left, shape.bottom - r);
      ctx.arc(shape.left + r, shape.bottom - r, r, Math.PI, Math.PI * 0.5, true);
      ctx.lineTo(shape.right - r, shape.bottom);
      ctx.arc(shape.right - r, shape.bottom - r, r, Math.PI * 0.5, 0, true);
      ctx.lineTo(shape.right, shape.top + r);
      ctx.arc(shape.right - r, shape.top + r, r, 0, -Math.PI * 0.5, true);
      ctx.lineTo(shape.left + r, shape.top);
      if (fillColor != null) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(shape.position, color, 2);
    } else if (shape instanceof ExpandedRect) {
      const { min } = shape.corner.getMinMax();
      let top = new Vector(-Infinity, Infinity);
      for (const vertex of shape.corner.vertices) {
        if (vertex.y < top.y) {
          top = vertex;
        }
      }
      const shift = top.subtract(min);

      ctx.beginPath();
      const vertices = shape.vertices;
      for (let i = 0; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      // ctx.rect(shape.left, shape.top, shape.width, shape.height);
      if (fillColor != null) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(shape.position, color, 2);

      // ctx.beginPath();
      // ctx.arc(shape.left + r, shape.top + r, r, Math.PI * -0.5, Math.PI, true);
      // ctx.lineTo(shape.left, shape.bottom - r);
      // ctx.arc(shape.left + r, shape.bottom - r, r, Math.PI, Math.PI * 0.5, true);
      // ctx.lineTo(shape.right - r, shape.bottom);
      // ctx.arc(shape.right - r, shape.bottom - r, r, Math.PI * 0.5, 0, true);
      // ctx.lineTo(shape.right, shape.top + r);
      // ctx.arc(shape.right - r, shape.top + r, r, 0, -Math.PI * 0.5, true);
      // ctx.lineTo(shape.left + r, shape.top);
      // if (fillColor != null) {
      //   ctx.fill();
      // }
      // ctx.stroke();
    } else if (shape instanceof Rect || shape instanceof Polygon) {
      ctx.beginPath();
      const vertices = shape.vertices;
      for (let i = 0; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      // ctx.rect(shape.left, shape.top, shape.width, shape.height);
      if (fillColor != null) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(shape.position, color, 2);
    } else if (shape instanceof Circle) {
      ctx.beginPath();
      ctx.arc(shape.position.x, shape.position.y, shape.radius, 0, 2 * Math.PI);
      if (fillColor != null) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(shape.position, color, 2);
    }
  }

  public drawCross(position: Vector, color: string, size: number, debug = true) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(position.x, position.y - size);
    ctx.lineTo(position.x, position.y + size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(position.x - size, position.y);
    ctx.lineTo(position.x + size, position.y);
    ctx.stroke();
  }

  public drawText(text: string, position: Vector, color: string, font = '11px Arial', debug = true) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, position.x, position.y);
  }

  public log(...args: any[]) {
    if (!this.logging) {
      return;
    }
    console.log(...args);
  }
}
