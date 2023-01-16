import { Circle } from './circle';
import { Rect } from './rect';
import { Stadium } from './stadium';
import { Vector } from "../vector";
import { GeometricShape } from './geometric-shape';
import { Box } from '../box';
import { Line } from './line';

export class ExpandedRect extends GeometricShape {
  public worldSpace = false;

  public constructor(
    position: Vector,
    public size: Vector,
    public expansion: Rect | Circle | Stadium,
    orientation: number = 0,
  ) {
    super(position, orientation);
  }

  public get half(): Vector {
    return this.size.half;
  }

  public get left(): number {
    return this.position.x - this.half.x;
  }
  public set left(value: number) {
    this.position.x = value + this.half.x;
  }
  public get right(): number {
    return this.position.x + this.half.x;
  }
  public set right(value: number) {
    this.position.x = value - this.half.x;
  }
  public get top(): number {
    return this.position.y - this.half.y;
  }
  public set top(value: number) {
    this.position.y = value + this.half.y;
  }
  public get bottom(): number {
    return this.position.y + this.half.y;
  }
  public set bottom(value: number) {
    this.position.y = value - this.half.y;
  }

  public get width(): number {
    return this.size.x;
  }
  public set width(value: number) {
    this.size.x = value;
  }
  public get height(): number {
    return this.size.y;
  }
  public set height(value: number) {
    this.size.y = value;
  }

  public get boundingBox(): Box {
    const box = this._orientation === 0 || this._orientation === 180
      ? new Box(new Vector(this.left, this.top), new Vector(this.right, this.bottom))
      : super.boundingBox;
    const expansionBox = this.expansion.boundingBox;
    const halfExpansionBox = expansionBox.size.half;
    box.min.subtract(halfExpansionBox, true);
    box.max.add(halfExpansionBox, true);
    return box;

    // const { min, max } = this.corner.boundingBox;
    // const edges = [
    //   new Vector(0, -1),
    //   new Vector(1, 0),
    //   new Vector(0, 1),
    //   new Vector(-1, 0),
    // ];

    // if (this.corner instanceof Stadium) {
    //   console.log('Stadium edges', this.corner.getEdgeVertices(edges));
    // }

    // return super.boundingBox;


    // const rotatedSize = max.subtract(min);
    // let leftCorner = new Vector(Infinity, -Infinity);
    // let topCorner = new Vector(-Infinity, Infinity);
    // for (const vertex of this.corner.vertices) {
    //   if (vertex.x < leftCorner.x) {
    //     leftCorner = vertex;
    //   }
    //   if (vertex.y < topCorner.y) {
    //     topCorner = vertex;
    //   }
    // }
    // const vertices = shape.vertices;

    // const top = new Rect(shape.position.clone(), shape.size.clone());
    // top.size.x -= rotatedSize.x;
    // // const shift = topCorner.x;
    // // console.log('shift', shape.corner.vertices, shift, rotatedSize, topCorner);
    // top.position.x -= topCorner.x; // shift;
    // top.size.y *= 0.5; // IF not even 90
    // top.position.y += top.size.y / 2; // IF not even 90
    // this.drawShape(top, 'blue', fillColor);

    // const bottom = new Rect(shape.position.clone(), shape.size.clone());
    // bottom.size.x -= rotatedSize.x;
    // // const shift = bottomCorner.x;
    // // console.log('shift', shape.corner.vertices, shift, rotatedSize, bottomCorner);
    // bottom.position.x += topCorner.x; // shift;
    // bottom.size.y *= 0.5; // IF not even 90
    // bottom.position.y -= bottom.size.y / 2; // IF not even 90
    // this.drawShape(bottom, 'blue', fillColor);

    // const left = new Rect(shape.position.clone(), shape.size.clone());
    // left.size.y -= rotatedSize.y;
    // left.position.y += leftCorner.y; // shift.y;
    // left.size.x *= 0.5; // IF not even 90
    // left.position.x -= left.size.x / 2; // IF not even 90
    // this.drawShape(left, 'green', fillColor);

    // const right = new Rect(shape.position.clone(), shape.size.clone());
    // right.size.y -= rotatedSize.y;
    // right.position.y -= leftCorner.y; // shift.y;
    // right.size.x *= 0.5; // IF not even 90
    // right.position.x += right.size.x / 2; // IF not even 90
    // this.drawShape(right, 'green', fillColor);

    // let corner = shape.corner.clone();
    // corner.position = shape.position.clone();
    // corner.position.x -= top.size.half.x;
    // corner.position.y -= left.size.half.y;
    // this.drawShape(corner, color, fillColor);

    // corner = shape.corner.clone();
    // corner.position = shape.position.clone();
    // corner.position.x += top.size.half.x;
    // corner.position.y -= left.size.half.y;
    // this.drawShape(corner, color, fillColor);

    // corner = shape.corner.clone();
    // corner.position = shape.position.clone();
    // corner.position.x += top.size.half.x;
    // corner.position.y += left.size.half.y;
    // this.drawShape(corner, color, fillColor);

    // corner = shape.corner.clone();
    // corner.position = shape.position.clone();
    // corner.position.x -= top.size.half.x;
    // corner.position.y += left.size.half.y;
    // this.drawShape(corner, color, fillColor);
  }

