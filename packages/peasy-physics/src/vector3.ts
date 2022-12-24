import { Vector } from './vector';

export interface IVector3 {
  x: number;
  y: number;
  z: number;
}

export class Vector3 {
  public constructor(
    public x = 0,
    public y = 0,
    public z = 0,
  ) { }

  public get zero(): boolean {
    return Math.abs(this.x) === 0 && Math.abs(this.y) === 0 && Math.abs(this.z) === 0;

  }

  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public get half(): Vector3 {
    return this.multiply(0.5);
  }

  public get negHalf(): Vector3 {
    return this.multiply(-0.5);
  }

  public static from(x: number | number[] | Vector3 | string | { x: number; y: number; z?: number } = 0, y = 0, z = 0): Vector3 {
    if (x instanceof Vector3) {
      y = x.y;
      z = x.z;
      x = x.x;
    } else if (Array.isArray(x)) {
      y = x[1];
      z = x[2];
      x = x[0];
    } else if (typeof x === 'string' && x.includes(',')) {
      [x, y, z] = x.split(',').map(s => +s);
    } else if (typeof x !== 'number' && typeof x !== 'string' && 'x' in x && 'y' in x && 'z' in x) {
      y = x.y;
      z = x.z!;
      x = x.x;
    }
    return new Vector3(x as number, y, z);
  }

  public equals(vector: Vector3): boolean {
    if (this.x !== vector.x || this.y !== vector.y || this.z !== vector.z) {
      return false;
    }
    return true;
  }

  public add(delta: Vector3 | number[], update = false): Vector3 {
    const vector = update ? this : this.clone();
    const { x, y, z } = Array.isArray(delta) ? { x: delta[0], y: delta[1], z: delta[2] } : delta;
    vector.x += x;
    vector.y += y;
    vector.z += z;
    return vector;
  }
  public subtract(delta: Vector3 | number[], update = false): Vector3 {
    const vector = update ? this : this.clone();
    const { x, y, z } = Array.isArray(delta) ? { x: delta[0], y: delta[1], z: delta[2] } : delta;
    vector.x -= x;
    vector.y -= y;
    vector.z -= z;
    return vector;
  }
  public multiply(delta: number | Vector3, update = false): Vector3 {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector3 ? delta : new Vector3(delta, delta, delta);
    vector.x *= deltaVector.x;
    vector.y *= deltaVector.y;
    vector.z *= deltaVector.z;
    return vector;
  }
  public divide(delta: number | Vector3, update = false): Vector3 {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector3 ? delta : new Vector(delta, delta, delta);
    vector.x /= deltaVector.x;
    vector.y /= deltaVector.y;
      vector.z /= deltaVector.z;
    return vector;
  }

  public modulus(delta: number | Vector3, update = false): Vector3 {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector3 ? delta : new Vector3(delta, delta, delta);
    vector.x %= deltaVector.x;
    vector.y %= deltaVector.y;
      vector.z %= deltaVector.z;
    return vector;
  }

  public normalize(update = false): Vector3 {
    const vector = update ? this : this.clone();
    const magnitude = this.magnitude;
    if (magnitude > 0) {
      vector.divide(magnitude, true);
    }
    return vector;
  }

  public dot(delta: Vector3): number {
    return (this.x * delta.x) + (this.y * delta.y) + (this.z * delta.z);
  }

  public sign(update = false): Vector3 {
    const vector = update ? this : this.clone();
    vector.x = Math.sign(vector.x);
    vector.y = Math.sign(vector.y);
      vector.z = Math.sign(vector.z);
    return vector;
  }

  public clamp(min: Vector3, max: Vector3, update = false): Vector3 {
    const vector = update ? this : this.clone();
    vector.x = Math.max(min.x, Math.min(vector.x, max.x));
    vector.y = Math.max(min.y, Math.min(vector.y, max.y));
      vector.z = Math.max(min.z, Math.min(vector.z, max.z));
    return vector;
  }

  public floor(update = false): Vector3 {
    const vector = update ? this : this.clone();
    vector.x = Math.floor(vector.x);
    vector.y = Math.floor(vector.y);
      vector.z = Math.floor(vector.z);
    return vector;
  }

  public rotate(degrees: number, update = false): Vector3 {
    const vector = update ? this : this.clone();
    const radians = degrees * (Math.PI / 180);
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    const { x, y } = vector;
    vector.x = x * cos - y * sin;
    vector.y = x * sin + y * cos;
    return vector;
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public toArray(): number[] {
    return [this.x, this.y, this.z];
  }

  public toString(): string {
    return `${this.x}, ${this.y},${this.z}`;
  }

  public toVector2(): Vector {
    return new Vector(this.x, this.y, this.z);
  }
}
