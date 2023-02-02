import { Entity } from "./entity";
import { Light } from "./light";
import { Vector } from "./vector";

export interface ILightEntity extends Partial<LightEntity> {
  light: Light;
  entity: Entity;
}

export class LightEntity {
  private _light!: Light;
  private _entity!: Entity;
  private _element!: HTMLElement;

  private _distance = 0;
  private _zModifier = 1;
  private _normalized = new Vector();

  private _lightVersion = 0;
  private _entityVersion = 0;
  private readonly _updates = {
    light: {
      position: 0,
      zIndex: 0,
    },
    entity: {
      position: 0,
      orientation: 0,
      scale: 0,
      zIndex: 0,
      size: 0,
      offset: 0,
    }
  };

  private _red!: HTMLElement;
  private _green!: HTMLElement;
  private _blue!: HTMLElement;
  private _redNormal!: HTMLElement;
  private _greenNormal!: HTMLElement;
  private _blueNormal!: HTMLElement;

  private _frontShadowElement!: HTMLElement;
  private _frontShadowOpacityElement!: HTMLElement;

  public static create(input: ILightEntity): LightEntity {
    const lightEntity = new LightEntity();

    lightEntity._entity = input.entity;
    lightEntity._light = input.light;

    return lightEntity;
  }

  private get _redFilter(): string {
    return this._normalized.x < 0 ? '#reverse-red-filter' : '#red-filter';
  }
  private get _greenFilter(): string {
    return -this._normalized.y < 0 ? '#reverse-green-filter' : '#green-filter';
  }
  private get _blueFilter() {
    return '#blue-filter';
  }

  private get _redOpacity(): number {
    return clamp((this._light.radius - this._distance) / (this._light.radius / 2), 0, 1) * Math.abs(this._normalized.x);
    // return clamp(this._light.radius - this._distance, 0, 1) * Math.abs(this._normalized.x);
  }
  private get _greenOpacity(): number {
    return clamp((this._light.radius - this._distance) / (this._light.radius / 2), 0, 1) * Math.abs(this._normalized.y);
    // return clamp(this._light.radius - this._distance, 0, 1) * Math.abs(this._normalized.y);
  }
  private get _blueOpacity(): number {
    return clamp((this._light.radius - this._distance) / this._light.radius, 0, 1);
    // return clamp((this._light.radius - this._distance) / this._light.radius, 0.05, 1);
    // // return clamp(this._light.radius - this._distance, 0, 1);
  }

  private get _frontShadowVisibility(): number {
    return this._light.zIndex < this._entity.zIndex ? 1 : 0;
  }
  private get _frontShadowOpacity(): number {
    return clamp((this._light.radius - this._distance) / this._light.radius, 0, 1) * this._frontShadowVisibility;
  }

  public update(): void {
    const entity = this._entity;
    if (entity.normalMap == null) {
      return;
    }

    if (this._element == null) {
      this._createElements();
    }

    if (this._entityVersion !== entity.version || this._lightVersion !== this._light.version) {
      this._updateProperties();
    }
  }

