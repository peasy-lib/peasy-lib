import { posix } from 'path';
import { Rect, Circle, Line, Vector, Point, Polygon, Ray, Stadium, RoundedRect } from '@peasy-lib/peasy-physics';

export class Canvas {
  public logging = false;
  public colliding = false;

  private _ctx: CanvasRenderingContext2D = null;

  public get ctx(): CanvasRenderingContext2D {
    if (this.canvas == null) {
      return;
    }
    if (this._ctx == null) {
      this._ctx = this.canvas.getContext('2d');
    }
    return this._ctx;
  }

  constructor(private canvas: HTMLCanvasElement) { }

  public update(entities: any) {
    const ctx = this.ctx;
    if (ctx == null) {
      return;
    }
    this.ctx.clearRect(0, 0, 1100, 1100);
    entities.forEach(entity => {
      const color = `#${this.colliding ? 'red' : entity.color}`;
      // entity.shapes.map(shape => shape.worldShape).forEach(worldShape => this.drawShape(worldShape.shape, color));
      // entity.worldShapes.forEach(worldShape => this.drawShape(worldShape.shape, color));
      this.drawCross(entity.position, 'red', 4);
    });

    // this.checkCollision(entities[0].worldShapes[0].shape, entities[1].worldShapes[0].shape);

    if (entities.length > 1) {
      this.colliding = this.checkSATCollision(entities[0].worldShapes[0].shape, entities[1].worldShapes[0].shape,
        new Vector(-10, -10));
    }
    // ctx.beginPath();
    // ctx.moveTo(10, 50);
    // ctx.lineTo(100, 75);
    // ctx.lineTo(100, 25);
    // ctx.fill();
  }

