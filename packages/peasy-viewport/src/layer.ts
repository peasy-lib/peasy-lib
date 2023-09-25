import { ICamera } from './camera';
import { IVector, Vector } from "./vector";
import { Viewport } from './viewport';

export interface ILayer extends Omit<Partial<Layer>, 'viewport' | 'position' | 'size' | 'parallax'> {
  viewport?: Viewport;
  position?: IVector;
  size?: IVector;
  parallax?: number | { x?: number; y?: number };
}

export class Layer {
  public camera!: ICamera;
  public id?: string;
  public name?: string;
  public size = new Vector();
  public position = new Vector();

  public zIndex?: number;

  public element?: HTMLElement;

  public image?: string;
  public repeatX = false;
  public repeatY = false;

  public canvasContext?: '2d';
  public ctx?: CanvasRenderingContext2D;

  public parallax = { x: 1, y: 1 };

  private readonly _latest = {
    camera: { x: 0, y: 0 },
  };

  public version = 0;
  public updates: Record<string, number> = {
    render: 0,
    // zIndex: 0,
  };

  private constructor(public viewport: Viewport) { }

  private _render = true;

  // private _zIndex = 0;

  public get render(): boolean {
    return this._render;
  }
  public set render(value: boolean) {
    if (this._render === value) {
      return;
    }
    this._render = value;
    this.updates.render++;
    this.version++;
  }

  // public get zIndex(): number {
  //   return this._zIndex;
  // }
  // public set zIndex(value: number) {
  //   if (this._zIndex === value) {
  //     return;
  //   }
  //   this._zIndex = value;
  //   this.updates.zIndex++;
  //   this.version++;
  // }

  public get x(): number {
    if (this.repeatX) {
      const width = this.size.x / 3;
      return ((this.position.x - this.camera.x * this.parallax.x) % width) - width;
    }
    return this.position.x - this.camera.x * this.parallax.x;
  }
  public get y(): number {
    if (this.repeatY) {
      const height = this.size.y / 3;
      return ((this.position.y - this.camera.y * this.parallax.y) % height) - height;
    }
    return this.position.y - this.camera.y * this.parallax.y;
  }

  public get isImage(): boolean {
    return this.image != null;
  }
  public get isCanvas(): boolean {
    return this.canvasContext != null;
  }

  public get limited(): boolean {
    return (!this.repeatX && this.parallax.x !== 1) || (!this.repeatY && this.parallax.y !== 1);
  }
  public get maxX(): number {
    return this.size.x !== this.viewport.size.x && this.parallax.x === 0
      ? (this.size.x - this.viewport.size.x) / this.parallax.x
      : Infinity;
  }

  public static create(input: ILayer): Layer {
    const layer = new Layer(input.viewport!);

    layer.id = input.id ?? layer.id;
    layer.name = input.name ?? layer.name;
    layer.camera = input.camera ?? layer.viewport.camera;

    layer.render = input.render ?? layer.render;

    layer.repeatX = input.repeatX ?? layer.repeatX; // Needs to be before size below!
    layer.repeatY = input.repeatY ?? layer.repeatY; // Needs to be before size below!
    layer.size.x = (input.size?.x ?? layer.viewport.size.x) * (layer.repeatX ? 3 : 1);
    layer.size.y = (input.size?.y ?? layer.viewport.size.y) * (layer.repeatY ? 3 : 1);

    layer.position.x = input.position?.x ?? layer.position.x;
    layer.position.y = input.position?.y ?? layer.position.y;

    layer.zIndex = input.zIndex;
    layer.image = input.image;
    layer.canvasContext = input.canvasContext;

    let parallax = input.parallax ?? layer.parallax;
    if (typeof parallax === 'number') {
      parallax = { x: parallax, y: parallax };
    }
    layer.parallax.x = 1 - (parallax.x ?? layer.parallax.x);
    layer.parallax.y = 1 - (parallax.y ?? layer.parallax.y);
    console.log(layer.name, layer.parallax, parallax);

    layer.update();

    return layer;
  }

  public update(): void {
    if (!this.render) {
      if (this.element != null) {
        this.element.parentElement?.removeChild(this.element);
        this.element = undefined;
      }
      return;
    }
    if (this.element == null) {
      this._createElements();
      return;
    }

    this._updateProperties();
  }

