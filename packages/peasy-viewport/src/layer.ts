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
  public sizeRepeated = new Vector();
  public position = new Vector();
  public origin = new Vector();

  public zIndex?: number;

  public element?: HTMLElement;
  public contentElement?: HTMLElement;
  public ownsContentElement = true;
  public before?: HTMLElement;

  public image?: string;
  public repeatX = false;
  public repeatY = false;

  public canvasContext?: '2d';
  public ctx?: CanvasRenderingContext2D;

  public parallax = { x: 1, y: 1 };

  private readonly _latest = {
    camera: { x: 0, y: 0, zoom: 1 },
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
    const x = this.position.x - (this.size.x / 2) + this.viewport.half.x;
    const camera = this.camera.x * this.parallax.x;
    if (this.repeatX) {
      const width = this.size.x;
      return ((x - camera) % width) - width;
    }
    return x - camera;
  }
  public get y(): number {
    const y = this.position.y - (this.size.y / 2) + this.viewport.half.y;
    const camera = this.camera.y * this.parallax.y;
    if (this.repeatY) {
      const height = this.size.y;
      return ((y - camera) % height) - height;
    }
    return y - camera;
  }
  // public get x(): number {
  //   const zoom = this.camera.zoom;
  //   const x = this.position.x * zoom;
  //   const camera = this.camera.x * this.parallax.x * zoom;
  //   let centering = this.size.x / 2 * zoom;
  //   if (this.repeatX) {
  //     centering /= 3;
  //     const width = this.size.x * zoom / 3;
  //     return ((x - camera) % width) - width + centering;
  //   }
  //   return x - camera + centering;
  // }
  // public get y(): number {
  //   const zoom = this.camera.zoom;
  //   const y = this.position.y - (this.size.y * zoom / 2) + this.viewport.half.y;
  //   const camera = this.camera.y * this.parallax.y * zoom;
  //   // const centering = ((this.size.x / 2) - this.viewport.half.y) * zoom;
  //   return y - camera;

  //   // const y = this.position.y * zoom;
  //   // const camera = this.camera.y * this.parallax.y * zoom;
  //   // // const centering = this.viewport.half.y * zoom;
  //   // let centering = this.size.y / 2 * zoom;
  //   // if (this.repeatY) {
  //   //   centering /= 3;
  //   //   const height = this.size.y * zoom / 3;
  //   //   console.log('y', this.name, y - (this.camera.y * this.parallax.y), this.position.y - camera);
  //   //   return ((y - camera) % height) - height + centering;
  //   // }
  //   // console.log('y', this.name, y - (this.camera.y * this.parallax.y), this.position.y - camera);
  //   // return y - camera + centering;
  // }

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

    layer.repeatX = input.repeatX ?? layer.repeatX; // Needs to be before sizeRepeated below!
    layer.repeatY = input.repeatY ?? layer.repeatY; // Needs to be before sizeRepeated below!
    layer.size.x = (input.size?.x ?? layer.viewport.size.x);
    layer.size.y = (input.size?.y ?? layer.viewport.size.y);
    layer.sizeRepeated.x = layer.size.x * (layer.repeatX ? 3 : 1);
    layer.sizeRepeated.y = layer.size.y * (layer.repeatY ? 3 : 1);

    layer.position.x = input.position?.x ?? layer.position.x;
    layer.position.y = input.position?.y ?? layer.position.y;

    if (input.parallax != null) {
      layer.origin = layer.viewport.half.clone();
    }

    layer.zIndex = input.zIndex;
    layer.image = input.image;
    layer.canvasContext = input.canvasContext;

    let parallax = input.parallax ?? layer.parallax;
    if (typeof parallax === 'number') {
      parallax = { x: parallax, y: parallax };
    }
    layer.parallax.x = 1 - (parallax.x ?? layer.parallax.x);
    layer.parallax.y = 1 - (parallax.y ?? layer.parallax.y);

    layer.before = input.before ?? layer.before;

    const contentElement = input.element;
    if (contentElement != null) {
      layer.contentElement = contentElement;
      layer.ownsContentElement = false;
    }

    layer.update();

    return layer;
  }

  public destroy(): void {
    this.viewport.element.removeChild(this.element!);
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
    // const zoom = this.camera.zoom;
    if (cameraX !== latestCamera.x || cameraY !== latestCamera.y /* || zoom !== latestCamera.zoom */) {
      const style = this.element?.style as CSSStyleDeclaration;
      style.left = `${this.x}px`;
      style.top = `${this.y}px`;
      latestCamera.x = cameraX;
      latestCamera.y = cameraY;
      // if (zoom !== latestCamera.zoom) {
      //   style.scale = `${zoom}`;
      //   style.width = `${this.size.x * zoom}px`;
      //   style.height = `${this.size.y * zoom}px`;
      //   latestCamera.zoom = zoom;
      // }
    }
  }

  private _createElements() {
    const parent = this.viewport.element;
    const container = parent.ownerDocument.createElement('div');
    // parent.insertAdjacentHTML('beforeend', `
    container.innerHTML = `
      <div class="layer ${this.name ?? ''}" ${this.id ? ` id="${this.id}"` : ''} style = "
        position: absolute;
        left: ${this.x}px;
        top: ${this.y}px;
        width: ${this.sizeRepeated.x}px;
        height: ${this.sizeRepeated.y}px;
        /* scale: ${this.camera.zoom}; */
      "></div>
      `;
    // `);
    // this.element = parent.lastElementChild as HTMLElement;
    this.element = container.firstElementChild as HTMLElement;

    const before = this.before instanceof Layer ? this.before.element : this.before;
    parent.insertBefore(this.element, before ?? null);

    if (this.contentElement != null) {
      this.element.insertBefore(this.contentElement, null);
    } else {
      if (this.isImage) {
        this.element.insertAdjacentHTML('beforeend', `
        <div class="image" style="
        background-image: url('${this.image}');
        width: 100%;
        height: 100%;
        "></div>
        `);
        this.contentElement = this.element.lastElementChild as HTMLElement;
      }
      if (this.isCanvas) {
        this.element.insertAdjacentHTML('beforeend', `
        <canvas class="canvas" width="${this.size.x}" height="${this.size.y}" style="
        width: 100%;
        height: 100%;
        "></canvas>
        `);
        this.contentElement = this.element.lastElementChild as HTMLElement;
      }
    }
    if (this.isCanvas) {
      this.ctx = (this.contentElement as HTMLCanvasElement).getContext(this.canvasContext!) as CanvasRenderingContext2D;
    }
  }
}
