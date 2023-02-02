import { Entity } from "./entity";

export interface IMaskEntity extends Partial<MaskEntity> {
  entity: Entity;
  maskElement: HTMLElement;
}

export class MaskEntity {
  private _entity!: Entity;
  private _element!: HTMLElement;

  private _maskElement!: HTMLElement;

  private _entityVersion = 0;
  private readonly _updates = {
    entity: {
      position: 0,
      orientation: 0,
      scale: 0,
      zIndex: 0,
      size: 0,
      offset: 0,
    }
  };

  private _mask!: HTMLElement;

  // _frontShadowElement!: HTMLElement;
  // _frontShadowOpacityElement!: HTMLElement;

  public static create(input: IMaskEntity): MaskEntity {
    const maskEntity = new MaskEntity();

    maskEntity._entity = input.entity;
    maskEntity._maskElement = input.maskElement;

    return maskEntity;
  }

  public update(): void {
    const entity = this._entity;
    if (entity.normalMap == null) {
      return;
    }

    if (this._element == null) {
      this._createElements();
    }

    if (this._entityVersion !== entity.version) {
      this._updateProperties();
    }
  }

  private _updateProperties(): void {
    const entity = this._entity;

    if (this._entityVersion === entity.version) {
      return;
    }
    const entityUpdates = this._updates.entity;

    const updated = [];
    if (entityUpdates.size !== entity.updates.size) {
      updated.push('size');
    } else if (entityUpdates.position !== entity.updates.position) {
      updated.push('position');
    } else if (entityUpdates.orientation !== entity.updates.orientation) {
      updated.push('orientation');
    }
    if (entityUpdates.scale !== entity.updates.scale) {
      updated.push('scale');
    }
    if (entityUpdates.offset !== entity.updates.offset) {
      updated.push('offset');
    }

    this._entityVersion = entity.version;

    if (updated.length === 0) {
      return;
    }

    const style = this._element.style;

    for (const update of updated) {
      switch (update) {
        case 'size':
          style.width = `${entity.size.x}px`;
          style.height = `${entity.size.y}px`;
          entityUpdates.size = entity.updates.size;
        // Also update position if size changes
        // eslint-disable-next-line no-fallthrough
        case 'position':
          entityUpdates.position = entity.updates.position;
        // If only orientation changes, distance remains the same
        // eslint-disable-next-line no-fallthrough
        case 'orientation': {
          entityUpdates.orientation = entity.updates.orientation;
          style.translate = `${entity.left} ${entity.top}`;
          style.rotate = `${entity.orientation}deg`;
          break;
        }
        case 'scale':
          this._element.style.scale = entity.scale;
          entityUpdates.scale = entity.updates.scale;
          break;
        case 'offset':
          this._mask.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          entityUpdates.offset = entity.updates.offset;
          break;
      }
    }
  }

  private _createElements() {
    const entity = this._entity;
    this._maskElement.insertAdjacentHTML('beforeend', `
      <div class="light-entity light-entity-${entity.id ?? ''}" style="
        display: inline-block;
        position: absolute;
        left: 0px;
        top: 0px;
        isolation: isolate;
        /* background-color: cyan; */
        /* mix-blend-mode: multiply; */
        width: ${entity.size.x}px;
        height: ${entity.size.x}px;
        scale: ${entity.scale};
      ">
      </div>`);
    this._element = this._maskElement.lastElementChild as HTMLElement;

    this._element.insertAdjacentHTML('beforeend', `
      <div class="normal-map" style="
        position: absolute;
        left: 0px;
        top: 0px;
        width: ${entity.size.x}px;
        height: ${entity.size.x}px;
        background-image: url(${entity.normalMap});
        background-position: ${entity.offset.x}px ${entity.offset.y}px;
        filter: brightness(0);
      "></div>
      `);
    this._mask = this._element.lastElementChild as HTMLElement;

    // this._frontShadowElement = this._element.lastElementChild as HTMLElement;
    // this._element.insertAdjacentHTML('beforeend', `
    //   <div style="
    //     position: absolute;
    //     left: 0px;
    //     top: 0px;
    //     width: ${entity.size.x}px;
    //     height: ${entity.size.x}px;
    //     background-image: url(${entity.normalMap});
    //     filter: brightness(0) blur(2px) drop-shadow(0px 0px 2px white);
    //   "></div>
    //   `);
    // this._frontShadowOpacityElement = this._element.lastElementChild as HTMLElement;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

