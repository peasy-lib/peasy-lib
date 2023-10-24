import { Action } from './action';
import { IContext } from './context';
import { Goal } from './goal';

export class PlannerNode {
  public score: number = -Infinity;
  public cost: number = Infinity;
  public goal!: Goal;
  public context!: IContext;
  public children: PlannerNode[] = [];

  public constructor(public level = 0, public parent: PlannerNode | null = null, public action: Action | null = null) {
    if (this.parent != null) {
      this.parent.children.push(this);
    }
  }

  public tree(): string[] {
    if (this.leaf()) {
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

  public get root(): PlannerNode {
    return this.parent != null ? this.parent.root : this;
  }

  public leaf(): boolean {
    return this.children.length === 0;
  }
}
