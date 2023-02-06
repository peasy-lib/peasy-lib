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
  public static assets: { images: Record<string, HTMLImageElement> } = {
    images: {},
  };

  public static loaders: Record<string, any> = {
    'image': Assets.loadImage,

    'png': Assets.loadImage,
    'svg': Assets.loadImage,
    'jpg': Assets.loadImage,
    'jpeg': Assets.loadImage,
    'gif': Assets.loadImage,
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
      const type = asset.type ?? src.split('.').pop() ?? '';
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
      Assets.assets.images[name] = await promise;
      return promise;
    }));
  }

  public static image(name: string): HTMLImageElement {
    return Assets.assets.images[name];
  }

  public static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }
}
