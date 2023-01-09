import { ExpandedRect } from './expanded-rect';
/* eslint-disable max-lines-per-function */
import { Circle } from './circle';
import { Intersection } from './intersection';
import { Line } from './line';
import { Rect } from './rect';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from "./vector";

export class Ray {
  // public element: SVGLineElement;

  public magnitude: number;

  private static readonly _ToDegreesFactor = (180 / Math.PI);
  private static readonly _AngleModifier = 360 + 90;

  private _directionVector?: Vector;
  private _directionAngle?: number;

  public constructor(
    public origin: Vector,
    direction: Vector | number,
    magnitude?: number,
  ) {
    if (direction instanceof Vector) {
      this.magnitude = magnitude ?? direction.magnitude;
      this._directionVector = direction.normalize();
    } else {
      this._directionAngle = direction;
      this.magnitude = magnitude ?? 1;
    }
  }

  public get normal(): Vector {
    const direction = this.directionVector;
    return new Vector(-direction.y, direction.x);
  }

  public get directionVector(): Vector {
    return this._directionVector != null
      ? this._directionVector
      : new Vector();
  }

  public get directionAngle(): number {
    return this._directionAngle != null
      ? this._directionAngle
      : (Math.atan2(this._directionVector!.y, this._directionVector!.x) * Ray._ToDegreesFactor + Ray._AngleModifier) % 360;
  }

  public set direction(direction: Vector | number) {
    if (direction instanceof Vector) {
      this._directionVector = direction;
      this._directionAngle = undefined;
    } else {
      this._directionAngle = direction;
      this._directionVector = undefined;
    }
  }

  public get end(): Vector {
    return this.origin.add(this.directionVector.multiply(this.magnitude));
  }

  public set end(value: Vector) {
    const delta = value.subtract(this.origin);
    this.direction = delta.normalize();
    this.magnitude = delta.magnitude;
  }

  public getIntersection(shapes: Rect | Circle | Stadium | RoundedRect | ExpandedRect | (Rect | Circle | Stadium | RoundedRect | ExpandedRect)[]): Intersection {
    if (shapes instanceof Stadium) {
      return this.getIntersectionStadium(shapes);
    }
    if (shapes instanceof RoundedRect) {
      return this.getIntersectionRoundedRect(shapes);
    }
    if (shapes instanceof Rect) {
      return this.getIntersectionRect(shapes);
    }
    if (shapes instanceof Circle) {
      return this.getIntersectionCircle(shapes);
    }
    return new Intersection();
  }

