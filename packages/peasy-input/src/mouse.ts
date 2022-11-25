import { MouseMapping } from "./mouse-mapping";

export type MouseCallback = (key: string, pressed: boolean, deltaTime: number) => void;
export type MouseEffectMode = 'instant' | 'interval';

export class Mouse {
  private static mappings: MouseMapping[] = [];

  public static initialize() {
    return this;
  }

  public static terminate() { }

  public static map(): MouseMapping {
    const mapping = new MouseMapping();
    this.mappings.unshift(mapping);
    return mapping;
  }
  public static unmap(mapping: MouseMapping): void {
    this.mappings = this.mappings.filter(m => m !== mapping);
  }

  public static update(deltaTime: number) { }

  public static is(action: string): boolean {
    return false;
  }
}
