export interface IAssets {
  src?: string;
}

export interface IAsset {
  src?: string;
  name?: string;
  type?: 'image' | 'audio';
}

export class Assets {
  private static initialized = false;
  public static sources: Record<string, string> = { default: '/assets/' };
  public static assets: { image: Record<string, HTMLImageElement>; audio: Record<string, HTMLMediaElement> } = {
    image: {},
    audio: {},
  };

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
  };

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
      const src = `${Assets.sources.default}${asset.src ?? ''}`;
      const type = Assets.types[asset.type ?? src.split('.').pop() ?? ''] as 'image' | 'audio';
      const loader = Assets.loaders[type];
      if (loader == null) {
        return null;
      }
      let name = asset.name;
      if (name == null) {
        name = src.split('/').pop() ?? '';
        const parts = name.split('.');
        parts.pop();
        name = parts.join('.');
      }
      const promise = loader(src);
      Assets.assets[type][name] = await promise;
      return promise;
    }));
  }

  public static image(name: string): HTMLImageElement {
    return Assets.assets.image[name];
  }
  public static audio(name: string): HTMLMediaElement {
    return Assets.assets.audio[name];
  }

  public static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise(async (resolve) => {
      const img = new Image();
      img.onprogress = (...args) => console.log('progress', args);
      img.onload = () => resolve(img);
      // img.src = url;
      img.src = await fetch(url).then(res => res.url);
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
}