  public getIntersectionRect(target: Rect): Intersection {
    const intersection = new Intersection();
    const start = this.origin;
    const direction = this.end.subtract(this.origin);

    const near = target.position.subtract(target.half).subtract(start).divide(direction);
    const far = target.position.add(target.half).subtract(start).divide(direction);

    if (isNaN(near.x) || isNaN(near.y) || isNaN(far.x) || isNaN(far.y)) {
      far.y = Infinity;
      // this.drawShape(line, 'blue');
      return intersection;
    }

    if (near.x > far.x) {
      [near.x, far.x] = [far.x, near.x];
    }
    if (near.y > far.y) {
      [near.y, far.y] = [far.y, near.y];
    }
    // console.log(`Near: ${near}, far: ${far}`);

    // lib: if (near.x >= far.y || near.y >= far.x) {
    if (near.x > far.y || near.y > far.x) {
      // this.drawShape(line, 'blue');
      return intersection;
    }

    const nearTime = Math.max(near.x, near.y);
    // const farTime = Math.min(far.x, far.y);

    // Not working properly
    // if (farTime < 0 || nearTime > 1) {
    if (nearTime < 0 || nearTime > 1) {
      // this.drawShape(line, 'blue');
      return intersection;
    }

    intersection.normal = direction.sign();
    if (this.directionVector.multiply(intersection.normal).zero) {
      // this.drawShape(line, 'blue');
      console.log('%%% No movement in normal direction.');
      return intersection;
    }

    // // Fix precision issues!
    intersection.time = nearTime;
    // let time = (Math.floor(nearTime * PRECISION) - 0) / PRECISION;
    // if (time < 0) {
    //   time = 0;
    // }

    intersection.point = start.add(direction.multiply(intersection.time));

    if (intersection.point.x > target.left && intersection.point.x < target.right &&
      intersection.point.y > target.top && intersection.point.y < target.bottom) {
      // console.log('##################### WITHIN RECT #########');
    }

    if (near.x < near.y) {
      // console.log('sign x', normal, normal.multiply(new Vector(0, -1)));
      if (Math.abs(intersection.normal.y) === 0) {
        console.log('IGNORING y');
        // this.drawShape(line, 'blue');
        return intersection;
      }
      intersection.normal.multiply(new Vector(0, -1), true);
      intersection.tangent = new Vector(-intersection.normal.y, intersection.normal.x);
    } else {
      // console.log('sign y', intersection.normal, intersection.normal.multiply(new Vector(-1, 0)));
      if (Math.abs(intersection.normal.x) === 0) {
        console.log('IGNORING x');
        // this.drawShape(line, 'blue');
        return intersection;
      }
      intersection.normal.multiply(new Vector(-1, 0), true);
      intersection.tangent = new Vector(-intersection.normal.y, intersection.normal.x);
    }

    // this.drawShape(line, 'red');

    // this.drawShape(new Circle(point, 10), 'red');
    // this.drawShape(new Line(point, point.add(normal.multiply(20))), 'brown', false);
    // this.drawShape(new Line(point, point.add(tangent.multiply(40))), 'purple', false);

    // // this.drawShape(new Circle(direction.multiply(near.x).add(start), 5), intersects && nearTime === near.x ? 'red' : 'blue');
    // // this.drawShape(new Circle(direction.multiply(far.x).add(start), 5), intersects && nearTime === far.x ? 'red' : 'blue');
    // // this.drawShape(new Circle(direction.multiply(near.y).add(start), 5), intersects && nearTime === near.y ? 'red' : 'darkblue');
    // // this.drawShape(new Circle(direction.multiply(far.y).add(start), 5), intersects && nearTime === far.y ? 'red' : 'darkblue');

    // // console.log('LineRect', normal, tangent, true, time, line, direction, target);
    intersection.intersects = true;
    return intersection;
  }

  public getIntersectionCircle(target: Circle): Intersection {
    const intersection = new Intersection();
    const startCenterLine = new Line(this.origin, target.position);

    const originCircleDirection = this.origin.subtract(target.position);
    const lengthClosest = originCircleDirection.dot(this.directionVector);
    const lengthClosestInCircle = originCircleDirection.dot(originCircleDirection) - (target.radius * target.radius);
    let firstTime = lengthClosest * lengthClosest - lengthClosestInCircle; // Should be sqrt, but wait since costly
    if (firstTime < 0) {
      return intersection;
    }
    firstTime = Math.sqrt(firstTime);
    const time = -lengthClosest - firstTime;

    if (time < 0 || time > this.magnitude) {
      return intersection;
    }

    intersection.point = this.origin.add(this.directionVector.multiply(time));

    intersection.time = time / this.magnitude;

    intersection.normal = intersection.point.subtract(target.position).normalize();
    intersection.tangent = new Vector(-intersection.normal.y, intersection.normal.x);
    intersection.intersects = true;
    return intersection;
  }

  public getIntersectionStadium(target: Stadium): Intersection {
    let firstIntersection = new Intersection();
    const shapes: (Rect | Circle)[] = [];
    if (target.horizontal) {
      shapes.push(
        new Rect(target.position, target.size.subtract(new Vector(target.radius * 2, 0))),
        new Circle(new Vector(target.left + target.radius, target.position.y), target.radius),
        new Circle(new Vector(target.right - target.radius, target.position.y), target.radius),
      );
    } else {
      shapes.push(
        new Rect(target.position, target.size.subtract(new Vector(0, target.radius * 2))),
        new Circle(new Vector(target.position.x, target.top + target.radius), target.radius),
        new Circle(new Vector(target.position.x, target.bottom - target.radius), target.radius),
      );
    }
    shapes.forEach(shape => {
      const intersection = this.getIntersection(shape);
      if (intersection.intersects) {
        if (intersection.time < firstIntersection.time) {
          firstIntersection = intersection;
        }
      }
    });
    firstIntersection.shapes = shapes;
    return firstIntersection;
  }

