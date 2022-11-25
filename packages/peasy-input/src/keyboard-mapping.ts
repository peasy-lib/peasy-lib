import { IKeyMapping, Keyboard, KeyCallback, KeyEffectMode, KeymapMode } from "./keyboard";

export class KeyboardMapping {
  public constructor(
    public mappings: string | string[] | Record<string, IKeyMapping>,
    public callback: KeyCallback | undefined,
    public effectMode: KeyEffectMode,
    public keymapMode: KeymapMode,
  ) {
    if (typeof this.mappings === 'string') {
      this.mappings = [this.mappings];
    }
    if (Array.isArray(this.mappings)) {
      this.mappings = [...this.mappings].reduce((mappings, value) => {
        (mappings as any)[value] = value;
        return mappings;
      }, {});
    }
    for (const key in this.mappings) {
      const action = this.mappings[key];
      if (typeof action === 'string') {
        this.mappings[key] = {
          action: action,
          repeat: true,
        };
      }
      this.mappings[key].mapping = this;
    }
  }

  public maps(keys: string): IKeyMapping | undefined {
    return (this.mappings as any)[keys];
  }

  public unmap(): void {
    Keyboard.unmap(this);
  }

  // public addMapping(keys: string | string[], callback: KeyCallback) {
  //   if (!Array.isArray(keys)) {
  //     keys = [keys];
  //   }
  //   keys.forEach(key => this.mappings.set(key, callback));
  // }
  // public removeMapping(key: string) {
  //   this.mappings.delete(key);
  // }
}
