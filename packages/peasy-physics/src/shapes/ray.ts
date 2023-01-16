import { ExpandedRect } from './expanded-rect';
/* eslint-disable max-lines-per-function */
import { Circle } from './circle';
import { Intersection } from '../intersection';
import { Line } from './line';
import { Rect } from './rect';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from "../vector";
import { Box } from '../box';
import { ExpandedStadium } from './expanded-stadium';

export class Ray {
  // public element: SVGLineElement;

  private static readonly _ToDegreesFactor = (180 / Math.PI);
  private static readonly _AngleModifier = 360 + 90;

  // A Ray has at least one of
  // - a direction vector (not normalized)
  // - a normalized direction vector and a magnitude
  // - a direction angle and a magnitude

  private _magnitude?: number;
  private _direction?: Vector;
  private _normalizedDirection?: Vector;
  private _directionAngle?: number;
  private _end?: Vector;

  public constructor(
    public origin: Vector,
    direction: Vector | number,
    magnitude?: number,
  ) {
    if (direction instanceof Vector) {
      if (magnitude == null) {
        this._direction = direction;
      } else {
        this._normalizedDirection = direction;
        this._magnitude = magnitude;
      }
    } else {
      this._directionAngle = direction;
      this._magnitude = magnitude ?? 1;
    }
  }

  public get direction(): Vector {
    if (this._direction == null) {
      this._direction = this._normalizedDirection != null
        ? this._normalizedDirection.multiply(this.magnitude)
        : new Vector(); // TODO: Should calculate based on angle and magnitude
    }
    return this._direction;
  }

  public get normalizedDirection(): Vector {
    if (this._normalizedDirection == null) {
      this._normalizedDirection = this._direction != null
        ? this._direction.normalize()
        : new Vector(); // TODO: Should calculate based on angle
    }
    return this._normalizedDirection;
  }

  public get magnitude(): number {
    if (this._magnitude == null) {
      this._magnitude = this._direction!.magnitude;
    }
    return this._magnitude;
  }

  public get directionAngle(): number {
    if (this._directionAngle == null) {
      const direction = this._normalizedDirection ?? this._direction;
      this._directionAngle = (Math.atan2(direction!.y, direction!.x) * Ray._ToDegreesFactor + Ray._AngleModifier) % 360;
    }
    return this._directionAngle;
  }

  public get end(): Vector {
    if (this._end == null) {
      this._end = this.origin.add(
        this._direction != null
          ? this._direction
          : (this._normalizedDirection!.multiply(this._magnitude!)
            // TODO: Should also calculate based on angle and magnitude
          )
      );
    }
    return this._end;
  }

  public set end(value: Vector) {
    this._end = value;
    const delta = value.subtract(this.origin);
    if (this._direction != null) {
      this._direction = delta;
      this._normalizedDirection = undefined;
      this._directionAngle = undefined;
      this._magnitude = undefined;
    } else if (this._normalizedDirection != null) {
      this._direction = undefined;
      this._normalizedDirection = delta.normalize();
      this._directionAngle = undefined;
      this._magnitude = delta.magnitude;
    } else if (this._directionAngle != null) {
      this._direction = undefined;
      this._normalizedDirection = undefined;
      this._directionAngle = undefined; // TODO: Calculate angle based on delta
      this._magnitude = delta.magnitude;
    }
  }

  public get normal(): Vector {
    const direction = this.normalizedDirection;
    return new Vector(-direction.y, direction.x);
  }

