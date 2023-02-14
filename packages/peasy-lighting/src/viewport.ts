import { Entity } from './entity';
import { Lighting } from './lighting';
import { MaskEntity } from './mask-entity';
import { Vector } from './vector';

export interface IViewport extends Partial<Viewport> {
  useMask?: boolean;
  addEntityMasks?: boolean;
}

export class Viewport {
  public id!: string;

  public element!: HTMLElement;

  public vail!: HTMLElement;
  public mask!: HTMLElement;

  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
  };
  private readonly _updated: Set<string> = new Set();

  private _size: Vector = new Vector();
  private _position: Vector = new Vector();
  private _calculatedPosition = true;
  private _color = 'black';

  private _root!: HTMLElement;
  private _customVail = false;

  private _useMask: boolean = false;
  private _addEntityMasks!: boolean;

  private readonly _entities: WeakMap<Entity, MaskEntity> = new WeakMap();

  public get size(): Vector {
    return this._size;
  }
  public set size(value: Vector) {
    if (value.x === this._size.x && value.y === this._size.y) {
      this._size = value;
      return;
    }
    this._size = value;
    if (this._calculatedPosition) {
      this._position = this._size.divide(2);
      // this._updated.add('position');
      this.updates.position++;
      this.version++;
    }
  }

  public get width(): number {
    return this._size.x;
  }
  public set width(value: number) {
    if (this._size.x === value) {
      return;
    }
    this._size.x = value;
    if (this._calculatedPosition) {
      this._position = this._size.divide(2);
      // this._updated.add('position');
      this.updates.position++;
      this.version++;
    }
  }
  public get height(): number {
    return this._size.y;
  }
  public set height(value: number) {
    if (this._size.y === value) {
      return;
    }
    this._size.y = value;
    if (this._calculatedPosition) {
      this._position = this._size.divide(2);
      // this._updated.add('position');
      this.updates.position++;
      this.version++;
    }
  }

  public get position(): Vector {
    return this._position;
  }
  public set position(value: Vector) {
    if (value.x === this._position.x && value.y === this._position.y) {
      this._position = value;
      return;
    }
    this._position = value;
    // this._updated.add('position');
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
    // this._updated.add('position');
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
    // this._updated.add('position');
    this.updates.position++;
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

  public static create(input: IViewport): Viewport {
    const viewport = new Viewport();

    viewport.id = input.id as string;
    viewport.element = input.element ?? viewport.element;
    viewport.color = input.color ?? viewport.color;

    viewport.vail = input.vail as HTMLElement; // Can be undefined, which is fine
    viewport.mask = input.mask as HTMLElement; // Can be undefined, which is fine

    viewport._useMask = input.useMask ?? (input.mask != null ? true : viewport._useMask);
    viewport._addEntityMasks = input.addEntityMasks ?? viewport._useMask;

    if (input.size != null) {
      viewport.size = input.size;
    } else {
      const rect = viewport.element.getBoundingClientRect();
      viewport.size = new Vector(rect.width, rect.height);
    }
    viewport._position = input.position ?? viewport._position;
    viewport._calculatedPosition = input.position == null;

    viewport._updated.add('position');
    viewport._updated.add('color');
    viewport.updates.position++;
    viewport.update();

    return viewport;
  }

  public update(): void {
    if (this.element == null) {
      return;
    }

    if (this._root == null) {
      this._createElements();

      // this._updated.add('position');
      this._updated.add('color');
      this.updates.position++;
      this.version++;
    }

    this._updateProperties();
    this._updated.clear();

    if (this._addEntityMasks) {
      Lighting.entities.forEach((entity) => {
        if (!this._entities.has(entity)) {
          this._entities.set(entity, MaskEntity.create({ maskElement: this.mask, entity }));
        }
        this._entities.get(entity)!.update();
      });
    }
  }

  private _updateProperties(): void {
    for (const update of this._updated) {
      console.log('Updating viewport:', update);
      switch (update) {
        // case 'size':
        //   this._lightElement.style.width = `${this._margin * 2}px`;
        //   this._lightElement.style.height = `${this._margin * 2}px`;
        //   break;
        case 'color':
          if (!this._customVail) {
            this.vail.style.backgroundColor = this._color;
          }
          break;
      }
    }
  }

  private _createElements(): void {
    this.element.insertAdjacentHTML('beforeend', `
    <div class="peasy-lighting" style="
      display: inline-block;
      position: absolute;
      left: 0px;
      top: 0px;
      width: 100%;
      height: 100%;
      pointer-events: none;
      mix-blend-mode: multiply;
    "></div>`);
    this._root = this.element.lastElementChild as HTMLElement;

    if (this.mask != null) {
      this._root.append(this.mask);
    } else {
      this._root.insertAdjacentHTML('beforeend', `
      <div class="peasy-lighting-mask" style="
        display: inline-block;
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: ${this._useMask ? 'white' : 'black'};
      "></div>`);
      this.mask = this._root.lastElementChild as HTMLElement;
    }
    if (this.vail != null) {
      this._customVail = true;
      this._root.append(this.vail);
    } else {
      this._root.insertAdjacentHTML('beforeend', `
      <div class="peasy-lighting-vail" style="
        display: inline-block;
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: ${this._color};
        mix-blend-mode: screen;
      "></div>`);
      this.vail = this._root.lastElementChild as HTMLElement;
    }
  }
}
