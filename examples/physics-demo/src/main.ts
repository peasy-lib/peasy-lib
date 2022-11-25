import { Physics } from '@peasy-lib/peasy-physics';
import { UI } from '@peasy-lib/peasy-ui';
import 'styles.css';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

const balls = 30;
const model = {
  running: true,
  balls: [] as any[],
};
async function main(): Promise<void> {
  for (let i = 0; i < balls; i++) {
    const ball = {
      position: { x: randomInt(50, 350), y: randomInt(50, 350) },
      // velocity: { x: random(-300, 300), y: random(-300, 300) },
      color: `${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}${randomInt(0, 255).toString(16).padStart(2, '0')}`,
      forces: [{
        name: 'movement',
        direction: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
        maxMagnitude: random(0, 300),
        duration: 0,
      }],
    };
    model.balls.push(ball);
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
      <label>Run: <input type="checkbox" \${checked <=> running}></label>
      <div class="border">
        <div class="ball" \${ball <=* balls} style="transform: translate3d(\${ball.position.x}px, \${ball.position.y}px, 0); background-color: #\${|ball.color};"></div>
      </div>
   </div>
   `, model);

  Physics.addForce({
    name: 'gravity',
    direction: { x: 0, y: 1 },
    maxMagnitude: 1000,
    acceleration: 200,
    duration: 0,
  });

  Physics.addEntities(model.balls);

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
  if (model.running) {
    Physics.update(deltaTime, now);
  }
  UI.update();
  requestAnimationFrame(update);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(random(min, max));
}
