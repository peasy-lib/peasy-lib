import { Agent, IAgent } from './agent';
import { World } from './world';
import { Action } from './action';
import { PlannerNode } from './planner-node';

export interface IPlannerAgent extends IAgent {
}

export interface IPlanner extends Omit<Partial<Planner>, 'world'> {
  world: World;
  agent: Agent;
}

export class Planner {
  public static planners: Planner[] = [];


  // public entity: any;
  // public target?: any;
  public maxLevel = 5;

  public constructor(public world: World, public agent: Agent) { }

  public static initialize(): void {
    // Trigger updates
  }

  public static update() {
    this.planners.forEach(planner => planner.update());
  }

  public static create(input: IPlanner): Planner {
    const planner = new Planner(input.world, input.agent);

    return planner;
  }

  public update() { }

  public destroy(): void {
    Planner.planners.splice(Planner.planners.indexOf(this), 1);
  }

  public chooseAction(world: World): Action | null {
    let nodes = this.evaluate(world, world, null, 1);

    (world as any).nodeCounts[nodes.length] = ((world as any).nodeCounts[nodes.length] ?? 0) + 1;

    if (nodes.length === 0) {
      return null;
    }

    // console.log('PlannerNode count:', nodes.length);
    let best = new PlannerNode();
    // nodes = nodes.filter(node => node.level === world.maxLevel);
    // nodes = nodes.filter(node => node.leaf());
    // const maxCost = Math.max(...nodes.map(node => node.cost));

    for (const node of nodes) {
      // console.log('node', node.score, node);
      // node.score *= node.cost / maxCost;
      node.score /= node.cost;
      // node.score = Math.floor(node.score * 1000000000);
      if (node.score === best.score) {
        // console.log('EQUAL', best.score, best.cost, node.cost, '-', best.level, best.name, '|', node.level, node.name, best.root.cost, node.root.cost, best.root.name, node.root.name);
      }
      if (node.score > best.score || (node.score === best.score && node.cost < best.cost)) {
        // console.log('BETTER', best.score, node.score, best.cost, node.cost, '-', best.level, best.name, '|', node.level, node.name, best.root.cost, node.root.cost, best.root.name, node.root.name);
        best = node;
      }
    }
    // console.log('best node', best.score);
    let node: PlannerNode | null = best;
    // while (node) {
    //   console.log('  ', node);
    //   node = node.parent;
    // }
    node = best.root;
    // console.log('==>', this.agent.id, node.action?.name);

    const agent = this.agent;
    const action = node.action!;
    if ((agent.getCurrentAction() == null && action != null) || action?.name !== agent.getCurrentAction()?.name || !(action?.isSame(agent.getCurrentAction()!) ?? true)) {
      // console.log('best node', best.name, best, best.root.tree());
    }

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

  public evaluate(world: World, currentWorld: World, parent: PlannerNode | null, level: number): PlannerNode[] {
    const nodes: PlannerNode[] = [];
    const actions = this.getAvailableActions(currentWorld, this.agent, parent);
    for (const action of actions) {
      const node = new PlannerNode(level, parent, action);
      node.cost = (parent?.cost ?? 0) + action.getCost();
      if (level === this.maxLevel) {
        // console.log('  ', this._getPlannerNodeName(node), ':', node.cost);
      }
      // action.context.world = currentWorld.clone();
      action.evaluate();
      const nextWorld = action.context.world;
      node.score = 0;
      node.context = action.context;
      for (const goal of this.agent.goals) {
        node.score += goal.getScore(action.context, this.world);
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
      if (level < this.maxLevel && !node.action?.isForcedLeaf()) {
        nodes.push(...this.evaluate(world, nextWorld, node, level + 1));
      }
    }
    return nodes;
  }

  public getAvailableActions(world: World, agent: Agent, parent: PlannerNode | null): Action[] {
    const actions = [];
    for (const action of agent.actions) {
      actions.push(...action.getAvailableActions(world, agent, parent));
    }
    return actions;
  }
}
