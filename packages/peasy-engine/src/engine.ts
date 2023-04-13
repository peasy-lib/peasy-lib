export type EngineCallback = (deltaTime: number, runtime: number) => void;

export interface IEngine {
  callback: EngineCallback;
  started?: boolean;
  fps?: number;
  ms?: number;
  resetThreshold?: number;
}

export class Engine {
  public startTime?: number;

  private started = false;
  private paused = false;
  private lastTime = 0;
  private resetThreshold = 1000;
  private timeSinceLast = 0;
  private accTime = 0;

  private constructor(private readonly interval: number, private readonly callback: EngineCallback) { }

  public static create(options: IEngine | EngineCallback): Engine {
    if (typeof options === 'function') {
      options = { callback: options };
    }
    const interval = options.ms ?? 1000 / (options.fps ?? 60);
    const engine = new Engine(interval, options.callback);
    engine.resetThreshold = options.resetThreshold ?? engine.resetThreshold;

    if (options.started ?? true) {
      engine.start();
    }
    return engine;
  }

  public start(): boolean {
    if (this.started && !this.paused) {
      return false;
    }

    requestAnimationFrame(this.paused ? this.tick : this.doStart);
    this.paused = false;

    return true;
  }
  public stop(): boolean {
    if (!this.started) {
      return false;
    }
    this.started = false;
    this.paused = false;
    return true;
  }
  public pause(): boolean {
    if (!this.started) {
      return false;
    }
    this.paused = true;
    return true;
  }

  private readonly doStart = (timestamp: number) => {
    this.started = true;
    this.startTime = timestamp;
    this.lastTime = timestamp;
    this.accTime = 0;
    requestAnimationFrame(this.tick);
  };

  private readonly tick = (timestamp: number) => {
    if (!this.started || this.paused) {
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    if (deltaTime > this.resetThreshold) {
      console.log(`Too long since last tick: ${deltaTime}ms. Resetting.`);
      this.timeSinceLast = 0;
      requestAnimationFrame(this.tick);
      return;
    }
    // deltaTime /= 1000;
    // console.log(timestamp, deltaTime * 1000);

    this.timeSinceLast += deltaTime;

    while (this.timeSinceLast >= this.interval) {
      this.callback(this.interval, this.accTime);
      this.accTime += this.interval;
      this.timeSinceLast -= this.interval;
    }
    requestAnimationFrame(this.tick);
  };
}