  public getIntersection(shapes: Rect | Circle | Stadium | RoundedRect | ExpandedRect | Line | Box | ExpandedStadium | (Rect | Circle | Stadium | RoundedRect | ExpandedRect | Line | Box | ExpandedStadium)[]): Intersection {
    if (shapes instanceof Box) {
      return this.getIntersectionBox(shapes);
    }
    if (shapes instanceof Line) {
      return this.getIntersectionLine(shapes);
    }
    if (shapes instanceof Rect) {
      if (shapes.orientation % 180 === 0) {
        return this.getIntersectionBox(new Box(new Vector(shapes.left, shapes.top), new Vector(shapes.right, shapes.bottom)));
      }
      // if (shapes.orientation % 90 === 0) {
      //   return this.getIntersectionBox(new Box(new Vector(shapes.left, shapes.top), new Vector(shapes.right, shapes.bottom)));
      // }
      return this.getIntersectionShapes(shapes);
    }
    if (shapes instanceof Stadium) {
      return this.getIntersectionShapes(shapes);
    }
    if (shapes instanceof ExpandedRect) {
      return this.getIntersectionShapes(shapes);
    }
    if (shapes instanceof ExpandedStadium) {
      return this.getIntersectionShapes(shapes);
    }

    if (shapes instanceof RoundedRect) {
      return this.getIntersectionRoundedRect(shapes);
    }
    if (shapes instanceof Circle) {
      return this.getIntersectionCircle(shapes);
    }
    return new Intersection();
  }

