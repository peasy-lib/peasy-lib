import { IKeyMapping, Keyboard, KeyCallback, KeyEffectMode, KeymapMode } from "./keyboard";
import { KeyboardMapping } from "./keyboard-mapping";
import { Mouse } from "./mouse";
import { MouseMapping } from "./mouse-mapping";

export type InputCallback = KeyCallback;
export type InputEffectMode = KeyEffectMode;

export class Input {
  private static initialized = false;
  public static rps: number;

  public static initialize(rps: number, rAF = true, element = document.body) {
    Input.initialized = true;
    this.rps = rps;
    Keyboard.initialize(element);
    Mouse.initialize();

    if (rAF === true) {
      let last: number;
      const start = (now: number) => {
        last = now;
        requestAnimationFrame(tick);
      };
      const tick = (now: number) => {
        const deltaTime = (now - last) / 1000;
        last = now;
        Input.update(deltaTime);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(start);
      return;
    }
    return this;
  }

  public static terminate() {
    Keyboard.terminate();
    Mouse.terminate();
  }

  public static map(mappings: any, callback?: InputCallback, effectMode: InputEffectMode = 'interval', keymapMode: KeymapMode = 'add'): KeyboardMapping {
    if (!Input.initialized) {
      Input.initialize(60);
    }
    return Keyboard.map(mappings, callback, effectMode, keymapMode);
  }
  public static unmap(mapping: KeyboardMapping | MouseMapping): void {
    if (mapping instanceof KeyboardMapping) {
      Keyboard.unmap(mapping);
    } else {
      Mouse.unmap(mapping);
    }
  }

  public static update(deltaTime: number) {
    Keyboard.update(deltaTime);
    Mouse.update(deltaTime);
  }

  public static is(action: string): boolean {
    if (!Input.initialized) {
      Input.initialize(60);
    }
    return Keyboard.is(action) || Mouse.is(action);
  }
}
