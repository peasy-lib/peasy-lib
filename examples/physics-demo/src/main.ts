import { Circle, Line, Physics, Polygon, Ray, Rect, RoundedRect, Stadium, Vector, Intersection, Point, Entity as PhysicsEntity } from '@peasy-lib/peasy-physics';
import { UI } from '@peasy-lib/peasy-ui';
import 'styles.css';
import { Canvas } from './canvas';
import { Entity } from './entity';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

let viewportPosition = null;
let mouse = null;

// let toggle = false;
document.addEventListener('mousemove', (ev) => {
  // console.log(ev);
  // if (!move) {
  //   return;
  // }
  mouse = new Vector(ev.clientX, ev.clientY);
  mouse.subtract(viewportPosition ?? new Vector(), true);
  if (model.balls.length > 0) {
    const player = model.balls[0];
    // player.position = mouse;
    player.velocity = new Vector();
    player.move(mouse);
  }
});
document.addEventListener('click', (ev) => {
  canvas.logging = !canvas.logging;
  ray.origin = mouse;
});


let canvas;
const polygons = [];
let ray;
let shapes = [];
const balls = 2;
const model = {
  running: true,
  balls: [] as any[],
  canvas: null,
};
async function main(): Promise<void> {
  for (let i = 0; i < balls; i++) {
    const rect = true; // random(0, 1) < 0.5;
    const radius = i === 0 ? 20 : 20;//random(10, 30);
    const orientation = 0; //i * 30; //random(0, 360);
    const color = `${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}`;
    const offset = new Vector(); // new Vector(radius, radius); // new Vector(random(-10, 10), random(-10, 10));
    const ball = {
      rect,
      position: { x: randomInt(50, 350), y: randomInt(50, 350) },
      orientation,
      // velocity: { x: random(-300, 300), y: random(-300, 300) },
      color,
      forces: [{
        name: 'movement',
        direction: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
        maxMagnitude: 0.000001, //random(0, 200),
        duration: 0,
      }],
      shapes: [rect ? { size: [radius * 2, radius * 2], position: offset, orientation: 0 } : { radius, position: offset }],
      get borderRadius() { return rect ? '0' : '50%'; },
    };
    // model.balls.push(ball);

    // const force = Force.create({
    //   name: 'movement',
    //   direction: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
    //   max: random(0, 300),
    //   duration: 0,
    // });
    // Physics.addForce(force, ball);
  }

  UI.create(document.body, `
    <div class="main">
      <div><label>Run: <input type="checkbox" \${checked <=> running}></label></div>
      <div class="border">
        <div class="ball" \${ball <=* balls} style="
          translate: \${ball.position.x}px \${ball.position.y}px;
          transform-origin: 0px 0px;
          transform: rotate(\${ball.entity.orientation}deg);
        ">
          <div class="shape" \${shape <=* ball.shapes} style="
            left: \${shape.shape.left}px; top: \${shape.shape.top}px;
            width: \${shape.shape.size.x}px; height: \${shape.shape.size.y}px;
            background-color: #\${|ball.color}77;
            border-radius: \${$parent.ball.entity.borderRadius};
            rotate: \${shape.shape.orientation}deg;
          "></div>
          <div class="position"></div>
        </div>
      </div>
      <canvas \${ ==> canvas } width="1100" height="1100"></canvas>
   </div>
   `, model);

  // Physics.addForce({
  //   name: 'gravity',
  //   direction: { x: 0, y: 1 },
  //   maxMagnitude: 1000,
  //   acceleration: 200,
  //   duration: 0,
  // });

  canvas = new Canvas(model.canvas);
  Physics.initialize();
  console.log(Physics.collisions);

  model.balls = Physics.addEntities(model.balls);

  let vertices = [];
  for (let i = 0; i < 3; i++) {
    vertices.push(new Vector(random(-100, 100), random(-100, 100)));
  }
  polygons.push(new Polygon(new Vector(), vertices, 0).translate(new Vector(100, 100)));

  vertices = [
    new Vector(-50, -50),
    new Vector(50, -50),
    new Vector(50, 50),
    new Vector(-50, 50),
  ];
  polygons.push(new Polygon(new Vector(), vertices, 0).translate(new Vector(300, 100)));

  ray = new Ray(new Vector(200, 200), new Vector(1, 0), 100);
  console.log(ray);

  // setupCombinations();
  // setupMoveTo();
  setupEntities();

  requestAnimationFrame(start);
}

