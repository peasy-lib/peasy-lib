import { Vector3 } from './vector3';

export interface IVector {
  x: number;
  y: number;
  z?: number;
}

export class Vector {
  public static Zero = new Vector();

  public constructor(
    public x = 0,
    public y = 0,
    public z = 0,
  ) { }

  public get zero(): boolean {
    return Math.abs(this.x) === 0 && Math.abs(this.y) === 0;

  }

  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public get magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public get half(): Vector {
    return this.multiply(0.5);
  }

  public get negHalf(): Vector {
    return this.multiply(-0.5);
  }

  public get normal(): Vector {
    return new Vector(this.y, -this.x);
  }

  public static from(x: number | number[] | Vector | string | { x: number; y: number; z?: number } = 0, y = 0, z = 0): Vector {
    if (x instanceof Vector) {
      y = x.y;
      z = x.z;
      x = x.x;
    } else if (Array.isArray(x)) {
      y = x[1];
      z = x[2] ?? 0;
      x = x[0];
    } else if (typeof x === 'string' && x.includes(',')) {
      [x, y, z] = x.split(',').map(s => +s);
    } else if (typeof x !== 'number' && typeof x !== 'string' && 'x' in x && 'y' in x) {
      y = x.y;
      z = x.z!;
      x = x.x;
    }
    return new Vector(x as number, y, z);
  }

  public equals(vector: Vector): boolean {
    if (this.x !== vector.x || this.y !== vector.y || this.z !== vector.z) {
      return false;
    }
    return true;
  }

  public add(delta: Vector | number[], update = false): Vector {
    const vector = update ? this : this.clone();
    const { x, y, z } = Array.isArray(delta) ? { x: delta[0], y: delta[1], z: delta[2] } : delta;
    vector.x += x;
    vector.y += y;
    return vector;
  }
  public subtract(delta: Vector | number[], update = false): Vector {
    const vector = update ? this : this.clone();
    const { x, y, z } = Array.isArray(delta) ? { x: delta[0], y: delta[1], z: delta[2] } : delta;
    vector.x -= x;
    vector.y -= y;
    return vector;
  }
  public multiply(delta: number | Vector, update = false): Vector {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta, delta, delta);
    vector.x *= deltaVector.x;
    vector.y *= deltaVector.y;
    return vector;
  }
  public divide(delta: number | Vector, update = false): Vector {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta, delta, delta);
    vector.x /= deltaVector.x;
    vector.y /= deltaVector.y;
    return vector;
  }

  public negate(update = false): Vector {
    const vector = update ? this : this.clone();
    vector.x = -this.x;
    vector.y = -this.y;
    return vector;
  }

  public modulus(delta: number | Vector, update = false): Vector {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta, delta, delta);
    vector.x %= deltaVector.x;
    vector.y %= deltaVector.y;
    return vector;
  }

  public normalize(update = false): Vector {
    const vector = update ? this : this.clone();
    const magnitude = this.magnitude;
    if (magnitude > 0) {
      vector.divide(magnitude, true);
    }
    return vector;
  }

  public dot(delta: Vector): number {
    return (this.x * delta.x) + (this.y * delta.y);
  }

  public cross(delta: Vector): number {
    return (this.x * delta.x) - (this.y * delta.y);
  }

  public sign(update = false): Vector {
    const vector = update ? this : this.clone();
    vector.x = Math.sign(vector.x);
    vector.y = Math.sign(vector.y);
    return vector;
  }

  public clamp(min: Vector, max: Vector, update = false): Vector {
    const vector = update ? this : this.clone();
    vector.x = Math.max(min.x, Math.min(vector.x, max.x));
    vector.y = Math.max(min.y, Math.min(vector.y, max.y));
    return vector;
  }

  public floor(update = false): Vector {
    const vector = update ? this : this.clone();
    vector.x = Math.floor(vector.x);
    vector.y = Math.floor(vector.y);
    return vector;
  }

  public rotate(degrees: number, update = false): Vector {
    const vector = update ? this : this.clone();
    const radians = degrees * (Math.PI / 180);
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    const { x, y } = vector;
    vector.x = x * cos - y * sin;
    vector.y = x * sin + y * cos;
    return vector;
  }

  public clone(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

  public toArray(): number[] {
    return [this.x, this.y];
  }

  public toString(): string {
    return `${this.x}, ${this.y}`;
  }

  public toVector3(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }
}
