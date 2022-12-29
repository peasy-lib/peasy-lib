import { Circle, Line, Physics, Polygon, Ray, Rect, RoundedRect, Stadium, Vector, Intersection, Point, Entity as PhysicsEntity, Force } from '@peasy-lib/peasy-physics';
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
  Physics.initialize({
    ctx: model.canvas.getContext('2d'),
    showAreas: false,
    // resolver: 'spatial-hash-grid',
  });

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
let startTime;
let updateTime = 0;
let updateTotal = 0;
let updateCount = 0;
let checkUpdate = false;
function start(now: number) {
  last = now;
  startTime = now;
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
    const updateStart = performance.now();
    const stats = Physics.update(deltaTime, now);
    const updateEnd = performance.now();
    if (stats.time !== -1 && checkUpdate) {
      updateTime = updateEnd - updateStart;
      updateTotal += updateTime;
      updateCount++;
    } else if (!checkUpdate) {
      if (now - startTime > 20000) {
        console.log('Starting update checks');
        checkUpdate = true;
      }
    }
    // canvas.update(model.balls);

    // polygons.forEach(polygon => canvas.drawShape(polygon, 'orange'));

    if (mouse != null) {
      ray.end = mouse;
    }
    Physics.canvas?.drawShape(ray, 'purple');

    // updateCombinations();
    // updateMoveTo();
    showEntities(stats);

    Physics.canvas.drawText(`Time per update: ~${round(updateTotal / updateCount)} - ${round(updateTime)}`, new Vector(300, 25), 'black');
    Physics.canvas.drawText(`Points: circles: ${points.circles}, rectangles: ${points.rectangles}`, new Vector(500, 25), 'black');
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
      // TODO: Need to fix this!
      // a.vertices = new Vector(x, y);
      // b.vertices = new Vector(x + 100, y);
      const swept = a.getSweptShape(b);
      // swept._vertices.add(new Vector(100, 0), true);

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
const entityAmount = 50;
const points = {
  circles: 0,
  rectangles: 0,
};
function setupEntities() {
  Physics.addForce(Force.Drag({ density: 1, coefficient: 0.01 }));
  Physics.addForce(Force.Gravity({ G: 50 }));

  // Physics.addForce({
  //   name: 'drag',
  //   callback: (force: Force, entity: Entity): Vector => function (force, entity, a, b) {
  //     console.log('FORCE', force.name, entity, a, b);
  //     return new Vector();
  //   }(force, entity, 123, 456)
  // });
  // Physics.addForce({
  //   name: 'gravity',
  //   direction: { x: 0, y: 1 },
  //   maxMagnitude: 1000,
  //   acceleration: 200,
  //   duration: 0,
  // });


  const sizeFactor = entityAmount > 50 ? entityAmount / 100 : 1;
  for (let i = 0; i < entityAmount; i++) {
    const shape = {
      position: { x: 0, y: 0 },
      radius: undefined,
      size: undefined,
      alignment: undefined,
    };
    switch (randomInt(1, 4)) {
      case 1:
        shape.radius = random(25 / sizeFactor, 50 / sizeFactor);
        // shape = new Circle(new Vector(), random(25, 50));
        break;
      case 2:
        shape.size = new Vector(random(10 / sizeFactor, 100 / sizeFactor), random(10 / sizeFactor, 100 / sizeFactor));
        // shape = new Rect(new Vector(), new Vector(random(10, 100), random(10, 100)));
        break;
      case 3: {
        const alignment = random(0, 1) < 0.5 ? 'horizontal' : 'vertical';
        const size = new Vector(random(10 / sizeFactor, 100 / sizeFactor), random(10 / sizeFactor, 100 / sizeFactor));
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

    let entity = new Entity(new Vector(random(1, 1100), random(1, 1100)));
    entity.color = `#${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}`;

    entity.shapes = [shape];
    entity.forces = [{
      name: 'movement',
      direction: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
      maxMagnitude: 600,
      // maxMagnitude: random(0, 300),
      duration: 0,
    }];
    entity.maxSpeed = 500;
    entity.colliding = function (entity: PhysicsEntity, intersection: Intersection) {
      if (this === intersection.mover) {
        return 'collide';
      }
      const thisShape = this.shapes[0].shape;
      const entityShape = entity.shapes[0].shape;
      if (
        (thisShape instanceof Circle && entityShape instanceof Rect) ||
        (thisShape instanceof Rect && entityShape instanceof Circle)
      ) {
        points[thisShape instanceof Circle ? 'circles' : 'rectangles']++;
        return 'remove';
      }
      return 'collide';
    }

    entity = Physics.addEntities(entity)[0];
    entity.mass = entity.shapes[0].shape.area * 2;
    if (randomInt(1, 5) === 1) {
      entity.mass = 0;
    }
    entities.push(entity);
    // if (!entities.some(e => e.shapes[0].worldShape.shape.overlaps(entity.shapes[0].worldShape.shape))) {
    //   entities.push(entity);
    // } else {
    //   Physics.removeEntities(entity as PhysicsEntity);
    //   i--;
    // }
  }
  currentEntity = entities[0];
  // currentEntity.mass = 1000000;
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

let statsTotal = {};
let dropped = 0;
let totalUpdates = 0;
let showRayCollision = false;
let showData = false;
function showEntities(stats) {

  if (currentEntity.position.x !== ray.origin.x || currentEntity.position.y !== ray.origin.y) {
    ray.origin = currentEntity.position.clone();
  }

  // let firstIntersection = new Intersection();
  // entities.forEach(entity => {
  //   const entityShape = entity.shapes[0].worldShape.shape;
  //   const movementRadius = Math.sqrt(entity.movementRadius);
  //   const movementBox = entity.movementBox;
  //   if (entity === currentEntity) {
  //     canvas.drawShape(entityShape, 'blue', entity.color);
  //     if (showData) {
  //       canvas.drawShape(new Circle(entity.position, movementRadius), 'red');
  //       canvas.drawShape(new Rect(entity.position, movementBox), 'red');
  //       canvas.drawText(Math.floor(entity.speed), entity.position.add([-5, 15]), 'black');
  //     }
  //     return;
  //   }
  //   if (showRayCollision) {
  //     const intersection = ray.getIntersection(entityShape);
  //     if (!intersection.intersects) {
  //       canvas.drawShape(entityShape, 'black', entity.color);
  //       if (showData) {
  //         canvas.drawShape(new Circle(entity.position, movementRadius), 'red');
  //         canvas.drawShape(new Rect(entity.position, movementBox), 'red');
  //         canvas.drawText(Math.floor(entity.speed), entity.position.add([-5, 15]), 'black');
  //       }
  //       return;
  //     }

  //     // console.log(intersection.time);
  //     canvas.drawShape(entityShape, 'red', entity.color);
  //     if (showData) {
  //       canvas.drawShape(new Circle(entity.position, movementRadius), 'red');
  //       canvas.drawShape(new Rect(entity.position, movementBox), 'red');
  //       canvas.drawText(Math.floor(entity.speed), entity.position.add([-5, 15]), 'black');
  //     } if (intersection.time < firstIntersection.time) {
  //       firstIntersection = intersection;
  //     }
  //   } else {
  //     canvas.drawShape(entityShape, 'black', entity.color);
  //     if (showData) {
  //       canvas.drawShape(new Circle(entity.position, movementRadius), 'red');
  //       canvas.drawShape(new Rect(entity.position, movementBox), 'red');
  //       canvas.drawText(Math.floor(entity.speed), entity.position.add([-5, 15]), 'black');
  //     }
  //     return;
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

  // Shouldn't really be in show, but will work for now
  for (const mover of Array.from(stats.moved) as Entity[]) {
    mover.position.add([1100, 1100], true).modulus(1100, true);
    // const shape = mover.shapes[0].worldShape.shape;
    // if (shape.position.x < 0) {
    //   mover.velocity.x = -mover.velocity.x;
    // } else if (shape.position.x > 1100) {
    //   mover.velocity.x = -mover.velocity.x;
    // }
    // if (shape.position.y < 0) {
    //   mover.velocity.y = -mover.velocity.y;
    // } else if (shape.position.y > 1100) {
    //   mover.velocity.y = -mover.velocity.y;
    // }
  }

  if (stats.time === -1) {
    dropped++;
  } else {
    totalUpdates++;
  }
  stats['DROPPED'] = dropped;

  const pos = new Vector(75, 75);
  const inc = 15;
  let i = 0;
  for (const stat in stats) {
    let value = stats[stat];
    if (value instanceof Set) {
      value = value.size;
    }
    statsTotal[stat] = (statsTotal[stat] ?? 0) + value;
    Physics.canvas.drawText(`${stat}: ~${round(statsTotal[stat] / totalUpdates)} - ${round(value)}`, pos.add([0, i++ * inc]), 'black');
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(random(min, max));
}
function round(value: number, decimals = 2) {
  const power = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * power) / power;
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