  public getIntersectionRoundedRect(target: RoundedRect): Intersection {
    let firstIntersection = new Intersection();
    const r = target.radius;
    const r2 = r * 2;
    const shapes: (Rect | Circle)[] = [
      new Circle(new Vector(target.left + r, target.top + r), r),
      new Circle(new Vector(target.right - r, target.top + r), r),

      new Circle(new Vector(target.right - r, target.bottom - r), r),
      new Circle(new Vector(target.left + r, target.bottom - r), r),

      new Rect(target.position, target.size.subtract(new Vector(r2, 0))),
      new Rect(target.position, target.size.subtract(new Vector(0, r2))),
    ];
    shapes.forEach(shape => {
      const intersection = this.getIntersection(shape);
      if (intersection.intersects) {
        if (intersection.time < firstIntersection.time) {
          firstIntersection = intersection;
        }
      }
    });
    firstIntersection.shapes = shapes;
    return firstIntersection;
  }

  public clone(): Ray {
    return new Ray(this.origin.clone(), this.directionVector.clone(), this.magnitude);
  }
    // public getIntersectionCircleOld(target: Circle): IIntersection {
  //   // compute the euclidean distance between A and B
  //   // LAB = sqrt((Bx - Ax)²+(By - Ay)²)

  //   // compute the direction vector D from A to B
  //   // Dx = (Bx - Ax) / LAB
  //   // Dy = (By - Ay) / LAB

  //   // the equation of the line AB is x = Dx*t + Ax, y = Dy*t + Ay with 0 <= t <= LAB.

  //   // compute the distance between the points A and E, where
  //   // E is the point of AB closest the circle center (Cx, Cy)
  //   // t = Dx * (Cx - Ax) + Dy * (Cy - Ay)

  //   // compute the coordinates of the point E
  //   // Ex = t * Dx + Ax
  //   // Ey = t * Dy + Ay
  //   const startCenterLine = new Line(this.origin, target.position);

  //   const dotTemp = this.directionVector.multiply(startCenterLine.direction);
  //   const startClosestDistance = (dotTemp.x + dotTemp.y) / this.magnitude;
  //   const closestLinePoint = this.origin.add(this.directionVector.multiply(startClosestDistance));
  //   // this.drawShape(new Circle(closestLinePoint, 10), 'black');

  //   // compute the euclidean distance between E and C
  //   // LEC = sqrt((Ex - Cx)²+(Ey - Cy)²)
  //   const closestLinePointCenterDistance = closestLinePoint.subtract(target.position).magnitude;

  //   // // test if the line intersects the circle
  //   // if (LEC < R) {
  //   //     // compute distance from t to circle intersection point
  //   //     dt = sqrt(R² - LEC²)

  //   //     // compute first intersection point
  //   //     Fx = (t - dt) * Dx + Ax
  //   //     Fy = (t - dt) * Dy + Ay

  //   //     // compute second intersection point
  //   //     Gx = (t + dt) * Dx + Ax
  //   //     Gy = (t + dt) * Dy + Ay
  //   // }
  //   // // else test if the line is tangent to circle
  //   // else if (LEC == R) {
  //   //     // tangent point to circle is E
  //   // }
  //   // else {
  //   //     // line doesn't touch circle
  //   // }

  //   // this.drawShape(line, 'blue');

  //   let time;
  //   let point;
  //   if (closestLinePointCenterDistance > target.radius) {
  //     return { intersects: false };
  //   }
  //   if (closestLinePointCenterDistance === target.radius) {
  //     time = startClosestDistance / this.magnitude;
  //     point = closestLinePoint;

  //     // this.drawShape(new Circle(closestLinePoint, 5), 'red');
  //     // return {
  //     //     intersects: true,
  //     //     time: startClosestDistance / line.magnitude,
  //     //     point: closestLinePoint,
  //     //     normal: new Vector() // ---- INVESTIGATE
  //     // };
  //   } else {
  //     const intersectionDistance = Math.sqrt(target.radius ** 2 - closestLinePointCenterDistance ** 2);

