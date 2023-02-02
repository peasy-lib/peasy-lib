import { Entity } from "./entity";

export interface IMaskEntity extends Partial<MaskEntity> {
  entity: Entity;
  maskElement: HTMLElement;
}

export class MaskEntity {
  #entity!: Entity;
  #element!: HTMLElement;

  #maskElement!: HTMLElement;

  #entityVersion = 0;
  #updates = {
    entity: {
      position: 0,
      orientation: 0,
      scale: 0,
      zIndex: 0,
      size: 0,
      offset: 0,
    }
  };

  #mask!: HTMLElement;

  // #frontShadowElement!: HTMLElement;
  // #frontShadowOpacityElement!: HTMLElement;

  public static create(input: IMaskEntity): MaskEntity {
    const maskEntity = new MaskEntity();

    maskEntity.#entity = input.entity;
    maskEntity.#maskElement = input.maskElement;

    return maskEntity;
  }

  public update(): void {
    const entity = this.#entity;
    if (entity.normalMap == null) {
      return;
    }

    if (this.#element == null) {
      this.#createElements();
    }

    if (this.#entityVersion !== entity.version) {
      this.#updateProperties();
    }
  }

  #updateProperties(): void {
    const entity = this.#entity;

    if (this.#entityVersion === entity.version) {
      return;
    }
    const entityUpdates = this.#updates.entity;

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

    this.#entityVersion = entity.version;

    if (updated.length === 0) {
      return;
    }

    const style = this.#element.style;

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
          this.#element.style.scale = entity.scale;
          entityUpdates.scale = entity.updates.scale;
          break;
        case 'offset':
          this.#mask.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          entityUpdates.offset = entity.updates.offset;
          break;
      }
    }
  }

  #createElements() {
    const entity = this.#entity;
    this.#maskElement.insertAdjacentHTML('beforeend', `
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
    this.#element = this.#maskElement.lastElementChild as HTMLElement;

    this.#element.insertAdjacentHTML('beforeend', `
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
    this.#mask = this.#element.lastElementChild as HTMLElement;

    // this.#frontShadowElement = this.#element.lastElementChild as HTMLElement;
    // this.#element.insertAdjacentHTML('beforeend', `
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
    // this.#frontShadowOpacityElement = this.#element.lastElementChild as HTMLElement;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

