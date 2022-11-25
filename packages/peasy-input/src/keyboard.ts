import { Input } from "./input";
import { KeyboardMapping } from "./keyboard-mapping";

export type KeyCallback = (key: string, pressed: boolean, deltaTime: number) => void;
export type KeymapMode = 'add' | 'replace';
export type KeyEffectMode = 'instant' | 'interval';

export interface IKeyMapping {
  action: string;
  repeat: boolean;
  mapping?: KeyboardMapping;
}
// TODO: Add support for multiple keys for one action
export class Keyboard {
  private static element: HTMLElement | null;
  private static mappings: KeyboardMapping[] = [];
  // private static mappings: Map<string, KeyCallback> = new Map();
  private static readonly pressed: Map<string, { keymap: IKeyMapping, repeat: number, done: boolean, doneIs: boolean }> = new Map();
  private static lastPressed: string[] = [];

  public static initialize(element: HTMLElement) {
    this.element = element;
    this.element.addEventListener('keydown', this.keyChange);
    this.element.addEventListener('keyup', this.keyChange);
    return this;
  }

  public static terminate() {
    this.element?.removeEventListener('keydown', this.keyChange);
    this.element?.removeEventListener('keyup', this.keyChange);
    this.element = null;
  }

  public static map(mappings: string | string[] | Record<string, IKeyMapping>, callback?: KeyCallback, effectMode: KeyEffectMode = 'interval', keymapMode: KeymapMode = 'add'): KeyboardMapping {
    const mapping = new KeyboardMapping(mappings, callback, effectMode, keymapMode);
    this.mappings.unshift(mapping);
    return mapping;
  }
  public static unmap(mapping: KeyboardMapping): void {
    this.mappings = this.mappings.filter(m => m !== mapping);
    for (const key of this.pressed.keys()) {
      if (this.pressed.get(key)?.keymap.mapping === mapping) {
        this.pressed.delete(key);
      }
    }
    this.lastPressed = [...this.pressed.keys()];
  }

  public static keyChange = (event: KeyboardEvent): void => {
    let keys = event.key;
    if (['Control', 'Alt', 'Shift'].includes(keys)) {
      if (event.type === 'keydown') {
        for (const pressed of this.pressed.keys()) {
          const pressedKeys = pressed.split('+');
          if (pressedKeys.includes(keys)) {
            continue;
          }
          let modifiedPressed = pressedKeys.pop();
          for (const modifier of ['Shift', 'Alt', 'Control']) {
            if (keys === modifier || pressedKeys.includes(modifier)) {
              modifiedPressed = `${modifier}+${modifiedPressed}`;
            }
          }

          Keyboard.resolve(pressed, 'keyup');
          Keyboard.resolve(modifiedPressed as string, 'keydown');
        }
      } else if (event.type === 'keyup') {
        for (const pressed of this.pressed.keys()) {
          const pressedKeys = pressed.split('+');
          if (!pressedKeys.includes(keys)) {
            continue;
          }
          const modifiedPressed = pressedKeys.filter(key => key !== keys).join('+');

          Keyboard.resolve(pressed, 'keyup');
          Keyboard.resolve(modifiedPressed, 'keydown');
        }
      }
    } else {
      if (event.shiftKey) {
        keys = `Shift+${keys}`;
      }
      if (event.altKey) {
        keys = `Alt+${keys}`;
      }
      if (event.ctrlKey) {
        keys = `Control+${keys}`;
      }
      Keyboard.resolve(keys, event.type);
    }
  };

  public static resolve(keys: string, eventType: string) {
    const mapped = this.mapped(keys);
    if (mapped == null) {
      return;
    }

    if (mapped.mapping?.effectMode === 'instant') {
      mapped.mapping.callback?.(mapped.action, eventType === 'keydown', 0);
      return;
    }

    if (eventType === 'keydown') {
      if (!this.pressed.has(keys)) {
        this.pressed.set(keys, { keymap: mapped, repeat: 0, done: false, doneIs: false });
      }
    } else if (eventType === 'keyup') {
      this.pressed.delete(keys);
    }
  }

  public static update(deltaTime: number) {
    this.pressed.forEach((mapped, key) => {
      if (mapped.repeat === 0 || (mapped.keymap.repeat && mapped.repeat <= 0)) {
        mapped.keymap.mapping?.callback?.(mapped.keymap.action, true, deltaTime);
        mapped.repeat += Input.rps;
      } else {
        // console.log('NO REPEAT', mapped.repeat);
        if (!mapped.keymap.repeat) {
          if (!mapped.done) {
            // mapped.keymap.mapping.callback(mapped.keymap.action, false, deltaTime);
            mapped.done = true;
          }
        } else {
          mapped.repeat -= deltaTime * 1000;
        }
      }
    });
    this.lastPressed.forEach(keys => {
      if (!this.pressed.has(keys)) {
        const mapped = this.mapped(keys);
        mapped?.mapping!.callback?.(mapped.action, false, deltaTime);
      }
    });
    this.lastPressed = [...this.pressed.keys()];
  }

  public static mapped(keys: string): IKeyMapping | undefined {
    let mapped;
    for (const mapping of this.mappings) {
      mapped = mapping.maps(keys);
      if (mapped != null || mapping.keymapMode === 'replace') {
        break;
      }
    }
    return mapped;
  }

  public static is(action: string): boolean {
    for (const pressed of this.pressed.values()) {
      if (pressed.keymap.action !== action) {
        continue;
      }
      if (pressed.repeat === 0 || (pressed.keymap.repeat && pressed.repeat <= 0)) {
        return true;
      } else {
        if (!pressed.keymap.repeat && !pressed.doneIs) {
          pressed.doneIs = true;
          return true;
        }
      }
      return false;
    }
    return false;
  }
}