  public checkSATCollision(a: Rect, b: Rect, velocity: Vector) {
    this.drawShape(a, this.colliding ? 'red' : 'green');
    this.drawShape(b, this.colliding ? 'red' : 'purple');

    if (velocity.x !== 0 || velocity.y !== 0) {
      const nextB = b.clone();
      nextB.position.add(velocity, true);
      this.drawShape(nextB, this.colliding ? 'red' : 'blue');
    }

    const aVertices = a.vertices;
    const bVertices = b.vertices;
    const normals = [];
    normals.push(
      new Vector(-(aVertices[1].y - aVertices[0].y), aVertices[1].x - aVertices[0].x).normalize(true),
      new Vector(-(aVertices[2].y - aVertices[1].y), aVertices[2].x - aVertices[1].x).normalize(true),
      // new Vector(-(bVertices[1].y - bVertices[0].y), bVertices[1].x - bVertices[0].x).normalize(true),
      // new Vector(-(bVertices[2].y - bVertices[1].y), bVertices[2].x - bVertices[1].x).normalize(true),
    );
    // TODO: Trim multiples of the same normal

    let t_min = +Infinity;
    let t_max = -Infinity;
    this.log('################################');
    for (const axis of normals) {
      let a_min = +Infinity;
      let a_max = -Infinity;
      this.log('a.vertices', `[${aVertices.join('], [')}]`);
      for (const vertex of a.vertices) {
        const dot = vertex.dot(axis);
        this.log('a.dot', dot);
        a_min = Math.min(a_min, dot);
        a_max = Math.max(a_max, dot);
        this.log('a min max', a_min, a_max);
      }
      let b_min = +Infinity;
      let b_max = -Infinity;
      this.log('b.vertices', `[${bVertices.join('], [')}]`);
      for (const vertex of b.vertices) {
        const dot = vertex.dot(axis);
        this.log('b.dot', dot);
        b_min = Math.min(b_min, dot);
        b_max = Math.max(b_max, dot);
        this.log('b min max', b_min, b_max);
      }
      // if (a_min > a_max) {
      //   [a_max, a_min] = [a_min, a_max];
      // }
      // if (b_min > b_max) {
      //   [b_max, b_min] = [b_min, b_max];
      // }
      // a_min = Math.abs(a_min);
      // a_max = Math.abs(a_max);
      // b_min = Math.abs(b_min);
      // b_max = Math.abs(b_max);

      this.log('AXIS', axis)
      if (Math.abs(axis.x) !== 0) {
        const a_line = new Line(new Vector(Math.abs(a_min), 390), new Vector(Math.abs(a_max), 390));
        const b_line = new Line(new Vector(Math.abs(b_min), 392), new Vector(Math.abs(b_max), 392));
        this.log('a_line', a_line);
        this.drawShape(a_line, 'green');
        this.drawShape(b_line, 'purple');
      } else {
        this.log('AXIS !== 0', axis, Math.abs(axis.x))
        const a_line = new Line(new Vector(390, Math.abs(a_min)), new Vector(390, Math.abs(a_max)));
        const b_line = new Line(new Vector(392, Math.abs(b_min)), new Vector(392, Math.abs(b_max)));
        this.log('a_line', a_line);
        this.drawShape(a_line, 'green');
        this.drawShape(b_line, 'purple');
      }
      const v = velocity.dot(axis); // 0; // axis.x === 2 ? 0 : 30; // b.velocity.dot(axis);
      if (v > 0) {
        if (a_max < b_min) {
          this.log('a_max < b_min', false, v);
          return false;
        }
        else if ((a_min < b_min && b_min < a_max) || (b_min < a_min && a_min < b_max)) {
          this.log('max min < max', v, axis.toString());
          t_min = Math.min(t_min, (a_max - b_min) / v);
          t_max = Math.max(t_max, 0);
        }
        else {
          this.log('else', v, axis.toString());
          t_min = Math.min(t_min, (a_max - b_min) / v);
          t_max = Math.max(t_max, (a_min - b_max) / v);
        }
      }
      else if (v < 0) {
        [a_min, a_max, b_min, b_max] = [b_min, b_max, a_min, a_max];
        if (a_max < b_min) {
          this.log('b_max < a_min', false, v);
          return false;
        }
        else if ((a_min < b_min && b_min < a_max) || (b_min < a_min && a_min < b_max)) {
          this.log('max min < max', v);
          t_min = Math.min(t_min, (a_max - b_min) / v);
          t_max = Math.max(t_max, 0);
        }
        else {
          this.log('else', v);
          t_min = Math.min(t_min, (a_max - b_min) / v);
          t_max = Math.max(t_max, (a_min - b_max) / v);
        }
        // console.log('negative v')
        // repeat the above case with a and b swapped
        // if (b_max < a_min) {
        //   this.log('b_max < a_min', false);
        //   return false;
        // }
        // else if ((b_min < a_min && a_min < b_max) || (a_min < b_min && b_min < a_max)) {
        //   this.log('b_max < a_min', false);
        //   t_min = Math.min(t_min, (b_max - a_min) / v);
        //   t_max = Math.max(t_max, 0);
        // }
        // else {
        //   t_min = Math.min(t_min, (b_max - a_min) / v);
        //   t_max = Math.max(t_max, (b_min - a_max) / v);
        // }
      }
      else if (v === 0) {
        if (a_min < b_max && b_min < a_max) {
          this.log(axis.toString(), 'update min max', v, t_min, t_max);
          t_min = Math.min(t_min, 0);
          t_max = Math.max(t_max, 0);
          this.log(axis.toString(), 'update min max', v, t_min, t_max, t_max < t_min);
        }
        else {
          this.log('false');
          return false;
        }
      }
    }
    if (t_max < t_min || (t_max === 0 && t_min === 0)) {
      // advance b by b.velocity * t_max
      console.log('outside', true, t_min, t_max);
      return true;
    }
    else {
      console.log('outside', false, t_min, t_max);
      return t_max <= 1;
    }
  }

