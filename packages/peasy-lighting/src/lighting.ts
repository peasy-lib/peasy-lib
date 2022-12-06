import { Entity, IEntity } from "./entity";
import { Light, ILight } from "./light";
import { IViewport, Viewport } from "./viewport";

export class Lighting {
  public static entities: Entity[] = [];
  public static lights: Light[] = [];
  public static viewports: Set<Viewport> = new Set();

  public static initialize(element: HTMLElement = document.body): void {
    Lighting.#createElements(element);
  }

  public static update() {
    this.entities.forEach(entity => entity.update());
    this.viewports.forEach(viewport => viewport.update());
    this.lights.forEach(light => light.update());
  }

  public static addLight(light: Light | ILight): Light {
    if (!(light instanceof Light)) {
      light = Light.create(light);
    }
    Lighting.lights.push(light as Light);
    return light as Light;
  }

  public static removeLight(light: string | Light) {
    const index = light instanceof Light
      ? Lighting.lights.findIndex(item => item === light)
      : Lighting.lights.findIndex(item => item.id === light);
    if (index < 0) {
      return;
    }
    // TODO: Needs to also destroy light and light entities
    Lighting.lights.splice(index, 1);
  }

  public static addEntities(entities: Entity | IEntity | (Entity | IEntity)[]) {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }
    return entities.map(input => {
      const entity = input instanceof Entity ? input : Entity.create(input);
      Lighting.entities.push(entity);
      return entity;
    });
  }

  public static addViewport(viewport: Viewport | IViewport | HTMLElement): Viewport {
    if (viewport instanceof Element) {
      const vp = [...Lighting.viewports].find(item => item.element === viewport);
      if (vp != null) {
        return vp;
      }
      viewport = { element: viewport };
    }
    if (!(viewport instanceof Viewport)) {
      viewport = Viewport.create(viewport);
    }
    Lighting.viewports.add(viewport as Viewport);
    return viewport as Viewport;
  }

  public static removeViewport(viewport: string | Viewport) {
    const vp = viewport instanceof Viewport
      ? [...Lighting.viewports].find(item => item === viewport)
      : [...Lighting.viewports].find(item => item.id === viewport);
    if (vp == null) {
      return;
    }
    // Delete all lights and entities in viewports and all that
    // (viewport as Viewport).delete();
    Lighting.viewports.delete(vp);
  }

  static #createElements(element: HTMLElement): void {
    element.insertAdjacentHTML('beforeend', `<svg style="display: none;">
      <filter id="red-filter" color-interpolation-filters="sRGB"
              x="0" y="0" height="100%" width="100%">
        <feColorMatrix type="matrix"
          values="1 0 0 0 -0.5
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0" />
        <feColorMatrix type="matrix"
          values="2 0 0 0 0
                  2 0 0 0 0
                  2 0 0 0 0
                  0 0 0 1 0" />
      </filter>
      <filter id="reverse-red-filter" color-interpolation-filters="sRGB"
              x="0" y="0" height="100%" width="100%">
        <feColorMatrix type="matrix"
          values="-1 0 0 0 0.5
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0" />
        <feColorMatrix type="matrix"
          values="2 0 0 0 0
                  2 0 0 0 0
                  2 0 0 0 0
                  0 0 0 1 0" />
      </filter>
      <filter id="green-filter" color-interpolation-filters="sRGB"
              x="0" y="0" height="100%" width="100%">
        <feColorMatrix type="matrix"
          values="0 0 0 0 0
                  0 1 0 0 -0.5
                  0 0 0 0 0
                  0 0 0 1 0" />
        <feColorMatrix type="matrix"
          values="0 2 0 0 0
                  0 2 0 0 0
                  0 2 0 0 0
                  0 0 0 1 0" />
      </filter>
      <filter id="reverse-green-filter" color-interpolation-filters="sRGB"
              x="0" y="0" height="100%" width="100%">
        <feColorMatrix type="matrix"
          values=" 0 0 0 0 0
                  0 -1 0 0 0.5
                  0 0 0 0 0
                  0 0 0 1 0" />
        <feColorMatrix type="matrix"
          values="0 2 0 0 0
                  0 2 0 0 0
                  0 2 0 0 0
                  0 0 0 1 0" />
      </filter>
      <filter id="blue-filter" color-interpolation-filters="sRGB"
              x="0" y="0" height="100%" width="100%">
        <feColorMatrix type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 1 0 -0.5
                  0 0 0 1 0" />
        <feColorMatrix type="matrix"
          values="0 0 2 0 0
                  0 0 2 0 0
                  0 0 2 0 0
                  0 0 0 1 0" />
      </filter>
      <filter id="luminance-to-alpha">
        <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" />
      </filter>
    </svg>`);
  }
}
