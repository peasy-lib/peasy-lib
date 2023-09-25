import { Player } from './player';

export class World {
  public static template = `
    <div class="entity" pui="entity <=* entities" style="left: \${entity.x}px; top: \${entity.y}px;"></div>
    `;

  public entities = [new Player()];
}