  private _updateProperties(): void {
    const latestCamera = this._latest.camera;
    const cameraX = this.camera.x;
    const cameraY = this.camera.y;
    if (cameraX !== latestCamera.x || cameraY !== latestCamera.y) {
      const style = this.element?.style as CSSStyleDeclaration;
      style.left = `${this.x}px`;
      style.top = `${this.y}px`;
      latestCamera.x = cameraX;
      latestCamera.y = cameraY;
    }
    // const entity = this._entity;
    // const light = this._light;

    // if (this._lightVersion === light.version && this._entityVersion === entity.version) {
    //   return;
    // }
    // const lightUpdates = this._updates.light;
    // const entityUpdates = this._updates.entity;

    // const updated = [];
    // if (entityUpdates.size !== entity.updates.size) {
    //   updated.push('size');
    // } else if (lightUpdates.position !== light.updates.position || entityUpdates.position !== entity.updates.position) {
    //   updated.push('position');
    // } else if (entityUpdates.orientation !== entity.updates.orientation) {
    //   updated.push('orientation');
    // }
    // if (entityUpdates.scale !== entity.updates.scale) {
    //   updated.push('scale');
    // }
    // if (entityUpdates.offset !== entity.updates.offset) {
    //   updated.push('offset');
    // }

    // this._lightVersion = light.version;
    // this._entityVersion = entity.version;

    // if (updated.length === 0) {
    //   return;
    // }

    // const style = this._element.style;

    // for (const update of updated) {
    //   // console.log('light-entity update', update, entityUpdates, entity.updates, lightUpdates, light.updates);
    //   switch (update) {
    //     case 'size':
    //       style.width = `${entity.size.x}px`;
    //       style.height = `${entity.size.y}px`;
    //       entityUpdates.size = entity.updates.size;
    //     // Also update position if size changes
    //     // eslint-disable-next-line no-fallthrough
    //     case 'position': {
    //       this._distance = Math.round(light.position.subtract(entity.position).magnitude);

    //       const zDistance = Math.abs(this._light.zIndex - this._entity.zIndex);
    //       this._zModifier = Math.max(5 - zDistance, 0) / 5;
    //       // console.log('zModifier', zDistance, this._zModifier);
    //       // this._distance = this._distance * zDistance;
    //       entityUpdates.position = entity.updates.position;
    //       lightUpdates.position = light.updates.position;
    //     }
    //     // If only orientation changes, distance remains the same
    //     // eslint-disable-next-line no-fallthrough
    //     case 'orientation': {
    //       const redStyle = this._red.style;
    //       const greenStyle = this._green.style;
    //       const blueStyle = this._blue.style;
    //       const frontShadowStyle = this._frontShadowElement.style;
    //       const frontShadowOpacityStyle = this._frontShadowOpacityElement.style;

    //       this._normalized = light.position
    //         .subtract(entity.position).rotate(-entity.orientation, true)
    //         .normalize(true);

    //       style.translate = `${entity.left} ${entity.top}`;
    //       style.rotate = `${entity.orientation}deg`;
    //       redStyle.opacity = `${this._redOpacity}`;
    //       greenStyle.opacity = `${this._greenOpacity}`;
    //       blueStyle.opacity = `${this._blueOpacity}`;
    //       redStyle.filter = `url(${this._redFilter})`;
    //       greenStyle.filter = `url(${this._greenFilter})`;
    //       blueStyle.filter = `url(${this._blueFilter})`;

    //       frontShadowStyle.opacity = `${this._frontShadowVisibility}`;
    //       frontShadowOpacityStyle.opacity = `${this._frontShadowOpacity}`;

    //       entityUpdates.orientation = entity.updates.orientation;
    //       break;
    //     }
    //     case 'scale':
    //       this._element.style.scale = entity.scale;

    //       entityUpdates.scale = entity.updates.scale;
    //       break;
    //     case 'offset':
    //       this._redNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
    //       this._greenNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
    //       this._blueNormal.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
    //       this._frontShadowElement.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;
    //       this._frontShadowOpacityElement.style.backgroundPosition = `${entity.offset.x}px ${entity.offset.y}px`;

    //       entityUpdates.offset = entity.updates.offset;
    //       break;
    //   }
    // }
  }

  private _createElements() {
    const parent = this.viewport.element;
    parent.insertAdjacentHTML('beforeend', `
      <div class="layer ${this.name ?? ''}" style="
        position: absolute;
        left: ${this.position.x}px;
        top: ${this.position.y}px;
        width: ${this.size.x}px;
        height: ${this.size.y}px;
      "></div>
      `);
    this.element = parent.lastElementChild as HTMLElement;
    if (this.isImage) {
      this.element.insertAdjacentHTML('beforeend', `
        <div class="image" style="
          background-image: url('${this.image}');
          width: 100%;
          height: 100%;
        "></div>
      `);
    }
    if (this.isCanvas) {
      this.element.insertAdjacentHTML('beforeend', `
        <canvas class="canvas" width="${this.size.x}" height="${this.size.y}" style="
          width: 100%;
          height: 100%;
        "></canvas>
        `);
      this.ctx = (this.element.lastElementChild as HTMLCanvasElement).getContext(this.canvasContext!) as CanvasRenderingContext2D;
    }
  }
}
