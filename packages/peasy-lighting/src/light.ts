import { Entity } from "./entity";
import { LightEntity } from "./light-entity";
import { Lighting } from "./lighting";
import { IVector, Vector } from "./vector";
import { Viewport } from "./viewport";

export interface ILight extends Partial<Omit<Light, 'viewport'>> {
  viewport: Viewport | HTMLElement;
}

export interface IExternalLight {
  position: IVector;
  radius: number;
  zIndex?: number;
  color?: string;
}

export class Light {
  public entity!: IExternalLight;
  public id!: string;

  public containerElement!: HTMLElement;

  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
    zIndex: 0,
  };
  private readonly _updated: Set<string> = new Set();

  private _position: Vector = new Vector();
  private _radius = 0;
  private _zIndex = 0;
  private _size = 0;
  private _displayDistance = 0;
  private _display!: 'inline-block' | 'none';
  private _color!: string;
  private _gradientSteps: string | (number | string)[] = [];
  private _gradient!: string;

  private _viewport!: Viewport;
  private _colorElement!: HTMLElement;
  private _lightElement!: HTMLElement;

  private readonly _entities: WeakMap<Entity, LightEntity> = new WeakMap();

  public get position(): Vector {
    return this._position;
  }
  public set position(value: IVector) {
    if (value.x === this._position.x && value.y === this._position.y) {
      if (value instanceof Vector) {
        this._position = value;
      }
      return;
    }
    this._position = value instanceof Vector ? value : new Vector(value.x, value.y);
    this._updated.add('position');
    this.updates.position++;
    this.version++;
  }

  public get x(): number {
    return this._position.x;
  }
  public set x(value: number) {
    if (this._position.x === value) {
      return;
    }
    this._position.x = value;
    this._updated.add('position');
    this.updates.position++;
    this.version++;
  }
  public get y(): number {
    return this._position.y;
  }
  public set y(value: number) {
    if (this._position.y === value) {
      return;
    }
    this._position.y = value;
    this._updated.add('position');
    this.updates.position++;
    this.version++;
  }

  public get radius(): number {
    return this._radius;
  }
  public set radius(value: number) {
    if (value === this._radius) {
      return;
    }
    this._radius = value;
    const max = Math.max(this._viewport.size.x, this._viewport.size.y);
    const distance = (max / 2) + this._radius;
    if (distance > this._displayDistance) {
      this._displayDistance = distance;
      this._size = (max + this._radius) * 2;

      this._updated.add('size');
      this._updated.add('position');
      // this.updates.size++;
      this.updates.position++;
      this.version++;
    }
    if (Array.isArray(this._gradientSteps)) {
      this._updateGradient();
      this._updated.add('gradient');
    }
  }

  public get zIndex(): number {
    return this._zIndex;
  }
  public set zIndex(value: number) {
    if (this._zIndex === value) {
      return;
    }
    this._zIndex = value;
    this.updates.zIndex++;
    this.version++;
  }

  public get color(): string {
    return this._color;
  }
  public set color(value: string) {
    if (value === this._color) {
      return;
    }
    this._color = value;
    this._updated.add('color');
  }

  public get gradientSteps(): string | (number | string)[] {
    return this._gradientSteps;
  }
  public set gradientSteps(value: string | (number | string)[]) {
    if (typeof value === 'string') {
      this._gradientSteps = value;
      this._updated.add('gradient');
      return;
    }
    let different = value.length !== this._gradientSteps.length;
    if (!different) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== this._gradientSteps[i]) {
          different = true;
          break;
        }
      }
    }
    if (!different) {
      return;
    }
    this._gradientSteps = value;
    this._gradient = this._gradientSteps.join(',');
    this._updated.add('gradient');
    return;
  }

  private get left(): number {
    return this._position.x - (this._size / 2);
  }
  private get top(): number {
    return this._position.y - (this._size / 2);
  }

  private constructor() {
    this.color = 'white';
    this.gradientSteps = ['white', 0.25, 'black', 1];
  }

  public static create(input: ILight | IExternalLight): Light {
    const light = new Light();

    light.entity = (input as ILight).entity ?? input as IExternalLight;

    light.id = (input as ILight).id as string;
    light._viewport = Lighting.addViewport((input as ILight).viewport);
    light.position = new Vector(light.entity.position.x, light.entity.position.y);
    light.radius = light.entity.radius ?? light.radius;
    light.zIndex = light.entity.zIndex ?? light.zIndex;
    light.color = light.entity.color ?? light.color;

    // light._position = input.position ?? light._position;
    // light.radius = input.radius ?? light.radius;
    // light.zIndex = input.zIndex ?? light._zIndex;
    // light.color = input.color ?? light.color;

    return light;
  }

  public update(): void {
    if (this._viewport == null) {
      return;
    }
    if (this._lightElement == null) {
      this._createElements();

      this._updated.add('size');
      this._updated.add('position');
      this._updated.add('gradient');
      this._updated.add('color');
      // this.updates.size++;
      this.updates.position++;
      this.version++;
    }
    this._updateFromEntity();
    this._updateProperties();
    this._updated.clear();

    Lighting.entities.forEach((entity) => {
      if (!this._entities.has(entity)) {
        this._entities.set(entity, LightEntity.create({ light: this, entity }));
      }
      this._entities.get(entity)!.update();
    });
  }

  private _updateFromEntity(): void {
    this.position = this.entity.position;
    if (this.entity.radius != null) {
      this.radius = this.entity.radius;
    }
    if (this.entity.zIndex != null) {
      this.zIndex = this.entity.zIndex;
    }
    if (this.entity.color != null) {
      this.color = this.entity.color;
    }
  }

  private _updateProperties(): void {
    for (const update of this._updated) {
      // console.log('Updating light:', update);
      switch (update) {
        case 'size':
          this._lightElement.style.width = `${this._size}px`;
          this._lightElement.style.height = `${this._size}px`;
          break;
        case 'position': {
          // console.log('Update light', this._color, this.position);
          const distance = this.position.subtract(this._viewport.position);
          const outside = Math.abs(distance.x) > this._displayDistance || Math.abs(distance.y) > this._displayDistance;
          const display = outside ? 'none' : 'inline-block';
          // console.log('display', outside, display !== this._display, this.position, this._viewport.position);
          if (display !== this._display) {
            this._display = display;
            this._colorElement.style.display = this._display;
          }
          if (display !== 'none') {
            this._lightElement.style.translate = `${this.left}px ${this.top}px`;
          }
          break;
        }
        case 'color':
          this._colorElement.style.background = this._color;
          break;
        case 'gradient':
          this._lightElement.style.background = `radial-gradient(${this._gradient})`;
          break;
      }
    }
  }

  private _updateGradient(): void {
    const steps = [];
    for (let i = 0, ii = this._gradientSteps.length; i < ii; i += 2) {
      const [color, step] = this._gradientSteps.slice(i, i + 2);
      steps.push(`${color} ${typeof step === 'number' ? `${this._radius * step}px` : step}`);
    }
    this._gradient = steps.join(',');
  }

  private _createElements() {
    this._viewport.vail.insertAdjacentHTML('beforeend', `
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
    this._colorElement = this._viewport.vail.lastElementChild as HTMLElement;
    this.containerElement = this._colorElement.firstElementChild as HTMLElement;
    this._lightElement = this.containerElement.firstElementChild as HTMLElement;
  }
}
