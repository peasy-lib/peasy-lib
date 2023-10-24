import { World } from './world';
import { Agent } from './agent';

export interface IContext {
  world: World;
  agent: Agent;
  target?: any;
}
