import { Lighting, Vector, Light } from '@peasy-lib/peasy-lighting';
import 'styles.css';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

let viewport;
let ship, ship2, asteroid;
let move = true;
let thrustors: Light | null = null;

async function main(): Promise<void> {

  document.body.insertAdjacentHTML('beforeend', `
    <div class="main">
      <div>Controlling: <span id="ship-color"></span></div>
      <div class="viewport border" style="background-color: black;">
      <div class="static-ship"></div>
      <div class="ship"></div>
      <div class="ship2"></div>
      <div class="asteroid"></div>
      </div>
   </div>
  `);

  // viewport = document.querySelector('.viewport') as HTMLElement;
  viewport = document.querySelector('.viewport') as HTMLElement;
  const rect = viewport.getBoundingClientRect();
  const viewportPosition = new Vector(rect.x, rect.y);

  let toggle = false;
  document.addEventListener('mousemove', (ev) => {
    console.log(ev);
    if (!move) {
      return;
    }
    const mouse = new Vector(ev.clientX, ev.clientY);
    lights[lightIndex].position = mouse.subtract(viewportPosition);
  });
  document.addEventListener('click', (ev) => {
    const shipColor = document.querySelector('#ship-color')!;
    if (!toggle) {
      toggle = true;
      move = false;
      shipColor.innerHTML = '-';
      return;
    }
    toggle = false;
    move = true;
    lightIndex = (lightIndex + 1) % lights.length;
    shipColor.innerHTML = lights[lightIndex].color as string;
  });
  document.addEventListener('contextmenu', (ev) => {
    if (!move) {
      return;
    }
    lights[lightIndex].zIndex += ev.shiftKey ? -1 : 1;
    ev.preventDefault();
  });

  Lighting.initialize(document.body);

  const lights = [] as Light[];
  lights.push(Lighting.addLight({
    id: 'white',
    position: new Vector(150, 150),
    radius: 250,
    color: 'white',
    viewport: viewport,
  }));
  lights.push(Lighting.addLight({
    id: 'red',
    position: new Vector(150, 150),
    radius: 250,
    zIndex: -1,
    color: 'red',
    viewport: viewport,
  }));
  lights.push(Lighting.addLight({
    id: 'green',
    position: new Vector(150, 150),
    radius: 250,
    color: 'green',
    viewport: viewport,
  }));

  let lightIndex = 0;

  ship = {
    element: document.querySelector('.ship') as HTMLElement,
    position: new Vector(200, 200),
    orientation: 0,
    moveToPosition() {
      ship.element.style.translate = `${ship.position.x - 32}px ${ship.position.y - 32}px`
      ship.element.style.rotate = `${ship.orientation}deg`;

      ship.entity.position = ship.position;
      ship.entity.orientation = ship.orientation;
      ship.entity.zIndex = ship.zIndex ?? 0;
    },
    entity: undefined as any,
  };
  ship2 = {
    element: document.querySelector('.ship2') as HTMLElement,
    position: new Vector(400, 250),
    orientation: 0,
    zIndex: 1,
    moveToPosition() {
      ship2.element.style.translate = `${ship2.position.x - 32}px ${ship2.position.y - 32}px`
      ship2.element.style.rotate = `${ship2.orientation}deg`;

      ship2.entity.position = ship2.position;
      ship2.entity.orientation = ship2.orientation;
      ship2.entity.zIndex = ship2.zIndex ?? 0;
    },
    entity: undefined as any,
  };

  asteroid = {
    element: document.querySelector('.asteroid') as HTMLElement,
    position: new Vector(100, 100),
    orientation: 0,
    moveToPosition() {
      asteroid.element.style.translate = `${asteroid.position.x - 64}px ${asteroid.position.y - 64}px`
      asteroid.element.style.rotate = `${asteroid.orientation}deg`;

      asteroid.entity.position = asteroid.position;
      asteroid.entity.orientation = asteroid.orientation;
      asteroid.entity.zIndex = asteroid.zIndex ?? 0;
    },
    entity: undefined as any,
  };

  ship.entity = Lighting.addEntities([{
    id: 'ship',
    position: ship.position,
    orientation: ship.orientation,
    size: new Vector(64, 64),
    normalMap: '/assets/mookie-ship-normal-map2.png',
  }])[0];
  ship.moveToPosition();

  ship2.entity = Lighting.addEntities([{
    id: 'ship2',
    position: ship2.position,
    orientation: ship2.orientation,
    size: new Vector(64, 64),
    normalMap: '/assets/mookie-ship-normal-map2.png',
  }])[0];
  ship2.moveToPosition();

  asteroid.entity = Lighting.addEntities([{
    id: 'asteroid',
    position: asteroid.position,
    orientation: asteroid.orientation,
    size: new Vector(128, 128),
    normalMap: '/assets/asteroid-normal-map.png',
  }])[0];
  asteroid.moveToPosition();

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

  // ship.orientation = (ship.orientation + 0.5) % 360;
  // ship.moveToPosition();

  // ship2.orientation = (ship2.orientation + 0.5) % 360;
  // ship2.moveToPosition();

  (document.querySelector('.static-ship') as HTMLElement).style.rotate = `${ship.orientation}deg`;

  // if (!move) {
  //   if (thrustors == null) {
  //     const r = 25;
  //     thrustors = Lighting.addLight({
  //       id: 'main',
  //       position: new Vector(200, 180),
  //       radius: r,
  //       color: [`orange ${r * 0.75}px`, `rgba(0, 0, 0, 0) ${r}px`],
  //       viewport: viewport,
  //     } as ILight);
  //   }
  //   const r = randomInt(15, 25);
  //   thrustors.radius = r;
  //   thrustors.color = [`orange ${r * 0.5}px`, `rgba(0, 0, 0, 0) ${r}px`];
  // } else {
  //   if (thrustors != null) {
  //     Lighting.removeLight(thrustors);
  //     thrustors = null;
  //   }
  // }

  Lighting.update();
  requestAnimationFrame(update);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(random(min, max));
}
