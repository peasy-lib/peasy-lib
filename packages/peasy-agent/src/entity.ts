export class Entity {
  public state = {};

  public clone(): Entity {
    const entity = new Entity();
    entity.state = structuredClone(this.state);
    return entity;
  }
}