  public checkSATCollision1st(a: Rect, b: Rect, velocity: Vector) {
    this.drawShape(a, this.colliding ? 'red' : 'green');
    this.drawShape(b, this.colliding ? 'red' : 'purple');

    if (velocity.x !== 0 || velocity.y !== 0) {
      const nextB = b.clone();
      nextB.position.add(velocity, true);
      this.drawShape(nextB, this.colliding ? 'red' : 'blue');
    }

    const aVertices = a.vertices;
    const bVertices = b.vertices;
    const normals = [];
    normals.push(
      new Vector(-(aVertices[1].y - aVertices[0].y), aVertices[1].x - aVertices[0].x).normalize(true),
      new Vector(-(aVertices[2].y - aVertices[1].y), aVertices[2].x - aVertices[1].x).normalize(true),
      new Vector(-(bVertices[1].y - bVertices[0].y), bVertices[1].x - bVertices[0].x).normalize(true),
      new Vector(-(bVertices[2].y - bVertices[1].y), bVertices[2].x - bVertices[1].x).normalize(true),
    );
    // TODO: Trim multiples of the same normal

    let t_min = +Infinity;
    let t_max = -Infinity;
    for (const axis of normals) {
      let a_min = +Infinity;
      let a_max = -Infinity;
      this.log('a.vertices', `[${aVertices.join('], [')}]`);
      for (const vertex of a.vertices) {
        const dot = vertex.dot(axis);
        this.log('a.dot', dot);
        a_min = Math.min(a_min, dot);
        a_max = Math.max(a_max, dot);
        this.log('a min max', a_min, a_max);
      }
      let b_min = +Infinity;
      let b_max = -Infinity;
      this.log('b.vertices', `[${bVertices.join('], [')}]`);
      for (const vertex of b.vertices) {
        const dot = vertex.dot(axis);
        this.log('b.dot', dot);
        b_min = Math.min(b_min, dot);
        b_max = Math.max(b_max, dot);
        this.log('b min max', b_min, b_max);
      }
      // if (a_min > a_max) {
      //   [a_max, a_min] = [a_min, a_max];
      // }
      // if (b_min > b_max) {
      //   [b_max, b_min] = [b_min, b_max];
      // }
      // a_min = Math.abs(a_min);
      // a_max = Math.abs(a_max);
      // b_min = Math.abs(b_min);
      // b_max = Math.abs(b_max);

      this.log('AXIS', axis)
      if (Math.abs(axis.x) !== 0) {
        const a_line = new Line(new Vector(Math.abs(a_min), 390), new Vector(Math.abs(a_max), 390));
        const b_line = new Line(new Vector(Math.abs(b_min), 392), new Vector(Math.abs(b_max), 392));
        this.log('a_line', a_line);
        this.drawShape(a_line, 'green');
        this.drawShape(b_line, 'purple');
      } else {
        this.log('AXIS !== 0', axis, Math.abs(axis.x))
        const a_line = new Line(new Vector(390, Math.abs(a_min)), new Vector(390, Math.abs(a_max)));
        const b_line = new Line(new Vector(392, Math.abs(b_min)), new Vector(392, Math.abs(b_max)));
        this.log('a_line', a_line);
        this.drawShape(a_line, 'green');
        this.drawShape(b_line, 'purple');
      }
      const v = velocity.dot(axis); // 0; // axis.x === 2 ? 0 : 30; // b.velocity.dot(axis);
      if (v > 0) {
        if (a_max < b_min) {
          this.log('a_max < b_min', false);
          return false;
        }
        else if ((a_min < b_min && b_min < a_max) || (b_min < a_min && a_min < b_max)) {
          this.log('a_max < b_min', false);
          t_min = Math.min(t_min, (a_max - b_min) / v);
          t_max = Math.max(t_max, 0);
        }
        else {
          t_min = Math.min(t_min, (a_max - b_min) / v);
          t_max = Math.max(t_max, (a_min - b_max) / v);
        }
      }
      else if (v < 0) {
        // console.log('negative v')
        // repeat the above case with a and b swapped
        if (b_max < a_min) {
          this.log('b_max < a_min', false);
          return false;
        }
        else if ((b_min < a_min && a_min < b_max) || (a_min < b_min && b_min < a_max)) {
          this.log('b_max < a_min', false);
          t_min = Math.min(t_min, (b_max - a_min) / v);
          t_max = Math.max(t_max, 0);
        }
        else {
          t_min = Math.min(t_min, (b_max - a_min) / v);
          t_max = Math.max(t_max, (b_min - a_max) / v);
        }
      }
      else if (v === 0) {
        if (a_min < b_max && b_min < a_max) {
          this.log(axis.toString(), 'update min max', v, t_min, t_max);
          t_min = Math.min(t_min, 0);
          t_max = Math.max(t_max, 0);
          this.log(axis.toString(), 'update min max', v, t_min, t_max, t_max < t_min);
        }
        else {
          this.log('false');
          return false;
        }
      }
    }
    if (t_max < t_min || (t_max === 0 && t_min === 0)) {
      // advance b by b.velocity * t_max
      console.log('outside', true, t_min, t_max);
      return true;
    }
    else {
      console.log('outside', false, t_min, t_max);
      return t_max <= 1;
    }
  }

