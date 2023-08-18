import { UI, UIView } from '@peasy-lib/peasy-ui';
import { States, State } from '@peasy-lib/peasy-states';
import { Engine } from '@peasy-lib/peasy-engine';
import { Input } from '@peasy-lib/peasy-input';
import 'styles.css';

window.addEventListener('DOMContentLoaded', (event) => {
  main2();
});

async function main(): Promise<void> {
  class MovementStates extends States { }

  class Grounded extends State {
    public update(action: string) {
      // console.log('...', action);
      if (action === 'jump') {
        this.states.set(Jumping);
      }
    }
    public enter(previous: State | null) {
      if (previous != null) {
        console.log('Oof!');
      }
    }
    public leave() {
      console.log('Lift off!');
    }
  }

  class Airborne extends State {
    public ticks = 0;
    public update(next: typeof State) {
      this.ticks++;
      if (this.ticks >= 120) {
        this.states.set(next);
      }
    }
    public enter() {
      this.ticks = 0;
    }
  }
  class Jumping extends Airborne {
    public update() {
      console.log('Wheee!');
      super.update(Falling);
    }
  }
  class Falling extends Airborne {
    public update() {
      console.log('Oh no!');
      super.update(Grounded);
    }
  }

  class Player {
    public movement = new MovementStates();

    public constructor() {
      this.movement.register(Jumping);
      this.movement.register(Falling, 'failing', 'falling', Grounded);
      this.movement.set(Grounded);
    }

    public update(action: string) {
      this.movement.update(action);
    }

    public render() {
      console.log(this.movement.current.name)
    }
  }

  class App {
    public player = new Player();

    public constructor() {
      Engine.create(this.update);
      Input.map({ ' ': 'jump', });
    }

    public update = (delta: number, total: number) => {
      this.player.update(Input.is('jump') ? 'jump' : '');
    }
  }

  UI.create(document.body, new App());
}

async function main2(): Promise<void> {
  class Router extends States { }

  class Route extends State {
    public view: UIView;
    public template: string;

    public counter = 0;

    public enter(previous: State | null, ...params: any[]) {
      console.log('enter', this.constructor.name, ++this.counter, params);
      this.view = UI.create(document.querySelector('#viewport') as HTMLElement, this, this.template);
    }
    public repeat(...params: any[]) {
      console.log('repeat', this.constructor.name, ++this.counter, params);
    }
    public leave() {
      this.view.destroy();
    }
  }
  class Menu extends Route {
    public template = '<div>Menu</div>';
  }
  class Lobby extends Route {
    public template = '<div>Lobby</div>';
    public leave() {
      super.leave();
      this.states.reset(this);
    }
  }
  class Login extends Route {
    public template = '<div>Login</div>';
  }

  class App {
    public router = new Router();

    public constructor() {
      const routes = [Menu, Lobby, Login];
      this.router.register(...routes);
      this.router.set(Menu);

      Input.map({ 1: 'Menu', 2: 'Lobby', 3: 'Login', 4: 'Login4' }, (action: string, doing: boolean) => {
        if (doing) {
          if (action === 'Login4') {
            this.router.set('Login', 0, 4);
          } else {
            this.router.set(action);
          }
        }
      });
    }
  }

  UI.create(document.body, new App());
}
