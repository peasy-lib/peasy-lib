import { Action, Agent } from '@peasy-lib/peasy-agent';
import { checkWin } from './win.js';

export class AgentPlay extends Action {

  static getAvailableActions(world, agent, previous) {
    const slots = world.state;
    if (checkWin(slots, agent.id) !== 0) {
      return [];
    }
    const actions = [];
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] !== '') {
        continue;
      }
      actions.push(AgentPlay.create({
        name: 'play',
        world,
        agent,
        target: i,
        duration: 1,
      }));
    }
    return actions;
  }

  // Affect the state of the world, agent and/or target
  apply(parentNode, level) {
    const { world, agent, target } = this.context;
    world.state[target] = agent.id;

    // We want to evaluate opponent's moves so apply them as well
    const opponent = Agent.getAgent(agent.id === 'cross' ? 'circle' : 'cross');
    if (level > 0) {
      return opponent.selector.evaluate(world, world, parentNode, level - 1);
    }
    return [];
  }

  // Undo the action's effect on the world, agent and/or target
  undo() {
    const { world, target } = this.context;
    world.state[target] = '';
  }
}