  public checkCollision(player, target) {
    this.log('player ' + player);
    const translate = target.position.subtract(player.position);
    this.log('translate ' + translate);
    let vertices = player.vertices;
    this.log('vertices', vertices.map(vertex => '' + vertex));
    vertices = vertices.map(vertex => vertex.subtract(target.position).rotate(-target.orientation).add(target.position));
    this.log('vertices', vertices.map(vertex => '' + vertex));
    vertices.forEach(vertex => this.drawCross(vertex, 'purple', 3));


    // // Rotate target around player
    // const newPosition = target.position.subtract(player.position);
    // newPosition.rotate(-player.orientation, true);
    // newPosition.add(player.position, true);

    // this.drawCross(newPosition, 'purple', 5);

    // // Rotate target around player
    // const point = new Point(player.position.subtract(newPosition));
    // this.log('point', player.position, point);
    // point.rotate(-target.orientation, true);
    // this.log('rotated point', point);

    // this.log('check collision', player, target);
    // this.log('vertices', target.vertices);
    const point = new Point(player.position.subtract(target.position));
    const end = new Point(0, 1);
    // end.rotate(player.orientation, true);
    // point.add(end, true);
    this.log('point', player.position, point, end);
    point.rotate(-(target.orientation), true);
    this.log('rotated point', point);

    const rect = new Rect(new Vector(), player.size.add(target.size));
    // rect.rotate(target.orientation);
    this.colliding = point.within(rect);
    // console.log('within', this.colliding);
    if (point.x > 100 && point.x < 300) {
      this.log(player.orientation, target.orientation, point, rect);
    }

    rect.position.add(target.position, true);
    this.log(rect.vertices);
    point.add(target.position, true);
    this.drawShape(rect, 'blue');
    this.drawCross(point, 'blue', 5);
  }