let last;
function start(now: number) {
  last = now;
  requestAnimationFrame(update);
}

function update(now: number) {
  const deltaTime = (now - last) / 1000;
  last = now;

  if (viewportPosition == null) {
    const viewport = document.querySelector('.border') as HTMLElement;
    if (viewport != null) {
      const rect = viewport.getBoundingClientRect();
      viewportPosition = new Vector(rect.x + 2, rect.y + 2);
    }
  }

  if (model.running) {
    updateEntities();
    Physics.update(deltaTime, now);
    canvas.update(model.balls);

    // polygons.forEach(polygon => canvas.drawShape(polygon, 'orange'));

    if (mouse != null) {
      ray.end = mouse;
    }
    canvas.drawShape(ray, 'purple');

    // updateCombinations();
    // updateMoveTo();
    showEntities();

  }
  UI.update();
  requestAnimationFrame(update);
}

function setupCombinations() {
  const inputs = [
    new Circle(new Vector(0, 0), 25),
    new Rect(new Vector(0, 0), new Vector(25, 50)),
    new Rect(new Vector(0, 0), new Vector(50, 25)),
    new Stadium(new Vector(0, 0), new Vector(25, 50), 'vertical'),
    new Stadium(new Vector(0, 0), new Vector(50, 25), 'horizontal'),
  ];
  let index = 0;
  for (let a of inputs) {
    for (let b of inputs) {
      a = a.clone();
      b = b.clone();
      const x = 50 + ((index % 3) * 350);
      const y = 75 + (Math.floor(index / 3) * 120);
      a.position = new Vector(x, y);
      b.position = new Vector(x + 100, y);
      const swept = a.getSweptShape(b);
      swept.position.add(new Vector(100, 0), true);

      shapes.push(a, b, swept);
      index++;
    }
  }
  /*
    let swept: (Circle | Rect | Stadium | RoundedRect)[];
    const circle1 = new Circle(new Vector(100, 75), 25);
    shapes.push(circle1);
    const circle2 = new Circle(new Vector(200, 75), 25);
    shapes.push(circle2);
    swept = circle1.getSweptShapes(circle2);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    const rect1 = new Rect(new Vector(100, 200), new Vector(25, 50));
    shapes.push(rect1);
    const rect2 = new Rect(new Vector(200, 200), new Vector(50, 25));
    shapes.push(rect2);
    swept = rect1.getSweptShapes(rect2);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    const circle3 = new Circle(new Vector(100, 300), 20);
    shapes.push(circle3);
    const rect3 = new Rect(new Vector(200, 300), new Vector(50, 25));
    shapes.push(rect3);
    swept = circle3.getSweptShapes(rect3);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    const circle4 = new Circle(new Vector(100, 400), 20);
    shapes.push(circle4);
    const stadium1 = new Stadium(new Vector(200, 400), new Vector(25, 10));
    shapes.push(stadium1);
    swept = circle4.getSweptShapes(stadium1);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    const circle5 = new Circle(new Vector(100, 500), 20);
    shapes.push(circle5);
    const stadium2 = new Stadium(new Vector(200, 500), new Vector(10, 25));
    shapes.push(stadium2);
    swept = circle5.getSweptShapes(stadium2);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    const rect4 = new Rect(new Vector(100, 600), new Vector(40, 40));
    shapes.push(rect4);
    const stadium7 = new Stadium(new Vector(200, 600), new Vector(10, 25));
    shapes.push(stadium7);
    swept = rect4.getSweptShapes(stadium7);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    const stadium3 = new Stadium(new Vector(100, 700), new Vector(25, 10));
    shapes.push(stadium3);
    const stadium4 = new Stadium(new Vector(200, 700), new Vector(10, 25));
    shapes.push(stadium4);
    swept = stadium3.getSweptShapes(stadium4);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    const stadium5 = new Stadium(new Vector(100, 800), new Vector(25, 10));
    shapes.push(stadium5);
    const stadium6 = new Stadium(new Vector(200, 800), new Vector(25, 10));
    shapes.push(stadium6);
    swept = stadium5.getSweptShapes(stadium6);
    swept.forEach(s => s.position.add(new Vector(100, 0), true));
    shapes.push(...swept);

    // shapes.push(new Rect(new Vector(100, 100), new Vector(50, 50)));
    // shapes.push(new Rect(new Vector(200, 300), new Vector(75, 50)));
    // shapes.push(new Circle(new Vector(300, 150), 50));
    // shapes.push(new Circle(new Vector(100, 300), 50));
    // shapes.push(new Stadium(new Vector(200, 75), new Vector(75, 50)));
    // shapes.push(new Stadium(new Vector(350, 350), new Vector(45, 50)));

    // const merged = shapes[2].getSweptShapes(shapes[1]);
    // merged.forEach(m => m.position.add(new Vector(-100, -100), true));
    // shapes.push(...merged);
  */
}

