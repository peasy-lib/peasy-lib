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

  private _backgrounds = {
    'city': [
      { name: 'city', image: 'assets/city-background/layer_08_1920 x 1080.png', size: { x: 1920, y: 1080 } },
      { name: 'city', parallax: 0.97, image: 'assets/city-background/layer_07_1920 x 1080.png', size: { x: 1920, y: 1080 }, position: { x: 960, y: 0 } },
      { name: 'city', parallax: 0.85, image: 'assets/city-background/layer_06_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'city', parallax: 0.8, image: 'assets/city-background/layer_05_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'city', parallax: 0.7, image: 'assets/city-background/layer_04_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'city', parallax: 0.5, image: 'assets/city-background/layer_03_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'city', parallax: 0.25, image: 'assets/city-background/layer_02_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'city', parallax: 0, image: 'assets/city-background/layer_01_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
    ],
    'scary': [
      { name: 'scary', parallax: 0.97, image: 'assets/scary-background/layer_07_1920 x 1080.png', size: { x: 1920, y: 1080 } },
      { name: 'scary', parallax: 0.97, image: 'assets/scary-background/layer_06_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'scary', parallax: 0.8, image: 'assets/scary-background/layer_05_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'scary', parallax: 0.7, image: 'assets/scary-background/layer_04_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'scary', parallax: 0.5, image: 'assets/scary-background/layer_03_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'scary', parallax: 0, image: 'assets/scary-background/layer_02_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'scary', parallax: 0, image: 'assets/scary-background/layer_01_1920 x 1080.png', size: { x: 1920, y: 1080 }, position: { x: 0, y: -270 }, repeatX: true },
    ]
  };
  private _foregrounds = {
    'city': [
      { name: 'city', parallax: -0.2, image: 'assets/city-background/layer_02_1920 x 1080.png', size: { x: 1920, y: 1080 }, position: { x: 0, y: 270 }, repeatX: true },
    ],
    'scary': [
      { name: 'scary', parallax: -0.5, image: 'assets/scary-background/layer_01_1920 x 1080.png', size: { x: 1920, y: 1080 }, position: { x: 0, y: -60 }, repeatX: true },
    ],
  };

  private level: string;
  private worldLayer: Layer;
  private hudLayer: Layer;

  public zooming = true;
  public zoomStep = .01;

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
    this.viewport = Viewport.create({ size: { y: 800, x: 480 }, origin: { y: 270 } });
    this.level = 'city';
    this.viewport.addLayers([
      // ...this._backgrounds[this.level],
      // { name: this.level, image: 'assets/city-background/layer_08_1920 x 1080.png', size: { x: 1920, y: 1080 } },
      // { name: this.level, parallax: 0.97, image: 'assets/city-background/layer_07_1920 x 1080.png', size: { x: 1920, y: 1080 } },
      // { name: this.level, parallax: 0.85, image: 'assets/city-background/layer_06_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      // { name: this.level, parallax: 0.8, image: 'assets/city-background/layer_05_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      // { name: this.level, parallax: 0.7, image: 'assets/city-background/layer_04_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      // { name: this.level, parallax: 0.5, image: 'assets/city-background/layer_03_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      // { name: this.level, parallax: 0.25, image: 'assets/city-background/layer_02_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      // { name: this.level, parallax: 0, image: 'assets/city-background/layer_01_1920 x 1080.png', size: { x: 1920, y: 1080 }, repeatX: true },
      { name: 'world', parallax: 0, size: { x: 0, y: 0 }, position: { x: 0, y: 242 } },
      { name: 'effects', canvasContext: '2d', scaling: true, /* element: document.querySelector('#external') */ },
      // ...this._foregrounds[this.level],
      // { parallax: -0.2, image: 'assets/city-background/layer_02_1920 x 1080.png', size: { x: 1920, y: 1080 }, position: { x: 0, y: 270 }, repeatX: true },
      { name: 'HUD', id: 'HUD' },
    ]);
    console.log(this);

    this.worldLayer = this.viewport.getLayer('world');
    console.log(this.worldLayer, this.worldLayer.parallax, this.worldLayer.element);

    this.world = new World();
    UI.create(this.worldLayer.element, this.world, World.template)

    this.effectsLayer = this.viewport.getLayer('effects');

    this.hudLayer = this.viewport.getLayer('HUD');
    console.log(this.hudLayer, this.hudLayer.parallax, this.hudLayer.element);

    UI.create(this.hudLayer.element, new HUD(this), HUD.template)

    this.setLevel('city');

    setTimeout(() => {
      // this.setLevel('scary');
    }, 2000);

    let zoomOut;
    const zoomIn = () => {
      this.viewport.camera.zoom += .02;
      if (this.viewport.camera.zoom < 2) {
        setTimeout(zoomIn, 50);
      } else {
        setTimeout(zoomOut, 3000);
      }
    }
    zoomOut = () => {
      this.viewport.camera.zoom -= .02;
      if (this.viewport.camera.zoom > 1) {
        setTimeout(zoomOut, 50);
      } else {
        setTimeout(zoomIn, 3000);
      }
    }
    // setTimeout(zoomIn, 3000);


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
        '1': { action: 'level-city', repeat: false },
        '2': { action: 'level-scary', repeat: false },
      },
      (action: string, doing: boolean) => {
        if (doing) {
          this.actions.push(action);
          if (action === 'jump') {
            this.player.jump();
          } else if (action.startsWith('level-')) {
            this.setLevel(action.split('-').pop());
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

    if (this.zooming) {
      this.viewport.camera.zoom += this.zoomStep;
      if (this.viewport.camera.zoom >= 2 || this.viewport.camera.zoom <= 0.75) {
        this.zooming = false;
        this.zoomStep *= -1;
        setTimeout(() => this.zooming = true, 3000);
      }
    }
    requestAnimationFrame(this.update);
  };

  public async setLevel(name: string) {
    const fade = this.viewport.addLayers({ name: 'fade', before: this.hudLayer } as any)[0];
    await this.fadeIn(fade.element, 300);

    this.viewport.removeLayers(this.viewport.getLayers(this.level));
    this._backgrounds[name].forEach(layer => {
      (layer as any).before = this.worldLayer;
      // layer.position = { x: -this.viewport.half.x, y: -this.viewport.half.y };
    });

    this._foregrounds[name].forEach(layer => (layer as any).before = fade);
    this.viewport.addLayers([...this._backgrounds[name], ...this._foregrounds[name]]);
    this.level = name;

    this.player.x = this.player.startX;
    this.player.y = this.player.startY;

    await this.fadeOut(fade.element, 300);
    this.viewport.removeLayers(fade);
  }

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


  // Function to animate fading in
  private fadeIn(element, duration) {
    return element?.animate(
      [
        { opacity: 0 },
        { opacity: 1 }
      ],
      {
        duration: duration,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    ).finished;
  }

  // Function to animate fading out
  private fadeOut(element, duration) {
    return element?.animate(
      [
        { opacity: 1 },
        { opacity: 0 }
      ],
      {
        duration: duration,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    ).finished;
  }
}
