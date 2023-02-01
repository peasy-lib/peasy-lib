import { Entity } from "./entity";
import { LightEntity } from "./light-entity";
import { Lighting } from "./lighting";
import { Vector } from "./vector";
import { Viewport } from "./viewport";

export interface ILight extends Partial<Omit<Light, 'viewport'>> {
  viewport: Viewport | HTMLElement;
}

export class Light {
  public id!: string;

  public containerElement!: HTMLElement;

  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
    zIndex: 0,
  };
  #updated: Set<string> = new Set();

  #position: Vector = new Vector();
  #radius = 0;
  #zIndex = 0;
  #size = 0;
  #displayDistance = 0;
  #display!: 'inline-block' | 'none';
  #color!: string;
  #gradientSteps: string | (number | string)[] = [];
  #gradient!: string;

  #viewport!: Viewport;
  #colorElement!: HTMLElement;
  #lightElement!: HTMLElement;

  #entities: WeakMap<Entity, LightEntity> = new WeakMap();

  public get position(): Vector {
    return this.#position;
  }
  public set position(value: Vector) {
    if (value.x === this.#position.x && value.y === this.#position.y) {
      this.#position = value;
      return;
    }
    this.#position = value;
    this.#updated.add('position');
    this.updates.position++;
    this.version++;
  }

  public get x(): number {
    return this.#position.x;
  }
  public set x(value: number) {
    if (this.#position.x === value) {
      return;
    }
    this.#position.x = value;
    this.#updated.add('position');
    this.updates.position++;
    this.version++;
  }
  public get y(): number {
    return this.#position.y;
  }
  public set y(value: number) {
    if (this.#position.y === value) {
      return;
    }
    this.#position.y = value;
    this.#updated.add('position');
    this.updates.position++;
    this.version++;
  }

  public get radius(): number {
    return this.#radius;
  }
  public set radius(value: number) {
    if (value === this.#radius) {
      return;
    }
    this.#radius = value;
    const max = Math.max(this.#viewport.size.x, this.#viewport.size.y);
    const distance = (max / 2) + this.#radius;
    if (distance > this.#displayDistance) {
      this.#displayDistance = distance;
      this.#size = (max + this.#radius) * 2;

      this.#updated.add('size');
      this.#updated.add('position');
      // this.updates.size++;
      this.updates.position++;
      this.version++;
    }
    if (Array.isArray(this.#gradientSteps)) {
      this.#updateGradient();
      this.#updated.add('gradient');
    }
  }

  public get zIndex(): number {
    return this.#zIndex;
  }
  public set zIndex(value: number) {
    if (this.#zIndex === value) {
      return;
    }
    this.#zIndex = value;
    this.updates.zIndex++;
    this.version++;
  }

  public get color(): string {
    return this.#color;
  }
  public set color(value: string) {
    if (value === this.#color) {
      return;
    }
    this.#color = value;
    this.#updated.add('color');
  }

  public get gradientSteps(): string | (number | string)[] {
    return this.#gradientSteps;
  }
  public set gradientSteps(value: string | (number | string)[]) {
    if (typeof value === 'string') {
      this.#gradientSteps = value;
      this.#updated.add('gradient');
      return;
    }
    let different = value.length !== this.#gradientSteps.length;
    if (!different) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== this.#gradientSteps[i]) {
          different = true;
          break;
        }
      }
    }
    if (!different) {
      return;
    }
    this.#gradientSteps = value;
    this.#gradient = this.#gradientSteps.join(',');
    this.#updated.add('gradient');
    return;
  }

  private get left(): number {
    return this.#position.x - (this.#size / 2);
  }
  private get top(): number {
    return this.#position.y - (this.#size / 2);
  }

  private constructor() {
    this.color = 'white';
    this.gradientSteps = ['white', 0.25, 'black', 1];
  }

  public static create(input: ILight): Light {
    const light = new Light();

    light.id = input.id as string;
    light.#viewport = Lighting.addViewport(input.viewport);
    light.#position = input.position ?? light.#position;
    light.radius = input.radius ?? light.radius;
    light.zIndex = input.zIndex ?? light.#zIndex;
    light.color = input.color ?? light.color;

    return light;
  }

  public update(): void {
    if (this.#viewport == null) {
      return;
    }
    if (this.#lightElement == null) {
      this.#createElements();

      this.#updated.add('size');
      this.#updated.add('position');
      this.#updated.add('gradient');
      this.#updated.add('color');
      // this.updates.size++;
      this.updates.position++;
      this.version++;
    }
    this.#updateProperties();
    this.#updated.clear();

    Lighting.entities.forEach((entity) => {
      if (!this.#entities.has(entity)) {
        this.#entities.set(entity, LightEntity.create({ light: this, entity }));
      }
      this.#entities.get(entity)!.update();
    });
  }

  #updateProperties(): void {
    for (const update of this.#updated) {
      // console.log('Updating light:', update);
      switch (update) {
        case 'size':
          this.#lightElement.style.width = `${this.#size}px`;
          this.#lightElement.style.height = `${this.#size}px`;
          break;
        case 'position': {
          // console.log('Update light', this.#color, this.position);
          const distance = this.position.subtract(this.#viewport.position);
          const outside = Math.abs(distance.x) > this.#displayDistance || Math.abs(distance.y) > this.#displayDistance;
          const display = outside ? 'none' : 'inline-block';
          // console.log('display', outside, display !== this.#display, this.position, this.#viewport.position);
          if (display !== this.#display) {
            this.#display = display;
            this.#colorElement.style.display = this.#display;
          }
          if (display !== 'none') {
            this.#lightElement.style.translate = `${this.left}px ${this.top}px`;
          }
          break;
        }
        case 'color':
          this.#colorElement.style.background = this.#color;
          break;
        case 'gradient':
          this.#lightElement.style.background = `radial-gradient(${this.#gradient})`;
          break;
      }
    }
  }

  #updateGradient(): void {
    const steps = [];
    for (let i = 0, ii = this.#gradientSteps.length; i < ii; i += 2) {
      const [color, step] = this.#gradientSteps.slice(i, i + 2);
      steps.push(`${color} ${typeof step === 'number' ? `${this.#radius * step}px` : step}`);
    }
    this.#gradient = steps.join(',');
  }

  #createElements() {
    this.#viewport.vail.insertAdjacentHTML('beforeend', `
      <div class="color" style="
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        mix-blend-mode: screen;
        background-color: ${this.color};
      ">
        <div class="container" style="
          position: absolute;
          left: 0px;
          top: 0px;
          width: 100%;
          height: 100%;
          mix-blend-mode: multiply;
        ">
          <div class="light" style="
            display: inline-block;
            position: absolute;
            left: 0px;
            top: 0px;
            /* mix-blend-mode: screen; */
          "></div>
        </div>
      </div>`);
    this.#colorElement = this.#viewport.vail.lastElementChild as HTMLElement;
    this.containerElement = this.#colorElement.firstElementChild as HTMLElement;
    this.#lightElement = this.containerElement.firstElementChild as HTMLElement;
  }
}
