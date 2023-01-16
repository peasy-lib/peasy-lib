import { Box } from './box';
import { Circle } from './shapes/circle';
import { ExpandedRect } from './shapes/expanded-rect';
import { ExpandedStadium } from './shapes/expanded-stadium';
import { GeometricShape } from './shapes/geometric-shape';
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

  public drawShape(shape: GeometricShape | Box, color: string, fillColor?: string, debug = true) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    if (fillColor != null) {
      ctx.fillStyle = fillColor;
    }
    // if (debug && !this.debug) {
    //   return;
    // }

    if (shape instanceof Box) {
      ctx.rect(shape.min.x, shape.min.y, shape.max.x - shape.min.x, shape.max.y - shape.min.y);
      ctx.stroke();
    } else if (shape instanceof Line) {
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
      const RADIANS = Math.PI / 180;
      ctx.beginPath();
      const vertices = shape.vertices;
      if (shape.horizontal) {
        ctx.moveTo(vertices[0].x, vertices[0].y);
        ctx.lineTo(vertices[1].x, vertices[1].y);
        ctx.arc(vertices[4].x, vertices[4].y, shape.radius, (shape.orientation + 180) * RADIANS, (shape.orientation) * RADIANS, false);
        ctx.lineTo(vertices[3].x, vertices[3].y);
      } else {
        ctx.moveTo(vertices[0].x, vertices[0].y);
        ctx.lineTo(vertices[1].x, vertices[1].y);
        ctx.arc(vertices[5].x, vertices[5].y, shape.radius, (shape.orientation) * RADIANS, (shape.orientation + 180) * RADIANS, false);
        ctx.lineTo(vertices[3].x, vertices[3].y);
        ctx.arc(vertices[4].x, vertices[4].y, shape.radius, (shape.orientation + 180) * RADIANS, (shape.orientation) * RADIANS, false);
      }
      if (fillColor != null) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(shape.position, color, 2);
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
    } else if (shape instanceof ExpandedRect || shape instanceof ExpandedStadium) {
      shape.shapes.forEach(s => this.drawShape(s, color, fillColor));
      // if (false) {
      //   const { min, max } = shape.corner.getMinMax();
      //   const rotatedSize = max.subtract(min);
      //   let leftCorner = new Vector(Infinity, -Infinity);
      //   let topCorner = new Vector(-Infinity, Infinity);
      //   for (const vertex of shape.corner.vertices) {
      //     if (vertex.x < leftCorner.x) {
      //       leftCorner = vertex;
      //     }
      //     if (vertex.y < topCorner.y) {
      //       topCorner = vertex;
      //     }
      //   }
      //   const vertices = shape.vertices;
      //   if (false) {
      //     ctx.beginPath();
      //     for (let i = 0; i < vertices.length; i++) {
      //       ctx.lineTo(vertices[i].x, vertices[i].y);
      //     }
      //     ctx.lineTo(vertices[0].x, vertices[0].y);
      //     // ctx.rect(shape.left, shape.top, shape.width, shape.height);
      //     if (fillColor != null) {
      //       ctx.fill();
      //     }
      //     ctx.stroke();
      //   }
      //   const top = new Rect(shape.position.clone(), shape.size.clone());
      //   top.size.x -= rotatedSize.x;
      //   // const shift = topCorner.x;
      //   // console.log('shift', shape.corner.vertices, shift, rotatedSize, topCorner);
      //   top.position.x -= topCorner.x; // shift;
      //   top.size.y *= 0.5; // IF not even 90
      //   top.position.y += top.size.y / 2; // IF not even 90
      //   this.drawShape(top, 'blue', fillColor);

      //   const bottom = new Rect(shape.position.clone(), shape.size.clone());
      //   bottom.size.x -= rotatedSize.x;
      //   // const shift = bottomCorner.x;
      //   // console.log('shift', shape.corner.vertices, shift, rotatedSize, bottomCorner);
      //   bottom.position.x += topCorner.x; // shift;
      //   bottom.size.y *= 0.5; // IF not even 90
      //   bottom.position.y -= bottom.size.y / 2; // IF not even 90
      //   this.drawShape(bottom, 'blue', fillColor);

      //   const left = new Rect(shape.position.clone(), shape.size.clone());
      //   left.size.y -= rotatedSize.y;
      //   left.position.y += leftCorner.y; // shift.y;
      //   left.size.x *= 0.5; // IF not even 90
      //   left.position.x -= left.size.x / 2; // IF not even 90
      //   this.drawShape(left, 'green', fillColor);

      //   const right = new Rect(shape.position.clone(), shape.size.clone());
      //   right.size.y -= rotatedSize.y;
      //   right.position.y -= leftCorner.y; // shift.y;
      //   right.size.x *= 0.5; // IF not even 90
      //   right.position.x += right.size.x / 2; // IF not even 90
      //   this.drawShape(right, 'green', fillColor);

      //   let corner = shape.corner.clone();
      //   corner.position = shape.position.clone();
      //   corner.position.x -= top.size.half.x;
      //   corner.position.y -= left.size.half.y;
      //   this.drawShape(corner, color, fillColor);

      //   corner = shape.corner.clone();
      //   corner.position = shape.position.clone();
      //   corner.position.x += top.size.half.x;
      //   corner.position.y -= left.size.half.y;
      //   this.drawShape(corner, color, fillColor);

      //   corner = shape.corner.clone();
      //   corner.position = shape.position.clone();
      //   corner.position.x += top.size.half.x;
      //   corner.position.y += left.size.half.y;
      //   this.drawShape(corner, color, fillColor);

      //   corner = shape.corner.clone();
      //   corner.position = shape.position.clone();
      //   corner.position.x -= top.size.half.x;
      //   corner.position.y += left.size.half.y;
      //   this.drawShape(corner, color, fillColor);
      // }
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
