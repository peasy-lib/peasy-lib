export class Entity {
  public state = {};

  public clone(): Entity {
    const entity = new (this.constructor as any)();
    entity.state = structuredClone(this.state);
    return entity;
  }
}