  //     // if (startClosestDistance - intersectionDistance > line.magnitude) {
  //     //     // this.drawShape(new Circle(closestLinePoint, 5), 'blue');
  //     //     this.drawShape(line, 'blue');
  //     //     return { intersects: false };
  //     // }

  //     const near = this.origin.add(this.directionVector.multiply(startClosestDistance - intersectionDistance));
  //     const far = this.origin.add(this.directionVector.multiply(startClosestDistance + intersectionDistance));
  //     // this.drawShape(new Circle(far, 10), 'red');

  //     time = (startClosestDistance - intersectionDistance) / this.magnitude;
  //     point = near;
  //   }

  //   if (time < 0 || time > 1) {
  //     // this.drawShape(this, 'blue');
  //     return { intersects: false };
  //   }

  //   // // Fix precision issues!
  //   // const timeBefore = time;
  //   // time = (Math.floor(time * PRECISION) - 0) / PRECISION;
  //   // if (time < 0) {
  //   //   time = 0;
  //   // }
  //   // if (time !== timeBefore) {
  //   //   console.log('###### New time value', timeBefore, '=>', time);
  //   // }
  //   point = this.origin.add(this.directionVector.multiply(time));

  //   // const newPosition = line.start.add(line.direction.multiply(time));
  //   // const normal = newPosition.subtract(target.position).normalize();

  //   // if (point.distance(target.position) < target.radius) {
  //   //   console.log('##################### WITHIN CIRCLE #########');
  //   // }

  //   const normal = point.subtract(target.position).normalize();

  //   if (this.directionVector.multiply(normal).zero) {
  //     // this.drawShape(this, 'blue');
  //     console.log('%%% No movement in normal direction.');
  //     return { intersects: false };
  //   }

  //   const closestLinePointCircle = closestLinePoint.subtract(target.position).normalize().multiply(target.radius).add(target.position);
  //   // const signIntersection = closestLinePointCircle.subtract(target.position).sign();
  //   // console.log('intersect sign', signIntersection);
  //   // this.drawShape(new Line(target.position, closestLinePointCircle), 'green');
  //   // this.drawShape(new Circle(closestLinePointCircle, 5), 'green');

  //   // const signStart = this.start.subtract(target.position).sign();
  //   // const signPoint = point.subtract(target.position).sign();
  //   // console.log('signs', signStart, signPoint, signStart.subtract(signIntersection), signPoint.subtract(signIntersection));
  //   let tangent;
  //   if (this.origin.x < target.position.x && this.origin.y < target.position.y) {
  //     tangent = new Vector(-normal.y, normal.x);
  //   } else if (this.origin.x > target.position.x && this.origin.y < target.position.y) {
  //     tangent = new Vector(-normal.y, normal.x);
  //   } else if (this.origin.x < target.position.x && this.origin.y > target.position.y) {
  //     tangent = new Vector(-normal.y, normal.x);
  //   } else {
  //     tangent = new Vector(-normal.y, normal.x);
  //   }

  //   // if (signIntersection.x + signIntersection.y === 0) {
  //   //     tangental.multiply(new Vector(-1, -1), true);
  //   // }
  //   // const tangental = new Vector(-normal.y, normal.x);
  //   // const tangentalDot = tangental.multiply(line.direction).x + tangental.multiply(line.direction).y;
  //   // console.log('tangental', line.direction, tangental, tangentalDot, line.direction.multiply(tangentalDot));
  //   // if (tangentalDot <= 0) {
  //   //     tangental.multiply(tangentalDot, true);
  //   //     tangental.normalize(true);
  //   // }

  //   // const sign = normal.sign();
  //   // console.log('sign', sign, target.position.subtract(point).sign());
  //   // tangental.multiply(line.directionVector, true);

  //   // this.drawShape(new Circle(point, 10), 'red');
  //   // this.drawShape(new Line(point, point.add(normal.multiply(20))), 'brown', false);
  //   // this.drawShape(new Line(point, point.add(tangent.multiply(40))), 'purple');
  //   // // this.drawShape(new Line(point, point.add(tangental.multiply(new Vector(-1, -1).multiply(40)))), 'pink');

