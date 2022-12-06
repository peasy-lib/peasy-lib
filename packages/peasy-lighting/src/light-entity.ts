import { Entity } from "./entity";
import { Light } from "./light";
import { Vector } from "./vector";

export interface ILightEntity extends Partial<LightEntity> {
  light: Light;
  entity: Entity;
}

export class LightEntity {
  #light!: Light;
  #entity!: Entity;
  #element!: HTMLElement;

  #distance = 0;
  #zModifier = 1;
  #normalized = new Vector();

  #lightVersion = 0;
  #entityVersion = 0;
  #updates = {
    light: {
      position: 0,
      zIndex: 0,
    },
    entity: {
      position: 0,
      orientation: 0,
      zIndex: 0,
      size: 0,
      offset: 0,
    }
  };

  #red!: HTMLElement;
  #green!: HTMLElement;
  #blue!: HTMLElement;
  #redNormal!: HTMLElement;
  #greenNormal!: HTMLElement;
  #blueNormal!: HTMLElement;

  #frontShadowElement!: HTMLElement;
  #frontShadowOpacityElement!: HTMLElement;

  public static create(input: ILightEntity): LightEntity {
    const lightEntity = new LightEntity();

    lightEntity.#entity = input.entity;
    lightEntity.#light = input.light;

    return lightEntity;
  }

  get #redFilter(): string {
    return this.#normalized.x < 0 ? '#reverse-red-filter' : '#red-filter';
  }
  get #greenFilter(): string {
    return -this.#normalized.y < 0 ? '#reverse-green-filter' : '#green-filter';
  }
  get #blueFilter() {
    return '#blue-filter';
  }

  get #redOpacity(): number {
    return clamp((this.#light.radius - this.#distance) / (this.#light.radius / 2), 0, 1) * Math.abs(this.#normalized.x);
    // return clamp(this.#light.radius - this.#distance, 0, 1) * Math.abs(this.#normalized.x);
  }
  get #greenOpacity(): number {
    return clamp((this.#light.radius - this.#distance) / (this.#light.radius / 2), 0, 1) * Math.abs(this.#normalized.y);
    // return clamp(this.#light.radius - this.#distance, 0, 1) * Math.abs(this.#normalized.y);
  }
  get #blueOpacity(): number {
    return clamp((this.#light.radius - this.#distance) / this.#light.radius, 0, 1);
    // return clamp((this.#light.radius - this.#distance) / this.#light.radius, 0.05, 1);
    // // return clamp(this.#light.radius - this.#distance, 0, 1);
  }

  get #frontShadowVisibility(): number {
    return this.#light.zIndex < this.#entity.zIndex ? 1 : 0;
  }
  get #frontShadowOpacity(): number {
    return clamp((this.#light.radius - this.#distance) / this.#light.radius, 0, 1) * this.#frontShadowVisibility;
  }

  public update(): void {
    const entity = this.#entity;
    if (entity.normalMap == null) {
      return;
    }

    if (this.#element == null) {
      this.#createElements();
    }

    if (this.#entityVersion !== entity.version || this.#lightVersion !== this.#light.version) {
      this.#updateProperties();
    }
  }

  #updateProperties(): void {
    const entity = this.#entity;
    const light = this.#light;

    if (this.#lightVersion === light.version && this.#entityVersion === entity.version) {
      return;
    }
    const lightUpdates = this.#updates.light;
    const entityUpdates = this.#updates.entity;

    const updated = [];
    if (entityUpdates.size !== entity.updates.size) {
      updated.push('size');
    } else if (lightUpdates.position !== light.updates.position || entityUpdates.position !== entity.updates.position) {
      updated.push('position');
    } else if (entityUpdates.orientation !== entity.updates.orientation) {
      updated.push('orientation');
    }
    if (entityUpdates.offset !== entity.updates.offset) {
      updated.push('offset');
    }

    this.#lightVersion = light.version;
    this.#entityVersion = entity.version;

    if (updated.length === 0) {
      return;
    }

    const style = this.#element.style;

    for (const update of updated) {
      // console.log('light-entity update', update, entityUpdates, entity.updates, lightUpdates, light.updates);
      switch (update) {
        case 'size':
          style.width = `${entity.size.x}px`;
          style.height = `${entity.size.y}px`;
          entityUpdates.size = entity.updates.size;
        // Also update position if size changes
        // eslint-disable-next-line no-fallthrough
        case 'position': {
          this.#distance = Math.round(light.position.subtract(entity.position).magnitude);

          const zDistance = Math.abs(this.#light.zIndex - this.#entity.zIndex);
          this.#zModifier = Math.max(5 - zDistance, 0) / 5;
          // console.log('zModifier', zDistance, this.#zModifier);
          // this.#distance = this.#distance * zDistance;
          entityUpdates.position = entity.updates.position;
          lightUpdates.position = light.updates.position;
        }
        // If only orientation changes, distance remains the same
        // eslint-disable-next-line no-fallthrough
        case 'orientation': {
          const redStyle = this.#red.style;
          const greenStyle = this.#green.style;
          const blueStyle = this.#blue.style;
          const frontShadowStyle = this.#frontShadowElement.style;
          const frontShadowOpacityStyle = this.#frontShadowOpacityElement.style;

          this.#normalized = light.position
            .subtract(entity.position).rotate(-entity.orientation, true)
            .normalize(true);

          style.translate = `${entity.left} ${entity.top}`;
          style.rotate = `${entity.orientation}deg`;
          redStyle.opacity = `${this.#redOpacity}`;
          greenStyle.opacity = `${this.#greenOpacity}`;
          blueStyle.opacity = `${this.#blueOpacity}`;
          redStyle.filter = `url(${this.#redFilter})`;
          greenStyle.filter = `url(${this.#greenFilter})`;
          blueStyle.filter = `url(${this.#blueFilter})`;

          frontShadowStyle.opacity = `${this.#frontShadowVisibility}`;
          frontShadowOpacityStyle.opacity = `${this.#frontShadowOpacity}`;

          entityUpdates.orientation = entity.updates.orientation;
          break;
        }
        case 'offset':
          this.#redNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this.#greenNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this.#blueNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this.#frontShadowElement.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this.#frontShadowOpacityElement.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;

          entityUpdates.offset = entity.updates.offset;
          break;
      }
    }
  }

  #createElements() {
    const entity = this.#entity;
    const light = this.#light;
    light.containerElement.insertAdjacentHTML('beforeend', `
      <div class="light-entity" style="
        display: inline-block;
        position: absolute;
        left: 0px;
        top: 0px;
        isolation: isolate;
        /* background-color: cyan; */
        /* mix-blend-mode: multiply; */
        width: ${entity.size.x}px;
        height: ${entity.size.x}px;
      ">
        <div style="
          position: absolute;
          left: 0px;
          top: 0px;
          width: ${entity.size.x}px;
          height: ${entity.size.x}px;
          mix-blend-mode: lighten;
          filter: url(${this.#redFilter});
          opacity: ${this.#redOpacity};
        ">
          <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px;
            height: ${entity.size.x}px;
            background-image: url(${entity.normalMap});
            background-position: ${entity.offset.x}px ${entity.offset.y}px;
          "></div>
        </div>
        <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px;
            height: ${entity.size.x}px;
            mix-blend-mode: lighten;
            filter: url(${this.#greenFilter});
            opacity: ${this.#greenOpacity};
        ">
          <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px;
            height: ${entity.size.x}px;
            background-image: url(${entity.normalMap});
            background-position: ${entity.offset.x}px ${entity.offset.y}px;
          "></div>
        </div>
        <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px;
            height: ${entity.size.x}px;
            mix-blend-mode: lighten;
            filter: url(${this.#blueFilter});
            opacity: ${this.#blueOpacity};
        ">
          <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px;
            height: ${entity.size.x}px;
            background-image: url(${entity.normalMap});
            background-position: ${entity.offset.x}px ${entity.offset.y}px;
          "></div>
        </div>
      </div>`);
    this.#element = light.containerElement.lastElementChild as HTMLElement;
    [this.#red, this.#green, this.#blue] = Array.from(this.#element.children) as HTMLElement[];
    [this.#redNormal, this.#greenNormal, this.#blueNormal] = [this.#red, this.#green, this.#blue].map(element =>
      element.firstElementChild) as HTMLElement[];

    this.#element.insertAdjacentHTML('beforeend', `
      <div style="
        position: absolute;
        left: 0px;
        top: 0px;
        width: ${entity.size.x}px;
        height: ${entity.size.x}px;
        background-image: url(${entity.normalMap});
        background-position: ${entity.offset.x}px ${entity.offset.y}px;
        filter: brightness(0);
        opacity: ${this.#frontShadowVisibility};
      "></div>
      `);
    this.#frontShadowElement = this.#element.lastElementChild as HTMLElement;
    this.#element.insertAdjacentHTML('beforeend', `
      <div style="
        position: absolute;
        left: 0px;
        top: 0px;
        width: ${entity.size.x}px;
        height: ${entity.size.x}px;
        background-image: url(${entity.normalMap});
        background-position: ${entity.offset.x}px ${entity.offset.y}px;
        filter: brightness(0) blur(2px) drop-shadow(0px 0px 2px white);
        opacity: ${this.#frontShadowOpacity};
        /* scale: 0.95; */
      "></div>
      `);
    this.#frontShadowOpacityElement = this.#element.lastElementChild as HTMLElement;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