function updateCombinations() {
  let firstIntersection = new Intersection();
  shapes.forEach(shape => {
    const intersection = ray.getIntersection(shape);
    if (intersection.intersects) {
      // console.log(intersection.time);
      canvas.drawShape(shape, 'red');
      if (intersection.time < firstIntersection.time) {
        firstIntersection = intersection;
      }
    } else {
      canvas.drawShape(shape, 'purple');
    }
    const point = new Point(ray.end ?? new Vector());
    if (point.within(shape)) {
      canvas.drawShape(shape, 'green');
    }
  });
  if (firstIntersection.intersects) {
    canvas.drawShape(new Circle(firstIntersection.point, 10), 'red');
    canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.normal.multiply(15))), 'red');
    canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.tangent.multiply(15))), 'black');

    if (Array.isArray(firstIntersection.shapes)) {
      firstIntersection.shapes.forEach(shape => canvas.drawShape(shape, 'red'));
    }
  }
}

let currentShape;
function setupMoveTo() {
  for (let i = 0; i < 10; i++) {
    let shape;
    switch (randomInt(1, 4)) {
      case 1:
        shape = new Circle(new Vector(random(100, 800), random(100, 800)), 50);
        break;
      case 2:
        shape = new Rect(new Vector(random(100, 800), random(100, 800)), new Vector(random(10, 100), random(10, 100)));
        break;
      case 3: {
        const alignment = random(0, 1) < 0.5 ? 'horizontal' : 'vertical';
        const size = new Vector(random(10, 100), random(10, 100));
        if (alignment === 'horizontal') {
          size.x = Math.max(size.x, size.y * 2);
        } else {
          size.y = Math.max(size.y, size.x * 2);
        }
        shape = new Stadium(new Vector(random(100, 800), random(100, 800)), size, alignment);
        break;
      }
    }
    if (!shapes.some(s => s.overlaps(shape))) {
      shapes.push(shape);
    } else {
      i--;
    }
  }
  currentShape = shapes[0];
}

function updateMoveTo() {
  if (currentShape.position.x !== ray.origin.x || currentShape.position.y !== ray.origin.y) {
    const movement = new Ray(currentShape.position, ray.origin.subtract(currentShape.position));

    let firstIntersection = new Intersection();
    shapes.forEach(shape => {
      if (shape === currentShape) {
        return;
      }
      const swept = currentShape.getSweptShape(shape);
      canvas.drawShape(swept, 'green');
      const intersection = movement.getIntersection(swept);
      if (intersection.intersects) {
        canvas.drawShape(shape, 'red');
        if (intersection.time < firstIntersection.time) {
          firstIntersection = intersection;
        }
      } else {
        canvas.drawShape(shape, 'purple');
      }
    });
    if (firstIntersection.intersects) {
      canvas.drawShape(new Circle(firstIntersection.point, 10), 'red');
      canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.normal.multiply(15))), 'red');
      canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.tangent.multiply(15))), 'black');

      if (Array.isArray(firstIntersection.shapes)) {
        firstIntersection.shapes.forEach(shape => canvas.drawShape(shape, 'red'));
      }
      currentShape.position = currentShape.position.add(movement.directionVector.multiply(movement.magnitude * firstIntersection.time));
      ray.origin = currentShape.position.clone();
    } else {
      currentShape.position = currentShape.position.add(movement.directionVector.multiply(movement.magnitude));
    }
  }

  let firstIntersection = new Intersection();
  shapes.forEach(shape => {
    if (shape === currentShape) {
      canvas.drawShape(shape, 'purple');
      return;
    }
    const intersection = ray.getIntersection(shape);
    if (!intersection.intersects) {
      canvas.drawShape(shape, 'purple');
      return;
    }

    // console.log(intersection.time);
    canvas.drawShape(shape, 'red');
    if (intersection.time < firstIntersection.time) {
      firstIntersection = intersection;
    }
  });
  if (firstIntersection.intersects) {
    canvas.drawShape(new Circle(firstIntersection.point, 10), 'red');
    canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.normal.multiply(15))), 'red');
    canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.tangent.multiply(15))), 'black');

    if (Array.isArray(firstIntersection.shapes)) {
      firstIntersection.shapes.forEach(shape => canvas.drawShape(shape, 'red'));
    }
  }
}

