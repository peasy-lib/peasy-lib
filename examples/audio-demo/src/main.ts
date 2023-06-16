import { Assets } from '@peasy-lib/peasy-assets';
import { Audio, Vector } from '@peasy-lib/peasy-audio';
import { Engine } from '@peasy-lib/peasy-engine';
import { UI } from '@peasy-lib/peasy-ui';
import { Input } from '@peasy-lib/peasy-input';

import 'styles.css';
import { Entity } from './entity';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

async function main(): Promise<void> {
  class App {
    public template = `
    <div class="main">
      <div style="margin-left: auto; margin-right: auto; width: 200px; padding: 10px; background-color: gold; text-align: center;">No sound? Click me!</div>
      <div pui="entity <=* entities" class="entity archer \${entity.direction} \${'walking' = entity.walking}" style="
        transform: translate3d(\${entity.position.x}px, \${entity.position.y}px, 0);
        "></div>
    </div>
  `;

    public player;
    public width = window.innerWidth;
    public height = window.innerHeight;
    public entities = [];
    // public walking;

    public static async create() {
      const app = new App();
      Audio.initialize({ listener: { position: { x: app.width / 2, y: app.height / 2, z: 200 } } });

      app.player = new Entity({ x: 0, y: app.height / 2 }, { x: 96, y: 96 });
      app.entities.push(app.player);
      // app.ship.element = document.querySelector('.ship');

      // Audio.addEntities([{
      //   entity: app.player,
      // }]);
      // app.ship.moveToPosition();

      await Assets.load([
        { name: 'music', src: 'sounds/music/motivation-epic-inspire.mp3' },
        { name: 'walk', src: 'sounds/effects/walking-on-grass.mp3' },
      ]);

      // Audio.addSound({ name: 'music', volume: 5, autoplay: true, loop: true });

      // app.walking = Audio.addSound({ name: 'walk', entity: app.player, volume: 10, loop: true });

      // setTimeout(() => app.walking.play(), 3000);
      // setTimeout(() => app.walking.stop(), 15000);

      UI.create(document.body, app, app.template)
      Engine.create(app.update);
      Input.initialize(0);
      Input.map(
        {
          'ArrowLeft': 'left',
          'ArrowRight': 'right',
          'ArrowDown': 'back',
          'ArrowUp': 'forward',
          ' ': 'fire',
        });
    }

    public update = (deltaTime: number, now: number) => {
      let movement = 0;
      if (Input.is('left')) {
        movement -= 1;
      }
      if (Input.is('right')) {
        movement += 1;
      }

      // ship.orientation = (ship.orientation + 0.5) % 360;
      // this.player.movement = movement;
      // if (movement === 0) {
      //   this.walking.stop();
      // } else {
      //   this.walking.play();
      // }

      this.player.update(movement);

      // this.ship.position.x += movement;
      // if (this.player.position.x > this.width) {
      //   this.player.position.x = 0;
      // }
      // this.ship.moveToPosition();

      Audio.update();
    }
  }

  App.create();
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(random(min, max));
}