  //   // this.drawShape(new Circle(closestLinePoint, 5), 'red');
  //   // this.drawShape(new Circle(near, 5), 'red');
  //   // this.drawShape(new Circle(far, 5), 'red');'
  //   return {
  //     intersects: true,
  //     time,
  //     point,
  //     normal,
  //     tangent,
  //   };
  //   /*
  //   const start = this.origin;
  //   const direction = this.end.subtract(this.origin);

  //   const near = target.position.subtract(target.half).subtract(start).divide(direction);
  //   const far = target.position.add(target.half).subtract(start).divide(direction);

  //   if (isNaN(near.x) || isNaN(near.y) || isNaN(far.x) || isNaN(far.y)) {
  //     far.y = Infinity;
  //     // this.drawShape(line, 'blue');
  //     return { intersects: false };
  //   }

  //   if (near.x > far.x) {
  //     [near.x, far.x] = [far.x, near.x];
  //   }
  //   if (near.y > far.y) {
  //     [near.y, far.y] = [far.y, near.y];
  //   }
  //   // console.log(`Near: ${near}, far: ${far}`);

  //   // lib: if (near.x >= far.y || near.y >= far.x) {
  //   if (near.x > far.y || near.y > far.x) {
  //     // this.drawShape(line, 'blue');
  //     return { intersects: false };
  //   }

  //   const nearTime = Math.max(near.x, near.y);
  //   // const farTime = Math.min(far.x, far.y);

  //   // Not working properly
  //   // if (farTime < 0 || nearTime > 1) {
  //   if (nearTime < 0 || nearTime > 1) {
  //     // this.drawShape(line, 'blue');
  //     return { intersects: false };
  //   }

  //   const normal = direction.sign();
  //   if (this.directionVector.multiply(normal).zero) {
  //     // this.drawShape(line, 'blue');
  //     console.log('%%% No movement in normal direction.');
  //     return { intersects: false };
  //   }

  //   // // Fix precision issues!
  //   const time = nearTime;
  //   // let time = (Math.floor(nearTime * PRECISION) - 0) / PRECISION;
  //   // if (time < 0) {
  //   //   time = 0;
  //   // }

  //   const point = start.add(direction.multiply(time));

  //   if (point.x > target.left && point.x < target.right &&
  //     point.y > target.top && point.y < target.bottom) {
  //     console.log('##################### WITHIN RECT #########');
  //   }

  //   let tangent;
  //   if (near.x < near.y) {
  //     // console.log('sign x', normal, normal.multiply(new Vector(0, -1)));
  //     if (normal.y === 0) {
  //       console.log('IGNORING y');
  //       // this.drawShape(line, 'blue');
  //       return { intersects: false };
  //     }
  //     normal.multiply(new Vector(0, -1), true);
  //     tangent = new Vector(-normal.y, normal.x);
  //   } else {
  //     // console.log('sign y', normal, normal.multiply(new Vector(-1, 0)));
  //     if (normal.x === 0) {
  //       console.log('IGNORING x');
  //       // this.drawShape(line, 'blue');
  //       return { intersects: false };
  //     }
  //     normal.multiply(new Vector(-1, 0), true);
  //     tangent = new Vector(-normal.y, normal.x);
  //   }

  //   // this.drawShape(line, 'red');

  //   // this.drawShape(new Circle(point, 10), 'red');
  //   // this.drawShape(new Line(point, point.add(normal.multiply(20))), 'brown', false);
  //   // this.drawShape(new Line(point, point.add(tangent.multiply(40))), 'purple', false);

  //   // // this.drawShape(new Circle(direction.multiply(near.x).add(start), 5), intersects && nearTime === near.x ? 'red' : 'blue');
  //   // // this.drawShape(new Circle(direction.multiply(far.x).add(start), 5), intersects && nearTime === far.x ? 'red' : 'blue');
  //   // // this.drawShape(new Circle(direction.multiply(near.y).add(start), 5), intersects && nearTime === near.y ? 'red' : 'darkblue');
  //   // // this.drawShape(new Circle(direction.multiply(far.y).add(start), 5), intersects && nearTime === far.y ? 'red' : 'darkblue');

  //   // // console.log('LineRect', normal, tangent, true, time, line, direction, target);
  //   return { intersects: true, time, point, normal, tangent };
  //   */
  // }
}