const entities = [];
let currentEntity;
function setupEntities() {
  for (let i = 0; i < 50; i++) {
    const shape = {
      position: { x: 0, y: 0 },
      radius: undefined,
      size: undefined,
      alignment: undefined,
    };
    switch (randomInt(1, 4)) {
      case 1:
        shape.radius = random(25, 50);
        // shape = new Circle(new Vector(), random(25, 50));
        break;
      case 2:
        shape.size = new Vector(random(10, 100), random(10, 100));
        // shape = new Rect(new Vector(), new Vector(random(10, 100), random(10, 100)));
        break;
      case 3: {
        const alignment = random(0, 1) < 0.5 ? 'horizontal' : 'vertical';
        const size = new Vector(random(10, 100), random(10, 100));
        if (alignment === 'horizontal') {
          size.x = Math.max(size.x, size.y * 2);
        } else {
          size.y = Math.max(size.y, size.x * 2);
        }
        shape.size = size;
        shape.alignment = alignment;
        // shape = new Stadium(new Vector(), size, alignment);
        break;
      }
    }

    // shapes: [rect ? { size: [radius * 2, radius * 2], position: offset, orientation: 0 } : { radius, position: offset }],

    let entity = new Entity(new Vector(random(100, 800), random(100, 800)));
    entity.color = `#${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}`;

    entity.shapes = [shape];
    entity.forces = [{
      name: 'movement',
      direction: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
      maxMagnitude: random(0, 300),
      duration: 0,
    }];
    entity = Physics.addEntities(entity)[0];

    if (!entities.some(e => e.shapes[0].worldShape.shape.overlaps(entity.shapes[0].worldShape.shape))) {
      entities.push(entity);
    } else {
      Physics.removeEntities(entity as PhysicsEntity);
      i--;
    }
  }
  currentEntity = entities[0];
}

