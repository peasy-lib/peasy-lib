export interface IWorld { }

export class World {
  public state: any;

  public update(): void { }

  // Override and create a world with a state based on game world
  public static create(input: IWorld): World {
    const world = new this();
    return world;
  }

  // public initialize(world: IWorld, entity: IEntity, target: IEntity): void {
  //   this.world = {
  //     bolts: world.bolts,
  //   };
  //   this.entity = {
  //     hp: entity.hp,
  //     maxHp: entity.maxHp,
  //     crossbow: entity.crossbow != null ? { loaded: entity.crossbow.loaded } : null,
  //     bolts: entity.bolts,
  //     potions: entity.potions,
  //     evading: entity.evading,
  //   };
  //   this.target = target != nulls
  //     ? {
  //       hp: target.hp,
  //       maxHp: target.maxHp,
  //       crossbow: target.crossbow != null ? { loaded: target.crossbow.loaded } : null,
  //       bolts: target.bolts,
  //       potions: target.potions,
  //       evading: entity.evading,
  //     }
  //     : null;
  // }

  public clone(): World {
    console.log('cloning world')
    const world = new (this.constructor as any)() as World;
    // world.state = structuredClone(this.state);
    world.state = JSON.parse(JSON.stringify(this.state));
    return world;
  }
}
