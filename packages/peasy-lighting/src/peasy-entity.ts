export class PeasyEntity {
  public id!: string;

  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
    orientation: 0,
  };

  protected $updated: Set<string> = new Set();

  // This is the entity that's actually being mutated
  // It's the object passed to static create (or the entity property of that object)
  private readonly _entity: any;
}
