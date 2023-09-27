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
  public half = new Vector();
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
    viewport.half = viewport.size.multiply(0.5);
    viewport.element = input.element as HTMLElement;
    viewport.parent = (input.parent ?? input.element?.parentElement ?? document.body) as HTMLElement;

    if (viewport.element == null) {
      viewport._createElements();
    }

    Viewport.viewports.push(viewport);

    return viewport;
  }

  public destroy(): void {
    Viewport.viewports.splice(Viewport.viewports.indexOf(this), 1);
    this.parent.removeChild(this.element);
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
  public removeLayers(layers?: Layer | Layer[]): void {
    if (layers == null) {
      layers = [...this.layers];
    }
    if (!Array.isArray(layers)) {
      layers = [layers];
    }
    layers.forEach(layer => layer.destroy());
    this.layers = this.layers.filter(layer => !(layers as Layer[]).includes(layer));
  }

  public getLayers(name: string): Layer[] {
    return this.layers.filter(layer => layer.name === name);
  }
  public getLayer(name: string): Layer | undefined {
    return this.layers.find(layer => layer.name === name);
  }

  public translate(point: Vector, from: Layer | null, to: Layer | null): Vector {
    const converted = point.clone();
    if (from != null) {
      converted.add(from.position, true);
      // converted.add(new Vector(from.x, from.y), true);
      // converted.subtract(from.origin, true);
      converted.add(from.origin, true);
      // converted.subtract(from.viewport.size.negHalf, true);
    }
    if (to != null) {
      converted.add(to.origin, true);
      converted.subtract(to.position, true);
      // converted.subtract(new Vector(to.x, to.y), true);
      // converted.add(new Vector(to.camera.x, to.camera.y), true);
    }
    return converted;
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
