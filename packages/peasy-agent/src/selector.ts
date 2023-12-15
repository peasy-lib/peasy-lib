import { Agent, IAgent } from './agent';
import { World } from './world';
import { Action } from './action';
import { SelectorNode } from './selector-node';

export interface ISelectorAgent extends IAgent {
}

export interface ISelector extends Omit<Partial<Selector>, 'world'> {
  agent: Agent;
}

export class Selector {
  public maxLevel = 1;

  public constructor(public agent: Agent) { }

  public static create(input: ISelector): Selector {
    return new this(input.agent);
  }

  public selectAction(world: World): Action | null {
    console.log('selectAction', this.agent.id);
    let nodes = this.evaluate(world, world, null, this.maxLevel);

    if ((world as any).nodeCounts != null) {
      (world as any).nodeCounts[nodes.length] = ((world as any).nodeCounts[nodes.length] ?? 0) + 1;
    }

    if (nodes.length === 0) {
      return null;
    }

    // console.log('SelectorNode count:', nodes.length);
    let best = new SelectorNode();
    // nodes = nodes.filter(node => node.level === world.maxLevel);
    // nodes = nodes.filter(node => node.leaf());
    // const maxCost = Math.max(...nodes.map(node => node.cost));

    for (const node of nodes) {
      // console.log('node', node.score, node);
      // node.score *= node.cost / maxCost;
      node.score /= node.cost;
      // node.score = Math.floor(node.score * 1000000000);
      // if (node.score === best.score) {
      //   console.log('EQUAL', best.score, best.cost, node.cost, '-', best.level, best.name, '|', node.level, node.name, best.root.cost, node.root.cost, best.root.name, node.root.name);
      // }
      if (node.score > best.score || (node.score === best.score && node.cost < best.cost)) {
        // console.log('BETTER', best.score, node.score, best.cost, node.cost, '-', best.level, best.name, '|', node.level, node.name, best.root.cost, node.root.cost, best.root.name, node.root.name);
        best = node;
      }
    }
    // console.log('best node', best.score);
    let node: SelectorNode | null = best;
    // while (node) {
    //   console.log('  ', node);
    //   node = node.parent;
    // }
    node = best.root;
    /*

    const bestScore = Math.max(...nodes.filter(n => n.level === 0).map(n => n.getMinimaxScore(this.agent)));
    const bestNodes = nodes.filter(n => n.level === 0 && n.minimaxScore === bestScore);
    node = bestNodes[0];
    // console.log('==>', this.agent.id, node.action?.name);

    // const agent = this.agent;
    // const action = node.action!;
    // if ((agent.getCurrentAction() == null && action != null) || action?.name !== agent.getCurrentAction()?.name || !(action?.isSame(agent.getCurrentAction()!) ?? true)) {
    //   console.log('best node', best.name, best, best.root.tree());
    // }
    */
    return node.action;

    // for (const goal of entity.goals) {
    //   console.log('  ', goal.name, ':', goal.getPriority(world), 'score:', goal.getScore(world));
    // }
    // for (const action of world.availableActions(world.world, world.entity)) {
    //   const cost = action.getCost(world);
    //   console.log('  ', action.name, ':', cost);
    //   action.perform(world.world, world.entity, world.target);
    //   action.done(world.world, world.entity, world.target);
    // }
    // for (const goal of entity.goals) {
    //   console.log('  ', goal.name, ':', goal.getPriority(world), 'score:', goal.getScore(world));
    // }s
  }

  public evaluate(world: World, originalWorld: World, parent: SelectorNode | null, level: number): SelectorNode[] {
    // console.log('Evaluating', this.agent.id, level, world.state);
    const nodes: SelectorNode[] = [];
    const actions = this.getAvailableActions(world, parent);
    for (const action of actions) {
      const node = new SelectorNode(parent, action);
      node.cost = (parent?.cost ?? 0) + action.getCost();
      // if (level > 0) {
      //   console.log('  ', this._getSelectorNodeName(node), ':', node.cost);
      // }
      // action.context.world = currentWorld.clone();
      const applyNodes = action.apply(node, level);
      const nextWorld = action.context.world;
      node.score = 0;
      node.context = action.context;
      for (const goal of this.agent.goals) {
        node.score += goal.getScore(action.context, originalWorld);
        //   const score = goal.getScore(this, nextWorld) / node.cost;
        //   if (level === this.maxLevel) {
        //     // console.log('    ', goal.name, ':', score);
        //   }
        //   // node.goal = goal;
        //   // node.score += score;
        //   if (score > node.score) {
        //     node.score = score;
        //     node.goal = goal;
        //   }
      }
      nodes.push(node);
      if (Array.isArray(applyNodes)) {
        nodes.push(...applyNodes);
      } else if (level > 0 && !node.action?.stopTraversal()) {
        nodes.push(...this.evaluate(nextWorld, originalWorld, node, level - 1));
      }
      if (action.undo != null) {
        action.undo();
      }
    }
    return nodes;
  }

  public getAvailableActions(world: World, parent: SelectorNode | null): Action[] {
    const actions = [];
    for (const action of this.agent.actions) {
      actions.push(...action.getAvailableActions(world, this.agent, parent));
    }
    return actions;
  }
}
