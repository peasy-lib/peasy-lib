export interface IVector extends Omit<Vector, 'z'> {
  z?: number;
}

export class Vector {
  public x: number;
  public y: number;
  public z: number;

  public constructor(
    x: number | number[] | Vector | string = 0,
    y = 0,
    z = 0,
  ) {
    if (typeof x === 'string' && x.includes(',')) {
      x = x.split(',').map(s => +s);
    }
    if (x instanceof Vector) {
      y = x.y;
      z = x.z;
      x = x.x;
    } else if (Array.isArray(x)) {
      y = x[1];
      z = x[2] ?? 0;
      x = x[0];
    } else if (typeof x !== 'number' && typeof x !== 'string' && 'x' in x && 'y' in x) {
      y = (x as any).y;
      z = (x as any).z;
      x = (x as any).x;
    }
    this.x = x as number;
    this.y = y;
    this.z = z;
  }

  public get zero(): boolean {
    return this instanceof Vector3
      ? Math.abs(this.x) === 0 && Math.abs(this.y) === 0 && Math.abs(this.z) === 0
      : Math.abs(this.x) === 0 && Math.abs(this.y) === 0;

  }

  public get magnitude(): number {
    return this instanceof Vector3
      ? Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
      : Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public get half(): Vector {
    return this.multiply(0.5);
  }

  public get negHalf(): Vector {
    return this.multiply(-0.5);
  }

  public equals(vector: Vector): boolean {
    if (this.x !== vector.x || this.y !== vector.y || this.z !== vector.z) {
      return false;
    }
    return true;
  }

  public add(delta: Vector | number[], update = false): Vector {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta[0], delta[1], delta[2]);
    vector.x += deltaVector.x;
    vector.y += deltaVector.y;
    if (this instanceof Vector3) {
      vector.z += deltaVector.z;
    }
    return vector;
  }
  public subtract(delta: Vector | number[], update = false): Vector {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta[0], delta[1], delta[2]);
    vector.x -= deltaVector.x;
    vector.y -= deltaVector.y;
    if (this instanceof Vector3) {
      vector.z -= deltaVector.z;
    }
    return vector;
  }
  public multiply(delta: number | Vector, update = false): Vector {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta, delta, delta);
    vector.x *= deltaVector.x;
    vector.y *= deltaVector.y;
    if (this instanceof Vector3) {
      vector.z *= deltaVector.z;
    }
    return vector;
  }
  public divide(delta: number | Vector, update = false): Vector {
    const vector = update ? this : this.clone();
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta, delta, delta);
    vector.x /= deltaVector.x;
    vector.y /= deltaVector.y;
    if (this instanceof Vector3) {
      vector.z /= deltaVector.z;
    }
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

  public sign(update = false): Vector {
    const vector = update ? this : this.clone();
    vector.x = Math.sign(vector.x);
    vector.y = Math.sign(vector.y);
    if (this instanceof Vector3) {
      vector.z = Math.sign(vector.z);
    }
    return vector;
  }

  public clamp(min: Vector, max: Vector, update = false): Vector {
    const vector = update ? this : this.clone();
    vector.x = Math.max(min.x, Math.min(vector.x, max.x));
    vector.y = Math.max(min.y, Math.min(vector.y, max.y));
    if (this instanceof Vector3) {
      vector.z = Math.max(min.z, Math.min(vector.z, max.z));
    }
    return vector;
  }

  public floor(update = false): Vector {
    const vector = update ? this : this.clone();
    vector.x = Math.floor(vector.x);
    vector.y = Math.floor(vector.y);
    if (this instanceof Vector3) {
      vector.z = Math.floor(vector.z);
    }
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

  public clone(): Vector | Vector3 {
    return this instanceof Vector3
      ? new Vector3(this.x, this.y, this.z)
      : new Vector(this.x, this.y, this.z);
  }

  public toArray(): number[] {
    return this instanceof Vector3
      ? [this.x, this.y, this.z]
      : [this.x, this.y]
  }

  public toString(): string {
    return this instanceof Vector3
      ? `${this.x},${this.y},${this.z}`
      : `${this.x},${this.y}`;
  }

  public toVector2(): Vector {
    return this instanceof Vector3
      ? new Vector(this.x, this.y, this.z)
      : this;
  }
  public toVector3(): Vector3 {
    return !(this instanceof Vector3)
      ? new Vector3(this.x, this.y, this.z)
      : this;
  }
}

export class Vector3 extends Vector { }