  public get shapes(): GeometricShape[] {
    const shapes = [];
    const vertices = this.vertices;
    const vertexCount = vertices.length;
    const expansions = [];
    const edgeNormals = this.edgeNormals;
    if (this.expansion instanceof Rect) {
      for (let i = 0; i < vertexCount; i++) {
        const expansion = this.expansion.clone();
        expansion.position = vertices[i].clone();
        expansions.push(expansion);
      }
      const lineVertices = [];
      for (let i = 0; i < vertexCount; i++) {
        lineVertices.push(
          expansions[i].getEdgesVertex([edgeNormals[i]])[0].vertex,
          expansions[(i + 1) % vertexCount].getEdgesVertex([edgeNormals[i]])[0].vertex,
        );
      }
      for (let i = 0, ii = lineVertices.length; i < ii; i++) {
        shapes.push(new Line(lineVertices[i], lineVertices[(i + 1) % ii]));
      }
    } else {
      for (let i = 0; i < vertexCount; i++) {
        const expansion = this.expansion.clone();
        expansion.position = vertices[i].clone();
        expansions.push(expansion);
        shapes.push(expansion);
      }
      for (let i = 0; i < vertexCount; i++) {
        const a = expansions[i].getEdgesVertex([edgeNormals[i]])[0].vertex;
        const b = expansions[(i + 1) % vertexCount].getEdgesVertex([edgeNormals[i]])[0].vertex;
        shapes.push(new Line(a, b));
        // for (let j = 0; j < vertexCount; j++) {
        //   expansions[j].getEdgesVertex(edgeNormals[i]);
        // }
        // const expansion = expansions[i];
        // expansion.position = vertices[i].clone();
        // shapes.push(new Line(vertices[i].clone(), vertices[(i + 1) % vertexCount].clone()));
      }
    }
    return shapes;
  }

  public get vertices(): Vector[] {
    if (this._vertices.length > 0) {
      return this._vertices;
    }
    this._vertices = [
      new Vector(-this.half.x, -this.half.y),
      new Vector(+this.half.x, -this.half.y),
      new Vector(+this.half.x, +this.half.y),
      new Vector(-this.half.x, +this.half.y),
    ];
    const position = this.position;
    const orientation = this.orientation;
    this._position = new Vector(0, 0);
    this._orientation = 0;
    this.transform(orientation, position);
    return this._vertices;
  }

  public equals(rect: ExpandedRect): boolean {
    if (!this.position.equals(rect.position) ||
      !this.size.equals(rect.size)
    ) {
      return false;
    }
    return true;
  }

  // public getSweptShapes(target: Rect | Circle | Stadium): (Rect | Circle | Stadium | ExpandedRect)[] {
  //   if (target instanceof Stadium) {
  //     return [];
  //   }
  //   if (target instanceof Rect) {
  //     const expanded = target.clone();
  //     expanded.size.add(this.size, true);
  //     return [expanded];
  //   }
  //   if (target instanceof Circle) {
  //     const expanded = target.getSweptShapes(this);
  //     expanded[0].position = this.position.clone();
  //     return expanded;
  //   }
  //   return [];
  // }

  public toString(): string {
    return `[${this.position}] (${this.size})`;
  }

  public clone(): ExpandedRect {
    return new ExpandedRect(this.position.clone(), this.size.clone(), this.expansion.clone(), this.orientation);
  }
}
