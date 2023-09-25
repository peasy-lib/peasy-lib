import { Layer, Viewport } from '@peasy-lib/peasy-viewport';
import { World } from './world';
import { Input } from '@peasy-lib/peasy-input';
import { Gravel } from './gravel';
import { UI } from '@peasy-lib/peasy-ui';
import { HUD } from './hud';

export class App {
  public template = `
  <h2>Parallax demo - controls: a, d, space (camera and movement are limited a bit to the left)</h2>
  `;
  public actions: string[] = [];

  public viewport: Viewport;
  public layers: Layer[];
  public world: World;
  public effectsLayer: Layer;


  public get initialized(): boolean {
    return (this.viewport?.camera) != null;
  }

  public get player() {
    return this.world?.entities[0];
  }

  public getCamera(): { x: number; y: number } {
    return { x: this.viewport.camera.x, y: this.viewport.camera.y };
  }
  public setCamera(x: number, y: number): void {
    this.viewport.camera.x = Math.round(Math.max(Math.min(x, this.viewport.maxX), -200));
    this.viewport.camera.y = y;
  }

  public start() {
    this.viewport = Viewport.create({ size: { y: 1080, x: 480 } });
    this.layers = this.viewport.addLayers([
      { image: 'assets/city-background/layer_08_1920 x 1080.png', size: { x: 1920, y: 1080 } },
      { parallax: 0.97, image: 'assets/city-background/layer_07_1920 x 1080.png', size: { x: 1920, y: 1080 } },
      { parallax: 0.85, image: 'assets/city-background/layer_06_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { parallax: 0.8, image: 'assets/city-background/layer_05_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { parallax: 0.7, image: 'assets/city-background/layer_04_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { parallax: 0.5, image: 'assets/city-background/layer_03_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { parallax: 0.25, image: 'assets/city-background/layer_02_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { parallax: 0, image: 'assets/city-background/layer_01_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'world', parallax: 0 },
      { name: 'effects', canvasContext: '2d' },
      { parallax: -0.2, image: 'assets/city-background/layer_02_1920 x 1080.png', size: { x: 1920, y: 1080 }, position: { x: 0, y: 270 }, repeatX: true },
      { name: 'HUD' },
    ]);
    console.log(this);

    const worldLayer = this.layers.find(layer => layer.name === 'world');
    console.log(worldLayer, worldLayer.parallax, worldLayer.element);

    this.world = new World();
    UI.create(worldLayer.element, this.world, World.template)

    this.effectsLayer = this.layers.find(layer => layer.name === 'effects');

    const hud = this.layers.at(-1);
    console.log(hud, hud.parallax, hud.element);

    UI.create(hud.element, new HUD(this), HUD.template)


    Input.initialize(30); // Repeats per second

    Input.map(
      {
        'ArrowLeft': 'pan-left',
        'ArrowRight': 'pan-right',
        'ArrowDown': 'pan-down',
        'ArrowUp': 'pan-up',
        'a': 'walk-left',
        'd': 'walk-right',
        's': 'walk-down',
        'w': 'walk-up',
        ' ': 'jump',
      },
      (action: string, doing: boolean) => {
        if (doing) {
          this.actions.push(action);
          if (action === 'jump') {
            this.player.jump();
          } else {
            this._moveActions(action);
          }
        }
      });
    requestAnimationFrame(this.update);
  }

  public update = (time) => {
    // console.log('is a', Input.is('a'), Input.is('ArrowLeft'), Input.is('pan-up'));
    Input.update(time);
    Viewport.update();
    this.player?.update(this);
    Gravel.update(this.effectsLayer?.ctx);

    requestAnimationFrame(this.update);
  };

  private _moveActions(action) {
    let mover;
    let move;
    const [movement, direction] = action.split('-');
    switch (movement) {
      case 'walk':
        mover = this.player;
        move = 2;
        break;
      case 'pan':
        move = 10;
        mover = this;
        break;
    }
    switch (direction) {
      case 'up':
        mover.move(0, -move);
        break;
      case 'down':
        mover.move(0, move);
        break;
      case 'left':
        mover.move(-move, 0);
        break;
      case 'right':
        mover.move(move, 0);
        break;
    }
  }

  public move(x: number, y: number): void {
    this.setCamera(this.viewport.camera.x + x, this.viewport.camera.y + y);
  }
}
