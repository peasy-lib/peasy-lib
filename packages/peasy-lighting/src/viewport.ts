import { Vector } from './vector';
export interface IViewport extends Partial<Viewport> { }

export class Viewport {
  public id!: string;

  public element!: HTMLElement;

  public vail!: HTMLElement;

  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
  };
  #updated: Set<string> = new Set();

  #size: Vector = new Vector();
  #position: Vector = new Vector();
  #calculatedPosition = true;
  #color = 'black';

  public get size(): Vector {
    return this.#size;
  }
  public set size(value: Vector) {
    if (value.x === this.#size.x && value.y === this.#size.y) {
      this.#size = value;
      return;
    }
    this.#size = value;
    if (this.#calculatedPosition) {
      this.#position = this.#size.divide(2);
      // this.#updated.add('position');
      this.updates.position++;
      this.version++;
    }
  }

  public get width(): number {
    return this.#size.x;
  }
  public set width(value: number) {
    if (this.#size.x === value) {
      return;
    }
    this.#size.x = value;
    if (this.#calculatedPosition) {
      this.#position = this.#size.divide(2);
      // this.#updated.add('position');
      this.updates.position++;
      this.version++;
    }
  }
  public get height(): number {
    return this.#size.y;
  }
  public set height(value: number) {
    if (this.#size.y === value) {
      return;
    }
    this.#size.y = value;
    if (this.#calculatedPosition) {
      this.#position = this.#size.divide(2);
      // this.#updated.add('position');
      this.updates.position++;
      this.version++;
    }
  }

  public get position(): Vector {
    return this.#position;
  }
  public set position(value: Vector) {
    if (value.x === this.#position.x && value.y === this.#position.y) {
      this.#position = value;
      return;
    }
    this.#position = value;
    // this.#updated.add('position');
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
    // this.#updated.add('position');
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
    // this.#updated.add('position');
    this.updates.position++;
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

  public static create(input: IViewport): Viewport {
    const viewport = new Viewport();

    viewport.id = input.id as string;
    viewport.element = input.element ?? viewport.element;
    viewport.color = input.color ?? viewport.color;

    if (input.size != null) {
      viewport.size = input.size;
    } else {
      const rect = viewport.element.getBoundingClientRect();
      viewport.size = new Vector(rect.width, rect.height);
    }
    viewport.#position = input.position ?? viewport.#position;
    viewport.#calculatedPosition = input.position == null;

    viewport.#updated.add('position');
    viewport.#updated.add('color');
    viewport.updates.position++;
    viewport.update();

    return viewport;
  }

  public update(): void {
    if (this.element == null) {
      return;
    }

    if (this.vail == null) {
      this.#createElements();

      // this.#updated.add('position');
      this.#updated.add('color');
      this.updates.position++;
      this.version++;
    }

    this.#updateProperties();
    this.#updated.clear();
  }

  #createElements(): void {
    this.element.insertAdjacentHTML('beforeend', `
    <div class="vail" style="
      display: inline-block;
      position: absolute;
      left: 0px;
      top: 0px;
      width: 100%;
      height: 100%;
      background-color: ${this.#color};
      mix-blend-mode: multiply;
      image-rendering: pixelated;
    "></div>`);
    this.vail = this.element.lastElementChild as HTMLElement;
  }

  #updateProperties(): void {
    for (const update of this.#updated) {
      console.log('Updating viewport:', update);
      switch (update) {
        // case 'size':
        //   this.#lightElement.style.width = `${this.#margin * 2}px`;
        //   this.#lightElement.style.height = `${this.#margin * 2}px`;
        //   break;
        case 'color':
          this.vail.style.backgroundColor = this.#color;
          break;
      }
    }
  }
}
