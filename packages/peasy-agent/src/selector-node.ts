import { Action } from './action';
import { Agent } from './agent';
import { IContext } from './context';
import { Goal } from './goal';

export class SelectorNode {
  public score: number = -Infinity;
  public cost: number = Infinity;
  public goal!: Goal;
  public context!: IContext;
  public children: SelectorNode[] = [];

  public minimaxScore?: number;

  public constructor(public parent: SelectorNode | null = null, public action: Action | null = null) {
    if (this.parent != null) {
      this.parent.children.push(this);
    }
  }

  public tree(): string[] {
    if (this.leaf) {
      return [this.description];
    }
    return this.children.flatMap(child => child.tree());
  }

  public get name(): string {
    return this.parent != null
      ? `${this.parent.name} / ${this.action?.name}`
      : (this.action != null ? `/ ${this.action.name}` : '');
  }

  public get description(): string {
    return this.parent != null
      ? `${this.parent.description} / ${this.action?.description}`
      : (this.action != null ? `/ ${this.action.description}` : '');
  }

  public get root(): SelectorNode {
    return this.parent != null ? this.parent.root : this;
  }

  public get leaf(): boolean {
    return this.children.length === 0;
  }

  public get level(): number {
    return this.parent == null ? 0 : this.parent.level + 1;
  }

  public getMinimaxScore(agent: Agent): number {
    // console.log('maxScore', this.level, this.action?.context.agent.id, this.action?.context.target, this.children.map(child => child.score));
    const factor = (this.action?.context.agent.team === agent.team ? 1 : -1);
    if (this.children.length === 0) {
      this.minimaxScore = this.score * factor;
      return this.minimaxScore;
    }

    const score = factor > 0
      ? Math.min(...this.children.map(child => child.getMinimaxScore(agent)))
      : Math.max(...this.children.map(child => child.getMinimaxScore(agent)));
    this.minimaxScore = score;
    return this.minimaxScore;
  }

  // public get bestChildren(): SelectorNode[] {
  //   if (this.children.length === 0) {
  //     return [this];
  //   }
  //   const maxScore = Math.max(...this.children.map(child => child.maxScore));
  //   return this.children.filter(child => child.score === maxScore);
  // }
}
