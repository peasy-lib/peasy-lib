import { Mouse } from "./mouse";

export class MouseMapping {
  public constructor(
  ) {
  }
  public unmap(): void {
    Mouse.unmap(this);
  }
}
