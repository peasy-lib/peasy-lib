import { Box } from '../box';
import { Canvas } from '../canvas';
import { Entity } from '../entity';
import { Vector } from '../vector';
import { Rect } from './rect';

export class GeometricShape {
  protected _vertices: Vector[] = [];
  protected _edgeNormals: Vector[] = [];
  protected _boundingBox: Rect | null = null;

  public constructor(
    protected _position: Vector, // position in relevant space
    protected _orientation: number = 0, // orientation within relevant space
    public space: Entity | 'world' | null = null, // null means shape space (no space)
  ) { }

  public get position(): Vector {
    return this._position;
  }
  public set position(value: Vector) {
    this._position = value;
    this._vertices = [];
    this._boundingBox = null;
  }

  public get orientation(): number {
    return this._orientation;
  }
  public set orientation(value: number) {
    this._orientation = value;
    this._vertices = [];
    this._edgeNormals = [];
    this._boundingBox = null;
  }

  public get boundingBox(): Box {
    const vertices = this.vertices;
    if (vertices.length === 0) {
      return new Box(new Vector(), new Vector());
    }

    const min = new Vector(vertices[0].x, vertices[0].y);
    const max = new Vector(vertices[0].x, vertices[0].y);
    for (let i = 1, ii = vertices.length; i < ii; i++) {
      const vertex = vertices[i];
      if (vertex.x < min.x) {
        min.x = vertex.x;
      }
      if (vertex.x > max.x) {
        max.x = vertex.x;
      }
      if (vertex.y < min.y) {
        min.y = vertex.y;
      }
      if (vertex.y > max.y) {
        max.y = vertex.y;
      }
    }
    return new Box(min, max);
  }

  // This should be overloaded by the shapes
  public get vertices(): Vector[] {
    return this._vertices;
  }

  public get edgeNormals(): Vector[] {
    if (this._edgeNormals.length === 0) {
      const vertices = this.vertices;
      for (let i = 0, ii = vertices.length; i < ii; i++) {
        this._edgeNormals[i] = vertices[(i + 1) % ii].subtract(vertices[i]).normalize().normal;
      }
    }
    return this._edgeNormals;
  }

  public rotate(degrees: number): void {
    const vertices = this.vertices;
    if (Math.abs(degrees) !== 0) {
      vertices.forEach(vertex => vertex.rotate(degrees, true));
      this._position.rotate(degrees, true);
      this._orientation += degrees;
      this._edgeNormals = [];
      this._boundingBox = null;
    }
    this._vertices = vertices;
  }

  public translate(position: Vector): void {
    const vertices = this.vertices;
    vertices.forEach(vertex => vertex.add(position, true));
    this._position.add(position, true);
    this._vertices = vertices;
    this._boundingBox = null;
  }

  public transform(degrees: number, position: Vector): void {
    this.rotate(degrees);
    this.translate(position);
  }

  public getMinMax(): { min: Vector; max: Vector } {
    const vertices = this.vertices;
    if (vertices.length === 0) {
      return { min: new Vector(), max: new Vector() };
    }

    const min = new Vector(vertices[0].x, vertices[0].y);
    const max = new Vector(vertices[0].x, vertices[0].y);
    for (let i = 1, ii = vertices.length; i < ii; i++) {
      const vertex = vertices[i];
      if (vertex.x < min.x) {
        min.x = vertex.x;
      }
      if (vertex.x > max.x) {
        max.x = vertex.x;
      }
      if (vertex.y < min.y) {
        min.y = vertex.y;
      }
      if (vertex.y > max.y) {
        max.y = vertex.y;
      }
    }
    return { min, max };
  }

  public resetVertices(): void {
    this._vertices = [];
  }
  public resetEdgeNormals(): void {
    this._edgeNormals = [];
  }
  public resetBoundingBox(): void {
    this._boundingBox = null;
  }

  public draw(canvas: Canvas, color: string = 'black', fillColor: 'gray') {
    canvas.drawShape(this.boundingBox, '#aaaaaa99');
    canvas.drawShape(this, color, fillColor);
  }
}
