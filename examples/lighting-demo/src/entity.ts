export interface IVector {
  x: number;
  y: number;
}

export class Entity {
  public element!: HTMLElement;

  public offset: IVector = { x: 0, y: 0 };

  public constructor(
    public position: IVector,
    public size: IVector,
    public orientation = 0,
    public scale = '100%',
    public zIndex = 0,
  ) { }

  public moveToPosition(): void {
    this.element.style.translate = `${this.position.x - (this.size.x / 2)}px ${this.position.y - (this.size.y / 2)}px`
    this.element.style.rotate = `${this.orientation}deg`;
  }

  public animate(): void {
    this.element.style.backgroundPosition = `${this.offset.x}px ${this.offset.y}px`;
  }
}