  public drawShape(shape: Rect | Circle | Line | Polygon | Ray | Stadium, color: string, fillColor?: string, debug = true) {
    const ctx = this._ctx;
    ctx.strokeStyle = color;
    if (fillColor) {
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
      if (fillColor) {
        ctx.fill();
      }
      ctx.stroke();
      this.drawCross(shape.origin, color, 2);
      //   ctx.strokeStyle = color;
      //   ctx.beginPath();
      //   ctx.moveTo(shape.origin.x, shape.origin.y);
      //   const end = shape.origin.add(shape.direction);
      //   ctx.lineTo(end.x, end.y);
      //   ctx.stroke();
      //   ctx.beginPath();
      //   ctx.arc(shape.origin.x, shape.origin.y, 3, 0, 2 * Math.PI);
      //   ctx.stroke();
    } else if (shape instanceof Stadium) {
      // if (shape instanceof Polygon) debugger;

      // ctx.beginPath();
      // ctx.moveTo(shape.position.x, shape.position.y - 3);
      // ctx.lineTo(shape.position.x, shape.position.y + 3);
      // ctx.stroke();
      // ctx.beginPath();
      // ctx.moveTo(shape.position.x - 3, shape.position.y);
      // ctx.lineTo(shape.position.x + 3, shape.position.y);
      // ctx.stroke();

      // ctx.beginPath();
      // const vertices = shape.vertices;
      // for (let i = 0; i < vertices.length; i++) {
      //   ctx.lineTo(vertices[i].x, vertices[i].y);
      // }
      // ctx.lineTo(vertices[0].x, vertices[0].y);
      // // ctx.rect(shape.left, shape.top, shape.width, shape.height);
      // ctx.stroke();

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
      if (fillColor) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(position, color, 2);
    } else if (shape instanceof RoundedRect) {
      // if (shape instanceof Polygon) debugger;

      // ctx.beginPath();
      // ctx.moveTo(shape.position.x, shape.position.y - 3);
      // ctx.lineTo(shape.position.x, shape.position.y + 3);
      // ctx.stroke();
      // ctx.beginPath();
      // ctx.moveTo(shape.position.x - 3, shape.position.y);
      // ctx.lineTo(shape.position.x + 3, shape.position.y);
      // ctx.stroke();

      // ctx.beginPath();
      // const vertices = shape.vertices;
      // for (let i = 0; i < vertices.length; i++) {
      //   ctx.lineTo(vertices[i].x, vertices[i].y);
      // }
      // ctx.lineTo(vertices[0].x, vertices[0].y);
      // // ctx.rect(shape.left, shape.top, shape.width, shape.height);
      // ctx.stroke();

      // ctx.strokeStyle = 'black';
      // ctx.beginPath();
      // ctx.rect(shape.left, shape.top, shape.width, shape.height);
      // ctx.stroke();

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
      if (fillColor) {
        ctx.fill();
      }
      ctx.stroke();
      // } else {
      //   ctx.beginPath();
      //   ctx.arc(shape.position.x, shape.top, shape.radius, 0, Math.PI, true);
      //   ctx.lineTo(shape.left, shape.bottom);
      //   ctx.arc(shape.position.x, shape.bottom, shape.radius, Math.PI, 0, true);
      //   ctx.lineTo(shape.right, shape.top);
      //   ctx.stroke();
      // }

      this.drawCross(shape.position, color, 2);
    } else if (shape instanceof Rect || shape instanceof Polygon) {
      // if (shape instanceof Polygon) debugger;

      // ctx.beginPath();
      // ctx.moveTo(shape.position.x, shape.position.y - 3);
      // ctx.lineTo(shape.position.x, shape.position.y + 3);
      // ctx.stroke();
      // ctx.beginPath();
      // ctx.moveTo(shape.position.x - 3, shape.position.y);
      // ctx.lineTo(shape.position.x + 3, shape.position.y);
      // ctx.stroke();

      ctx.beginPath();
      const vertices = shape.vertices;
      for (let i = 0; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      // ctx.rect(shape.left, shape.top, shape.width, shape.height);
      if (fillColor) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(shape.position, color, 2);
    } else if (shape instanceof Circle) {
      // ctx.beginPath();
      // ctx.moveTo(shape.position.x, shape.position.y - 3);
      // ctx.lineTo(shape.position.x, shape.position.y + 3);
      // ctx.stroke();
      // ctx.beginPath();
      // ctx.moveTo(shape.position.x - 3, shape.position.y);
      // ctx.lineTo(shape.position.x + 3, shape.position.y);
      // ctx.stroke();


      ctx.beginPath();
      ctx.arc(shape.position.x, shape.position.y, shape.radius, 0, 2 * Math.PI);
      if (fillColor) {
        ctx.fill();
      }
      ctx.stroke();

      this.drawCross(shape.position, color, 2);
      // } else if (shape instanceof Capsule) {
      //   const rect = shape.rect;
      //   ctx.strokeStyle = color;

      //   ctx.beginPath();
      //   ctx.moveTo(!shape.roundTopLeft ? rect.left : rect.left + shape.radius, rect.top);
      //   ctx.lineTo(!shape.roundTopRight ? rect.right : rect.right - shape.radius, rect.top);
      //   ctx.stroke();
      //   ctx.beginPath();
      //   ctx.moveTo(!shape.roundBottomLeft ? rect.left : rect.left + shape.radius, rect.bottom);
      //   ctx.lineTo(!shape.roundBottomRight ? rect.right : rect.right - shape.radius, rect.bottom);
      //   ctx.stroke();
      //   ctx.beginPath();
      //   ctx.moveTo(rect.left, !shape.roundTopLeft ? rect.top : rect.top + shape.radius);
      //   ctx.lineTo(rect.left, !shape.roundBottomLeft ? rect.bottom : rect.bottom - shape.radius);
      //   ctx.stroke();
      //   ctx.beginPath();
      //   ctx.moveTo(rect.right, !shape.roundTopRight ? rect.top : rect.top + shape.radius);
      //   ctx.lineTo(rect.right, !shape.roundBottomRight ? rect.bottom : rect.bottom - shape.radius);
      //   ctx.stroke();

      //   if (shape.roundTopLeft) {
      //     ctx.beginPath();
      //     ctx.arc(rect.left + shape.radius, rect.top + shape.radius, shape.radius, 1 * Math.PI, 1.5 * Math.PI);
      //     ctx.stroke();
      //   }
      //   if (shape.roundTopRight) {
      //     ctx.beginPath();
      //     ctx.arc(rect.right - shape.radius, rect.top + shape.radius, shape.radius, 1.5 * Math.PI, 2 * Math.PI);
      //     ctx.stroke();
      //   }
      //   if (shape.roundBottomLeft) {
      //     ctx.beginPath();
      //     ctx.arc(rect.left + shape.radius, rect.bottom - shape.radius, shape.radius, 0.5 * Math.PI, 1 * Math.PI);
      //     ctx.stroke();
      //   }
      //   if (shape.roundBottomRight) {
      //     ctx.beginPath();
      //     ctx.arc(rect.right - shape.radius, rect.bottom - shape.radius, shape.radius, 0 * Math.PI, 0.5 * Math.PI);
      //     ctx.stroke();
      //   }
    }
  }

  public drawCross(position: Vector, color: string, size: number, debug = true) {
    const ctx = this._ctx;
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

  public log(...args) {
    if (!this.logging) {
      return;
    }
    console.log(...args);
  }
}