  private _updateProperties(): void {
    const entity = this._entity;
    const light = this._light;

    if (this._lightVersion === light.version && this._entityVersion === entity.version) {
      return;
    }
    const lightUpdates = this._updates.light;
    const entityUpdates = this._updates.entity;

    const updated = [];
    if (entityUpdates.size !== entity.updates.size) {
      updated.push('size');
    } else if (lightUpdates.position !== light.updates.position || entityUpdates.position !== entity.updates.position) {
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

    this._lightVersion = light.version;
    this._entityVersion = entity.version;

    if (updated.length === 0) {
      return;
    }

    const style = this._element.style;

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
          this._distance = Math.round(light.position.subtract(entity.position).magnitude);

          const zDistance = Math.abs(this._light.zIndex - this._entity.zIndex);
          this._zModifier = Math.max(5 - zDistance, 0) / 5;
          // console.log('zModifier', zDistance, this._zModifier);
          // this._distance = this._distance * zDistance;
          entityUpdates.position = entity.updates.position;
          lightUpdates.position = light.updates.position;
        }
        // If only orientation changes, distance remains the same
        // eslint-disable-next-line no-fallthrough
        case 'orientation': {
          const redStyle = this._red.style;
          const greenStyle = this._green.style;
          const blueStyle = this._blue.style;
          const frontShadowStyle = this._frontShadowElement.style;
          const frontShadowOpacityStyle = this._frontShadowOpacityElement.style;

          this._normalized = light.position
            .subtract(entity.position).rotate(-entity.orientation, true)
            .normalize(true);

          style.translate = `${entity.left} ${entity.top}`;
          style.rotate = `${entity.orientation}deg`;
          redStyle.opacity = `${this._redOpacity}`;
          greenStyle.opacity = `${this._greenOpacity}`;
          blueStyle.opacity = `${this._blueOpacity}`;
          redStyle.filter = `url(${this._redFilter})`;
          greenStyle.filter = `url(${this._greenFilter})`;
          blueStyle.filter = `url(${this._blueFilter})`;

          frontShadowStyle.opacity = `${this._frontShadowVisibility}`;
          frontShadowOpacityStyle.opacity = `${this._frontShadowOpacity}`;

          entityUpdates.orientation = entity.updates.orientation;
          break;
        }
        case 'scale':
          this._element.style.scale = entity.scale;

          entityUpdates.scale = entity.updates.scale;
          break;
        case 'offset':
          this._redNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this._greenNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this._blueNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this._frontShadowElement.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
          this._frontShadowOpacityElement.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;

          entityUpdates.offset = entity.updates.offset;
          break;
      }
    }
  }

  private _createElements() {
    const entity = this._entity;
    const light = this._light;
    light.containerElement.insertAdjacentHTML('beforeend', `
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
        <div style="
          position: absolute;
          left: 0px;
          top: 0px;
          width: 100%;
          height: 100%;
          mix-blend-mode: lighten;
          filter: url(${this._redFilter});
          opacity: ${this._redOpacity};
        ">
          <div class="normal-map" style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            background-image: url(${entity.normalMap});
            background-position: ${entity.offset.x}px ${entity.offset.y}px;
          "></div>
        </div>
        <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            mix-blend-mode: lighten;
            filter: url(${this._greenFilter});
            opacity: ${this._greenOpacity};
        ">
          <div class="normal-map" style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            background-image: url(${entity.normalMap});
            background-position: ${entity.offset.x}px ${entity.offset.y}px;
          "></div>
        </div>
        <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            mix-blend-mode: lighten;
            filter: url(${this._blueFilter});
            opacity: ${this._blueOpacity};
        ">
          <div class="normal-map" style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            background-image: url(${entity.normalMap});
            background-position: ${entity.offset.x}px ${entity.offset.y}px;
          "></div>
        </div>
      </div>`);
    this._element = light.containerElement.lastElementChild as HTMLElement;
    [this._red, this._green, this._blue] = Array.from(this._element.children) as HTMLElement[];
    [this._redNormal, this._greenNormal, this._blueNormal] = [this._red, this._green, this._blue].map(element =>
      element.firstElementChild) as HTMLElement[];

    this._element.insertAdjacentHTML('beforeend', `
      <div class="normal-map" style="
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-image: url(${entity.normalMap});
        background-position: ${entity.offset.x}px ${entity.offset.y}px;
        filter: brightness(0);
        opacity: ${this._frontShadowVisibility};
        "></div>
      `);
    this._frontShadowElement = this._element.lastElementChild as HTMLElement;
    this._element.insertAdjacentHTML('beforeend', `
      <div class="normal-map" style="
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-image: url(${entity.normalMap});
        background-position: ${entity.offset.x}px ${entity.offset.y}px;
        filter: brightness(0) blur(2px) drop-shadow(0px 0px 2px white);
        opacity: ${this._frontShadowOpacity};
        /* scale: 0.95; */
      "></div>
      `);
    this._frontShadowOpacityElement = this._element.lastElementChild as HTMLElement;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

