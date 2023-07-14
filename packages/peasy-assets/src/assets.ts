export interface IAssets {
  src?: string;
}

export interface IAsset {
  src?: string;
  name?: string;
  family?: string;
  descriptors?: any;
  type?: 'image' | 'audio' | 'font';
}

export class Assets {
  private static initialized = false;
  public static sources: Record<string, string> = { default: '/assets/' };
  public static assets: { image: Record<string, HTMLImageElement>; audio: Record<string, HTMLMediaElement>; font: Record<string, FontFace> } = {
    image: {},
    audio: {},
    font: {},
  };
  public static requested = 0;
  public static loaded = 0;

  public static types: Record<string, string> = {
    image: 'image',
    audio: 'audio',

    png: 'image',
    svg: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',

    mp3: 'audio',
    wav: 'audio',
  };

  public static loaders: Record<string, any> = {
    image: Assets.loadImage,
    audio: Assets.loadAudio,
    font: Assets.loadFont,
  };

  public static get pending(): number {
    return this.requested - this.loaded;
  }

  public static initialize(input: IAssets = {}) {
    Assets.initialized = true;
    if (input.src != null) {
      Assets.sources.default = input.src;
    }
  }

  public static load(assets: (string | IAsset)[]): Promise<any[]> {
    return Promise.all(assets.map(async (asset) => {
      if (typeof asset === 'string') {
        asset = { src: asset };
      }
      const src = !(asset.src ?? '').startsWith('data:') ? `${Assets.sources.default}${asset.src ?? ''}` : asset.src ?? '';
      const type = asset.family != null ? 'font'
        : (src.startsWith('data:')
          ? src.slice('data:'.length, src.indexOf('/'))
          : Assets.types[asset.type ?? src.split('.').pop() ?? '']
        ) as 'image' | 'audio';
      const loader = Assets.loaders[type];
      if (loader == null) {
        return null;
      }
      let name = asset.name;
      if (name == null) {
        if (type === 'font') {
          name = asset.family!;
        } else {
          name = src.split('/').pop() ?? '';
          const parts = name.split('.');
          parts.pop();
          name = parts.join('.');
        }
      }
      Assets.requested++;
      let promise;
      if ((src as unknown as typeof Image) instanceof Image) {
        promise = Promise.resolve(src);
      } else {
        promise = loader(src, asset);
      }
      Assets.assets[type][name] = await promise;
      Assets.loaded++;
      return promise;
    }));
  }

  public static clear(): Promise<void> {
    Assets.assets = {
      image: {},
      audio: {},
      font: {},
    };
    Assets.requested = 0;
    Assets.loaded = 0;
    // TODO: Make a proper promise that first makes sure nothing is pending
    return Promise.resolve();
  }

  public static image(name: string): HTMLImageElement {
    return Assets.assets.image[name];
  }
  public static audio(name: string): HTMLMediaElement {
    return Assets.assets.audio[name];
  }
  public static font(name: string): FontFace {
    return Assets.assets.font[name];
  }

  public static loadImage(src: string): Promise<HTMLImageElement> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
    return new Promise(async (resolve) => {
      const img = new Image();
      img.onprogress = (...args) => console.log('progress', args);
      img.onload = () => resolve(img);
      // img.src = url;
      if (src.startsWith('data:')) {
        img.src = src;
      } else {
        img.src = await fetch(src).then(res => res.url);
      }
    });
  }

  public static loadAudio(url: string): Promise<HTMLMediaElement> {
    return new Promise(resolve => {
      const audio = new Audio();
      audio.addEventListener('progress', (...args) => console.log('progress', args));
      audio.oncanplaythrough = () => resolve(audio);
      audio.src = url;
    });
  }

  public static loadFont(url: string, asset: IAsset): Promise<FontFace> {
    if (!url.startsWith('url(')) {
      url = `url(${url})`;
    }
    return new Promise(async (resolve) => {
      const font = new FontFace(asset.family!, url, asset.descriptors ?? {});
      await font.load();
      document.fonts.add(font);
      resolve(font);
    });
  }
}