  public getIntersectionBox(target: Box): Intersection {
    const intersection = new Intersection();
    const start = this.origin;
    const direction = this.direction;

    const near = target.min.subtract(start).divide(direction);
    const far = target.max.subtract(start).divide(direction);

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
    if (this.normalizedDirection.multiply(intersection.normal).zero) {
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

    if (intersection.point.x > target.min.x && intersection.point.x < target.max.x &&
      intersection.point.y > target.min.y && intersection.point.y < target.max.y) {
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
    const lengthClosest = originCircleDirection.dot(this.normalizedDirection);
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

    intersection.point = this.origin.add(this.normalizedDirection.multiply(time));

    intersection.time = time / this.magnitude;

    intersection.normal = intersection.point.subtract(target.position).normalize();
    intersection.tangent = new Vector(-intersection.normal.y, intersection.normal.x);
    intersection.intersects = true;
    return intersection;
  }

  public getIntersectionShapes(target: Rect | Stadium | ExpandedRect | ExpandedStadium): Intersection {
    let firstIntersection = new Intersection();
    const shapes = target.shapes;
    shapes.forEach(shape => {
      const intersection = this.getIntersection(shape as Rect | Circle | Line);
      if (intersection.intersects) {
        if (intersection.time < firstIntersection.time) {
          firstIntersection = intersection;
        }
      }
    });
    firstIntersection.shapes = shapes;
    return firstIntersection;
  }

  // public getIntersectionRect(target: Rect): Intersection {
  //   let firstIntersection = new Intersection();
  //   const shapes = target.shapes;
  //   shapes.forEach(shape => {
  //     const intersection = this.getIntersection(shape);
  //     if (intersection.intersects) {
  //       if (intersection.time < firstIntersection.time) {
  //         firstIntersection = intersection;
  //       }
  //     }
  //   });
  //   firstIntersection.shapes = shapes;
  //   return firstIntersection;
  // }

  // public getIntersectionStadium(target: Stadium): Intersection {
  //   let firstIntersection = new Intersection();
  //   const shapes = target.shapes;
  //   shapes.forEach(shape => {
  //     const intersection = this.getIntersection(shape);
  //     if (intersection.intersects) {
  //       if (intersection.time < firstIntersection.time) {
  //         firstIntersection = intersection;
  //       }
  //     }
  //   });
  //   firstIntersection.shapes = shapes;
  //   return firstIntersection;
  // }

  public getIntersectionRoundedRect(target: RoundedRect): Intersection {
    let firstIntersection = new Intersection();
    const shapes = target.shapes;
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

    // let firstIntersection = new Intersection();
    // const r = target.radius;
    // const r2 = r * 2;
    // const shapes: (Rect | Circle)[] = [
    //   new Circle(new Vector(target.left + r, target.top + r), r),
    //   new Circle(new Vector(target.right - r, target.top + r), r),

    //   new Circle(new Vector(target.right - r, target.bottom - r), r),
    //   new Circle(new Vector(target.left + r, target.bottom - r), r),

    //   new Rect(target.position, target.size.subtract(new Vector(r2, 0))),
    //   new Rect(target.position, target.size.subtract(new Vector(0, r2))),
    // ];
    // shapes.forEach(shape => {
    //   const intersection = this.getIntersection(shape);
    //   if (intersection.intersects) {
    //     if (intersection.time < firstIntersection.time) {
    //       firstIntersection = intersection;
    //     }
    //   }
    // });
    // firstIntersection.shapes = shapes;
    // return firstIntersection;
  }

  public checkIntersection(target: Line) {
    // console.log(x1, y1, '->', x2, y2, 'vs', x3, y3, '->', x4, y4);
    const start: Vector = this.origin;
    const end: Vector = this.end;
    const targetStart: Vector = target.start;
    const targetEnd: Vector = target.end;

    const direction = end.subtract(start);
    const targetDirection = targetEnd.subtract(targetStart);
    const startDirection = start.subtract(targetStart);

    const denom = (targetDirection.y * direction.x) - (targetDirection.x * direction.y);
    const numeA = (targetDirection.x * startDirection.y) - (targetDirection.y * startDirection.x);
    const numeB = (direction.x * startDirection.y) - (direction.y * startDirection.x);

    if (denom === 0) {
      if (numeA === 0 && numeB === 0) {
        return null;
      }
      return null;
    }

    const time = numeA / denom;
    const targetTime = numeB / denom;

    if (time < 0 || time > 1 || targetTime < 0 || targetTime > 1) {
      return null;
    }

    // console.log('times', time, targetTime);
    return {
      time,
      point: new Vector(start.x + (time * direction.x), start.y + (time * direction.y))
    };

    // if (time >= 0 && time <= 1 && targetTime >= 0 && targetTime <= 1) {
    //   // console.log('times', time, targetTime);
    //   return {
    //     time,
    //     point: new Vector(start.x + (time * direction.x), start.y + (time * direction.y))
    //   };
    // }

    // return null;
  }

  public getIntersectionLine(target: Line): Intersection {
    const intersection = new Intersection();
    const start: Vector = this.origin;
    const targetStart: Vector = target.start;
    const direction = this.end.subtract(start);
    const targetDirection = target.direction;
    const startDirection = start.subtract(targetStart);

    const denom = (targetDirection.y * direction.x) - (targetDirection.x * direction.y);
    const numeA = (targetDirection.x * startDirection.y) - (targetDirection.y * startDirection.x);
    const numeB = (direction.x * startDirection.y) - (direction.y * startDirection.x);

    if (denom === 0) {
      if (numeA === 0 && numeB === 0) {
        return intersection;
      }
      return intersection;
    }

    const time = numeA / denom;
    const targetTime = numeB / denom;

    if (time < 0 || time > 1 || targetTime < 0 || targetTime > 1) {
      return intersection;
    }

    // console.log('times', time, targetTime);
    // return {
    //   time,
    //   point: new Vector(start.x + (time * direction.x), start.y + (time * direction.y))
    // };

    intersection.intersects = true;
    intersection.point = start.add(direction.multiply(time));
    intersection.time = time;
    // console.log('point', point, direction.cross(intersection.point.subtract(targetStart)));
    intersection.normal = target.normal.normalize();
    // console.log('normal', intersection.normal, startDirection.dot(intersection.normal), intersection.normal.dot(startDirection), targetDirection.cross(startDirection));
    if (startDirection.dot(intersection.normal) < 0) {
      intersection.normal.negate(true);
    }
    // intersection.normal = startDirection.dot(intersection.normal) < 0
    //   ? new Vector(-intersection.normal.y, intersection.normal.x)
    //   : new Vector(intersection.normal.y, -intersection.normal.x);
    // intersection.normal = startDirection.dot(intersection.normal) < 0
    //   ? new Vector(-intersection.normal.y, intersection.normal.x)
    //   : new Vector(intersection.normal.y, -intersection.normal.x);
    // intersection.normal = targetDirection.cross(startDirection) < 0
    // ? new Vector(-intersection.normal.y, intersection.normal.x)
    // : new Vector(intersection.normal.y, -intersection.normal.x);
    intersection.tangent = direction.dot(targetDirection) > 0 ? targetDirection.normalize() : targetDirection.normalize().negate();

    return intersection;

    // // r × s
    // const r_s = direction.cross(targetDirection);
    // // (q − p) × r
    // const q_p_r = targetStart.subtract(start).cross(direction);

    // if (zeroish(r_s) && zeroish(q_p_r)) {
    //   // t0 = (q − p) · r / (r · r)
    //   // const t0 = dot(subtractPoints(q, p), r) / dot(r, r);

    //   // t1 = (q + s − p) · r / (r · r) = t0 + s · r / (r · r)
    //   // const t1 = t0 + dot(s, r) / dot(r, r);

    //   // NOTE(tp): For some reason (which I haven't spotted yet), the above t0 and hence t1 is wrong
    //   // So resorting to calculating it 'backwards'
    //   // const t1 = dot(addPoints(targetOrigin, subtractPoints(targetDirection, rayOrigin)), direction) / dot(direction, direction);
    //   // const t0 = t1 - dot(targetDirection, direction) / dot(direction, direction);
    //   const t1 = targetStart.add(targetDirection.subtract(start)).dot(direction) / direction.dot(direction);
    //   const t0 = t1 - targetDirection.dot(direction) / direction.dot(direction);

    //   if (t0 >= 0 && t0 <= 1 || t1 >= 0 && t1 <= 1) {
    //     intersection.intersects = true;
    //     intersection.time = t0;
    //     intersection.point = start.add(direction.multiply(intersection.time));
    //     intersection.tangent = targetDirection.normalize();
    //     intersection.normal = new Vector(-intersection.tangent.y, intersection.tangent.x);
    //     console.log('Line intersection colinear', intersection);
    //     return intersection;
    //     // return { type: 'colinear-overlapping', ls0t0: t0, ls0t1: t1 };
    //   }

    //   return intersection;
    //   // return { type: 'colinear-disjoint' };
    // }

    // if (zeroish(r_s) && !zeroish(q_p_r)) {
    //   return intersection;
    //   // return { type: 'parallel-non-intersecting' };
    // }

    // // t = (q − p) × s / (r × s)
    // // const t = cross(subtractPoints(targetOrigin, rayOrigin), targetDirection) / cross(direction, targetDirection);
    // const t = targetStart.subtract(start).cross(targetDirection) / direction.cross(targetDirection);

    // // u = (q − p) × r / (r × s)
    // // const u = cross(subtractPoints(targetOrigin, rayOrigin), direction) / cross(direction, targetDirection);
    // const u = targetStart.subtract(start).cross(direction) / direction.cross(targetDirection);

    // if (!zeroish(r_s) && t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    //   intersection.intersects = true;
    //   intersection.time = t;
    //   intersection.point = start.add(direction.multiply(intersection.time));
    //   intersection.tangent = targetDirection.normalize();
    //   intersection.normal = new Vector(-intersection.tangent.y, intersection.tangent.x);
    //   console.log('Line intersection', intersection);
    //   return intersection;
    //   // return { type: 'intersection', ls0t: t, ls1u: u };
    // }

    // return intersection;
    // // return { type: 'no-intersection' };
  }

  public clone(): Ray {
    return new Ray(this.origin.clone(), this.normalizedDirection.clone(), this.magnitude);
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

const epsilon = 1 / 1000000;
function zeroish(x: number) {
  return Math.abs(x) < epsilon;
}

//////////////////////////////

export function checkIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  console.log(x1, y1, '->', x2, y2, 'vs', x3, y3, '->', x4, y4);

  const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
  const numeA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
  const numeB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));

  if (denom === 0) {
    if (numeA === 0 && numeB === 0) {
      return null;
    }
    return null;
  }

  const uA = numeA / denom;
  const uB = numeB / denom;

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return {
      x: x1 + (uA * (x2 - x1)),
      y: y1 + (uA * (y2 - y1))
    };
  }

  return null;
}

