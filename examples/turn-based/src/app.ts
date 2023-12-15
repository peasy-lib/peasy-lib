import { Layer, Viewport } from '@peasy-lib/peasy-viewport';
import { World } from './world';
import { UI } from '@peasy-lib/peasy-ui';
import { Engine } from '@peasy-lib/peasy-engine';

export class App {
  //   <div>
  //   <button pui="click @=> start4">Start 4</button>
  //   <button pui="click @=> start8">Start 8</button>
  //   <button pui="click @=> start8NoCut">Start 8, no cutting corners</button>
  //   Stop <input type="number" pui="value <=> stopBefore"> steps before
  // </div>
  public template = `
    <p>Select action on button and then where to move, shoot or attack.</p>
    <p>(No actual enemy intelligence implemented yet; they just do stuff.)</p>
    <div class="game">
      <div id="viewport"></div>
      <div class="action-bar">

        <div class="combatants">
          <div class="combatant \${combatant.team}" pui="combatant <=* world.orderedCombatants:id" style="left: calc(\${combatant.index} * 110px)">
            <div class="name">\${combatant.name}</div>
            <div class="hp">HP: \${combatant.hp}</div>
            <div class="arrows">Arrows: \${combatant.arrows}</div>
          </div>
        </div>
        <div class="actions">
          <div class="radio-button">
              <input type="radio" name="action" id="action-move" \${'move' ==> world.action}>
              <label for="action-move">Move</label>
          </div>
          <div class="radio-button">
              <input type="radio" name="action" id="action-attack" \${'attack' ==> world.action}>
              <label for="action-attack">Attack</label>
          </div>
          <div class="radio-button" \${ === world.canShoot }>
              <input type="radio" name="action" id="action-shoot" \${'shoot' ==> world.action}>
              <label for="action-shoot">Shoot</label>
          </div>
        </div>

      </div>
    </div>
    `;

  public static width = 24;
  public static height = 12;
  public static tileSize = 32;
  public static directions8 = false;

  public static engine: Engine;

  public get directions8(): boolean {
    return App.directions8;
  }
  public set directions8(value: boolean) {
    App.directions8 = value;
  }

  public map =
    '                        ' +
    '                        ' +
    '                        ' +
    '    #            2      ' +
    '    ##           2      ' +
    '    ##           2      ' +
    '     ##          3332   ' +
    '      #          3332   ' +
    '      #          3      ' +
    '    ###          3      ' +
    '                 3      ' +
    '                        ';

  public viewport: Viewport;
  public world: World;


  private worldLayer: Layer;

  public stopBefore = 0;

  public get initialized(): boolean {
    return (this.viewport?.camera) != null;
  }

  public async start() {

    this.viewport = Viewport.create({ element: document.querySelector('#viewport'), size: { x: App.width * App.tileSize, y: App.height * App.tileSize } });
    this.viewport.addLayers([
      { name: 'world', parallax: 0 },
    ]);
    console.log(this);

    this.worldLayer = this.viewport.getLayer('world');
    console.log(this.worldLayer, this.worldLayer.parallax, this.worldLayer.element);

    this.world = new World(App.tileSize);
    this.world.load(this.map, App.width, App.height);
    await UI.create(this.worldLayer.element, this.world, World.template).attached;

    App.engine = Engine.create(this.update);
    // this.world.start();
    // requestAnimationFrame(this.update);
    // Engine.create(this.update);
  }

  public update = (deltaTime: number) => {
    // console.log('is a', Input.is('a'), Input.is('ArrowLeft'), Input.is('pan-up'));
    this.world.update(deltaTime / 1000);
    // UI.update();
  };

  public start4 = () => {
    this.world.start(4, this.stopBefore);
  }
  public start8 = () => {
    this.world.start(8, this.stopBefore);
  }
  public start8NoCut = () => {
    this.world.start(8, this.stopBefore, false);
  }
}
