import { Lighting, Vector, Light, Viewport } from '@peasy-lib/peasy-lighting';
import 'styles.css';
import { Entity } from './entity';

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
      <div class="viewport border" style="
        /* background-color: black; */
        background-image: url(/assets/spacebg.jpg);
        image-rendering: pixelated;
      ">
        <div class="static-ship"></div>
        <div class="ship"></div>
        <div class="ship2"></div>
        <div class="asteroid"></div>

        <!--
        <div class="peasy-lighting" style="
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          mix-blend-mode: multiply;
          image-rendering: pixelated;
        ">
          <div class="peasy-lighting-mask" style="
            position: absolute;
            top: 0px;
            left: 0px;
            width: 100%;
            height: 100%;
            background-color: white;
            image-rendering: pixelated;
          "></div>
          <div class="peasy-lighting-vail" style="
            display: inline-block;
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            background-color: red;
            /* background-image: url(/assets/spacebg.jpg); */
            mix-blend-mode: screen;
            image-rendering: pixelated;
          "></div>
        </div>
        -->
      </div>
   </div>
  `);

  viewport = Viewport.create({
    element: document.querySelector('.viewport'),
    useMask: true,
  });
  const rect = viewport.element.getBoundingClientRect();
  const viewportPosition = new Vector(rect.x, rect.y);

  let toggle = false;
  document.addEventListener('mousemove', (ev) => {
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

  ship = new Entity({ x: 200, y: 200 }, { x: 64, y: 64 });
  ship.element = document.querySelector('.ship');

  ship2 = new Entity({ x: 400, y: 250 }, { x: 64, y: 64 }, 0, 1);
  ship2.element = document.querySelector('.ship2');

  asteroid = new Entity({ x: 100, y: 100 }, { x: 128, y: 128 });
  asteroid.element = document.querySelector('.asteroid');

  Lighting.addEntities([{
    entity: ship,
    normalMap: '/assets/mookie-ship-normal-map2.png',
  }]);
  ship.moveToPosition();

  Lighting.addEntities([{
    entity: ship2,
    normalMap: '/assets/mookie-ship-normal-map2.png',
  }]);
  ship2.moveToPosition();

  Lighting.addEntities([{
    entity: asteroid,
    normalMap: '/assets/asteroid2-normal-map.png',
  }]);
  asteroid.moveToPosition();

  requestAnimationFrame(start);
}

let last;
function start(now: number) {
  last = now;
  requestAnimationFrame(update);
}

let asteroidFrame = 0;
let frameRate = 1;
let frame = frameRate;
function update(now: number) {
  const deltaTime = (now - last) / 1000;
  last = now;

  ship.orientation = (ship.orientation + 0.5) % 360;
  ship.moveToPosition();

  ship2.orientation = (ship2.orientation + 0.5) % 360;
  ship2.moveToPosition();

  if (--frame === 0) {
    frame = frameRate;
    asteroidFrame = ++asteroidFrame % 32;

    asteroid.offset.x = -asteroid.size.x * (asteroidFrame % 8);
    asteroid.offset.y = -asteroid.size.y * Math.floor(asteroidFrame / 8);
    asteroid.animate(asteroidFrame);
  }

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
