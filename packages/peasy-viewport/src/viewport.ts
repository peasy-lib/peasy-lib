import { Camera, ICamera } from './camera';
import { ILayer, Layer } from './layer';
import { IVector, Vector } from './vector';

export interface IViewport extends Omit<Partial<Viewport>, 'size'> {
  size: IVector;
}

export class Viewport {
  public static viewports: Viewport[] = [];

  public layers: Layer[] = [];
  public camera!: ICamera;
  public size = new Vector();
  public parent!: HTMLElement;
  public element!: HTMLElement;

  public get maxX(): number {
    const limited = this.layers.filter(layer => layer.limited);
    const limits = limited.map(layer => layer.maxX);
    return Math.min(...limits);
  }

  public static initialize(): void {
    // Trigger updates
  }

  public static update() {
    this.viewports.forEach(viewport => viewport.update());
  }

  public static create(input: IViewport): Viewport {
    const viewport = new Viewport();

    viewport.camera = input.camera ?? new Camera();
    viewport.size.x = input.size.x;
    viewport.size.y = input.size.y;
    viewport.element = input.element as HTMLElement;
    viewport.parent = (input.parent ?? input.element?.parentElement ?? document.body) as HTMLElement;

    if (viewport.element == null) {
      viewport._createElements();
    }

    Viewport.viewports.push(viewport);

    return viewport;
  }

  public static destroy(viewport: Viewport): void {
  }

  public addLayers(layers: Layer | ILayer | (Layer | ILayer)[]): Layer[] {
    if (!Array.isArray(layers)) {
      layers = [layers];
    }
    return layers.map(input => {
      const layer = input instanceof Layer ? input : Layer.create({ ...{ viewport: this }, ...input });
      this.layers.push(layer);
      return layer;
    });
  }

  public update(): void {
    this.layers.forEach(layer => layer.update());
  }

  private _createElements(): void {
    this.parent.insertAdjacentHTML('beforeend', `
      <div class="viewport" style="
        overflow: hidden;
        position: relative;
        width: ${this.size.x}px;
        height: ${this.size.y}px;
      "></div>`
    );
    this.element = this.parent.lastElementChild as HTMLElement;
  }
}
