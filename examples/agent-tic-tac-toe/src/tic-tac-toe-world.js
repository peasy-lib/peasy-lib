import { World } from '@peasy-lib/peasy-agent';

export class TicTacToeWorld extends World {

  static create(input) {
    const world = World.create(input);
    world.state = input.map(div => div.classList.value);
    return world;
  }
}