function updateEntities() {
  if (currentEntity.position.x !== ray.origin.x || currentEntity.position.y !== ray.origin.y) {
    const movement = new Ray(currentEntity.position, ray.origin.subtract(currentEntity.position));

    currentEntity.addForce({
      name: 'movement',
      direction: movement.directionVector,
      maxMagnitude: movement.magnitude,
      duration: 0,
    });

    // let firstIntersection = new Intersection();
    // entities.forEach(entity => {
    //   if (entity === currentEntity) {
    //     return;
    //   }
    //   const currentShape = currentEntity.shapes[0].worldShape.shape;
    //   const entityShape = entity.shapes[0].worldShape.shape;
    //   const swept = currentShape.getSweptShape(entityShape);
    //   canvas.drawShape(swept, 'green');
    //   const intersection = movement.getIntersection(swept);
    //   if (intersection.intersects) {
    //     canvas.drawShape(entityShape, 'red');
    //     if (intersection.time < firstIntersection.time) {
    //       firstIntersection = intersection;
    //     }
    //   } else {
    //     canvas.drawShape(entityShape, 'purple');
    //   }
    // });
    // if (firstIntersection.intersects) {
    //   canvas.drawShape(new Circle(firstIntersection.point, 10), 'red');
    //   canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.normal.multiply(15))), 'red');
    //   canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.tangent.multiply(15))), 'black');

    //   if (Array.isArray(firstIntersection.shapes)) {
    //     firstIntersection.shapes.forEach(shape => canvas.drawShape(shape, 'red'));
    //   }

    //   currentEntity.position = currentEntity.position.add(movement.directionVector.multiply(movement.magnitude * firstIntersection.time));
    //   ray.origin = currentEntity.position.clone();
    // } else {
    //   currentEntity.position = currentEntity.position.add(movement.directionVector.multiply(movement.magnitude));
    // }
  }

  // let firstIntersection = new Intersection();
  // entities.forEach(entity => {
  //   const entityShape = entity.shapes[0].worldShape.shape;
  //   if (entity === currentEntity) {
  //     canvas.drawShape(entityShape, 'purple');
  //     return;
  //   }
  //   const intersection = ray.getIntersection(entityShape);
  //   if (!intersection.intersects) {
  //     canvas.drawShape(entityShape, 'purple');
  //     return;
  //   }

  //   // console.log(intersection.time);
  //   canvas.drawShape(entityShape, 'red');
  //   if (intersection.time < firstIntersection.time) {
  //     firstIntersection = intersection;
  //   }
  // });
  // if (firstIntersection.intersects) {
  //   canvas.drawShape(new Circle(firstIntersection.point, 10), 'red');
  //   canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.normal.multiply(15))), 'red');
  //   canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.tangent.multiply(15))), 'black');

  //   if (Array.isArray(firstIntersection.shapes)) {
  //     firstIntersection.shapes.forEach(shape => canvas.drawShape(shape, 'red'));
  //   }
  // }
}

function showEntities() {
  if (currentEntity.position.x !== ray.origin.x || currentEntity.position.y !== ray.origin.y) {
    ray.origin = currentEntity.position.clone();
  }

  let firstIntersection = new Intersection();
  entities.forEach(entity => {
    const entityShape = entity.shapes[0].worldShape.shape;
    if (entity === currentEntity) {
      canvas.drawShape(entityShape, 'blue', entity.color);
      return;
    }
    const intersection = ray.getIntersection(entityShape);
    if (!intersection.intersects) {
      canvas.drawShape(entityShape, 'black', entity.color);
      return;
    }

    // console.log(intersection.time);
    canvas.drawShape(entityShape, 'red', entity.color);
    if (intersection.time < firstIntersection.time) {
      firstIntersection = intersection;
    }
  });
  if (firstIntersection.intersects) {
    canvas.drawShape(new Circle(firstIntersection.point, 10), 'red');
    canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.normal.multiply(15))), 'red');
    canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.tangent.multiply(15))), 'black');

    if (Array.isArray(firstIntersection.shapes)) {
      firstIntersection.shapes.forEach(shape => canvas.drawShape(shape, 'red'));
    }
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(random(min, max));
}

function minkowskiSum(a: Polygon, b: Polygon): Polygon {
  let min = Infinity;
  let aStart = -1;
  for (let i = 0; i < a.vertices.length; i++) {
    if (a.vertices[i].y < min) {
      min = a.vertices[i].y;
      aStart = i;
    }
  }
  min = Infinity;
  let bStart = -1;
  for (let i = 0; i < b.vertices.length; i++) {
    if (b.vertices[i].y < min) {
      min = b.vertices[i].y;
      bStart = i;
    }
  }
  let aIndex = aStart;
  let bIndex = bStart;
  let aDone = 0;
  let bDone = 0;
  while (aDone < a.vertices.length || bDone < b.vertices.length) {
    if (aDone < a.vertices.length) {

      aDone++;
      aIndex = (aIndex - 1 + a.vertices.length) % a.vertices.length;
    }
    if (bDone < b.vertices.length) {
      bDone++;
      bIndex = (bIndex - 1 + b.vertices.length) % b.vertices.length;
    }
  }
  const polygon = new Polygon(new Vector(), [], 0);
  return polygon;
}

function previousIndex(current: number, vertices: Vector[]): number {
  return (current - 1 + vertices.length) % vertices.length;
}
