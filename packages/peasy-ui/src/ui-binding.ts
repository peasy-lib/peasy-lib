import { UIView } from './ui-view';
import { UI } from "./ui";

export type IUIBinding = Partial<Omit<UIBinding, 'id'>>;
// export type IUIBindingType = 'conditional' | 'event' | 'fixed-value' | 'reference' | '';

export type fromUICallback = (newValue: string, oldValue: any, property: string, model: any) => any | void;
export type toUICallback = (newValue: any, oldValue: any, property: string, model: any, value: any) => string | void;

export class UIBinding {
  public id: number;
  public parent!: typeof UI | UIView;

  public object: any;
  public property?: string;
  public propertyArguments!: string[];

  public context: any;
  public selector?: string | Element | Node;
  public attribute!: string;
  public attributeArguments!: string[];
  public value!: string | Element; // A fixed value that's always used
  public template!: HTMLElement;

  // public type: IUIBindingType = '';

  public fromUI: boolean | fromUICallback = false;
  public toUI: boolean | toUICallback = true;
  public atEvent = false;
  public oneTime = false;
  public views: UIView[] = [];

  private $element!: Element | null;
  private lastValue: any;
  private lastUIValue: any;
  private firstUpdate = true;

  private events: Event[] = [];


  public constructor() {
    this.id = ++UI.id;
  }

  public get element(): Element {
    if (this.$element == null) {
      this.$element = typeof this.selector === 'string' ? this.context.querySelector(this.selector) : this.selector;
      // this.$element = (this.selector instanceof Element) || (this.selector instanceof Text) || (this.selector instanceof Comment)
      //   ? this.selector
      //   : this.context.querySelector(this.selector);
    }
    return this.$element!;
  }
  public set element(element: Element | null) {
    this.$element = element;
  }

  public static create(options: IUIBinding): UIBinding {
    const binding = new UIBinding();

    const propertyArgs = options.property?.split(':') ?? [];
    const property = propertyArgs.shift();

    const attributeArgs = typeof options.attribute !== 'boolean'
      ? (options.attribute ?? 'innerText').split(':')
      : [];
    const attribute = typeof options.attribute !== 'boolean'
      ? attributeArgs.shift()!
      : options.attribute;

    binding.parent = options.parent ?? UI;
    binding.object = '$model' in options.object ? options.object : { $model: options.object };
    // console.log('object', options.object, '=>', binding.object);
    if (binding.object.$parent == null) {
      // console.log('No $parent in UIBinding', binding.object, ((binding.parent as UIView).parent as UIBinding), ((binding.parent as UIView).parent as UIBinding)?.object?.$model);
      const parentModel = ((binding.parent as UIView).parent as UIBinding)?.object?.$parent;
      if (parentModel != null) {
        binding.object.$parent = parentModel;
        // console.log('Added $parent to UIBinding', binding.object, ((binding.parent as UIView).parent as UIBinding));
      }
    }
    binding.property = property;
    binding.propertyArguments = propertyArgs;
    binding.context = options.context ?? document;
    binding.selector = options.selector;
    binding.attribute = attribute;
    binding.attributeArguments = attributeArgs;
    binding.value = options.value ?? binding.value;
    binding.template = options.template ?? binding.template;
    binding.fromUI = options.fromUI ?? binding.fromUI;
    binding.toUI = options.toUI ?? binding.toUI;
    binding.atEvent = options.atEvent ?? binding.atEvent;
    binding.oneTime = options.oneTime ?? binding.oneTime;
    binding.addListener();

    if (typeof binding.fromUI !== 'boolean') {
      binding.fromUI = binding.fromUI.bind(binding);
    }
    if (typeof binding.toUI !== 'boolean') {
      binding.toUI = binding.toUI.bind(binding);
    }

    return binding;
  }

  public destroy(): void {
    // console.log('destroy binding', this.element);
    this.element = null;
    this.removeListener();
    this.views.forEach(view => view.destroy());
  }

  public unbind(): void {
    UI.unbind(this);
  }

  public addListener(): void {
    if (this.atEvent) {
      this.toUI = false;
      this.fromUI = false;
      this.element.addEventListener(this.attribute, this.triggerAtEvent);
    }
    // TODO: Maybe do without listener?
    if (this.toUI && this.fromUI && customElements.get(this.element.tagName.toLowerCase()) != null) {
      this.element.addEventListener(this.attribute, this.twoWayBindingEvent);
    }
  }
  public removeListener(): void {
    if (this.atEvent) {
      this.element.removeEventListener(this.attribute, this.triggerAtEvent);
    }
    // TODO: Maybe do without listener?
    if (this.toUI && this.fromUI && customElements.get(this.element!.tagName.toLowerCase()) != null) {
      this.element.removeEventListener(this.attribute, this.twoWayBindingEvent);
    }
  }

  public updateFromUI(): void {
    if (this.fromUI === false || this.firstUpdate) {
      this.firstUpdate = false;
      this.views.forEach(view => view.updateFromUI());
      return;
    }
    const { target, property } = UI.resolveProperty(this.element, this.attribute);
    const uiValue = target[property];
    if (uiValue !== this.lastUIValue) {
      let value = this.fromUI !== true ? this.fromUI(uiValue, this.lastUIValue, this.property!, this.object) : uiValue;
      this.lastUIValue = uiValue;
      if (value !== undefined && value !== this.lastValue) {
        this.lastValue = value;
        const { target, property } = UI.resolveProperty(this.object, this.property!);
        if (UI.resolveValue(this.object, this.property!) === 'number' && !isNaN(value)) {
          value = +value;
        }
        target[property] = value;
      } else {
        this.lastValue = value;
      }
      // TODO: Verify this outside of web component
      (this.parent as UIView).host?.dispatchEvent(new CustomEvent(property, { detail: value }));
    }
    this.views.forEach(view => view.updateFromUI());
  }

  public updateToUI(): void {
    if (this.toUI === false) {
      this.views.forEach(view => view.updateToUI());
      return;
    }
    let value = UI.resolveValue(this.object, this.property!);
    if (this.template != null) { // Component, conditional or iterator
      if (this.template instanceof HTMLElement) { // Conditional or iterator
        if (typeof this.attribute === 'boolean') { // Conditional
          value = (value ?? false) === false ? false : true;
          if (value !== this.lastValue) {
            const uiValue = this.toUI !== true ? this.toUI(value, this.lastValue, this.property!, this.object, this.value) : value;
            if (uiValue !== undefined && uiValue !== this.lastUIValue) {
              // console.log('Updating toUI');
              if (uiValue === this.attribute) {
                this.views.push(UIView.create(this.element.parentElement!, this.object, this.template.cloneNode(true) as HTMLElement, { parent: this, prepare: false, sibling: this.element }));
              } else {
                const view = this.views.pop();
                view?.destroy();
              }
              this.lastValue = value;
              this.lastUIValue = uiValue;
            }
          }
        } else { // Iterator
          let listChanged = false;
          let listItemsChanged = false;
          if (value == null) {
            value = [];
          }
          // value = value != null ? [...value] : []; // Create a copy for race conditions
          const key = this.propertyArguments[0];
          const lastValue = this.lastValue ?? [];
          if (value.length !== lastValue.length) {
            listChanged = true;
          } else {
            for (let i = 0, ii = value.length; i < ii; i++) {
              let v, lv;
              if (key == null) {
                if (value[i] !== lastValue[i]) {
                  listChanged = true;
                  listItemsChanged = true;
                }
              } else {
                v = UI.resolveValue(value[i] ?? {}, key);
                lv = UI.resolveValue(lastValue[i] ?? {}, key);
                if (v !== lv) {
                  listChanged = true;
                }
                if (value[i] !== lastValue[i]) {
                  listItemsChanged = true;
                }
              }
            }
          }

          if (!listChanged) {
            if (!listItemsChanged) {
              return this.updateViews();
            } else {
              const uiValue = this.toUI !== true ? this.toUI(value, lastValue, this.property!, this.object, this.value) : value;
              return this.updateViews(value, uiValue);
            }
          }

          const uiValue = this.toUI !== true ? this.toUI(value, lastValue, this.property!, this.object, this.value) : value;
          if (uiValue == null) {
            return this.updateViews();
          }
          const lastUIValue = this.lastUIValue ?? [];
          let same = 0;
          for (let i = 0, ii = uiValue.length, j = 0; i < ii; i++, j++) {
            let v, lv;
            if (key == null) {
              v = uiValue[i];
              lv = lastUIValue[j];
            } else {
              v = UI.resolveValue(uiValue[i] ?? {}, key);
              lv = UI.resolveValue(lastUIValue[j] ?? {}, key);
            }
            if (v === lv) {
              same++;
            } else {
              break;
            }
          }
          if (same === uiValue.length && uiValue.length === lastUIValue.length) {
            return this.updateViews(value, uiValue);
          }
          const views = this.views.splice(0, same);
          let lastDoneUI = views[views.length - 1];

          for (let i = same, ii = uiValue.length, j = same; i < ii; i++, j++) {
            const item = uiValue[i];
            // const lastDoneUI = views[views.length - 1];
            const view = this.views.shift();
            // New view
            if (view == null) {
              const model = { $model: { [this.attribute]: item }, $parent: this.object };
              const view = UIView.create(this.element.parentElement!, model, this.template.cloneNode(true) as HTMLElement, { parent: this, prepare: false, sibling: lastDoneUI ?? this.element });
              views.push(view);
              lastDoneUI = view;
              continue;
            }
            const itemKey = key == null ? item : UI.resolveValue(item ?? {}, key);
            const uiItem = view?.model.$model[this.attribute];
            const uiItemKey = key == null ? uiItem : UI.resolveValue(uiItem ?? {}, key);

            // The same, continue
            if (itemKey === uiItemKey) {
              views.push(view);
              view.move(lastDoneUI ?? this.element);
              lastDoneUI = view;
              continue;
            }
            // Old view is gone
            if (!uiValue.slice(i)
              .map((value: any) => key == null ? value : UI.resolveValue(value ?? {}, key))
              .includes(uiItemKey)
            ) {
              view.destroy();
              i--;
              lastDoneUI = view;
              continue;
            }
            // Moved view
            this.views.unshift(view);
            let found = false;
            for (let j = 0, jj = this.views.length; j < jj; j++) {
              const view = this.views[j];
              const uiItem = view?.model.$model[this.attribute];
              const uiItemKey = key == null ? uiItem : UI.resolveValue(uiItem ?? {}, key);
              if (itemKey === uiItemKey) {
                views.push(...this.views.splice(j, 1));
                view.move(lastDoneUI ?? this.element);
                found = true;
                lastDoneUI = view;
                break;
              }
            }
            // New view
            if (!found) {
              const model = { $model: { [this.attribute]: item }, $parent: this.object };
              const view = UIView.create(this.element.parentElement!, model, this.template.cloneNode(true) as HTMLElement, { parent: this, prepare: false, sibling: lastDoneUI ?? this.element });
              views.push(view);
              lastDoneUI = view;
            }
          }
          this.views.forEach(view => view.destroy());
          this.views = views;
          // this.lastValue = [...value];
          // this.lastUIValue = [...uiValue];

          return this.updateViews(value, uiValue);
        }
      } else { // Component
        const component = UI.resolveValue(this.object, this.attribute);
        if ((value ?? component) == null || (value ?? component) !== this.lastValue) {
          // console.log('NEW COMPONENT VALUE', value, UI.resolveValue(this.object, this.attribute), this.lastValue);
          if (this.lastUIValue != null) {
            this.lastUIValue.destroy();
            this.lastUIValue = null;
          }
          // console.log('Component', this.attribute, this.object, component);
          const model = value == null ? component : component.create(value);
          const template = component.template;
          // this.value = value ?? component;
          this.lastValue = value ?? component;
          const parentElement = this.element.nodeType === 8 ? this.element.parentElement! : this.element;
          const sibling = this.element.nodeType === 8 ? this.element : null;
          this.lastUIValue = UI.create(parentElement as HTMLElement, model, template, { parent: this, prepare: true, sibling });
          if (this.attributeArguments[0] != null && value != null) {
            const { target, property } = UI.resolveProperty(this.object, this.attributeArguments[0]);
            target[property] = this.lastUIValue;
          }
          this.views.push(this.lastUIValue);
        }
      }
    } else {
      if (value !== this.lastValue) {
        const uiValue = this.toUI !== true ? this.toUI(value, this.lastValue, this.property!, this.object, this.value) : value;
        if (uiValue !== undefined && uiValue !== this.lastUIValue) {
          // console.log('Updating toUI');
          const { target, property } = UI.resolveProperty(this.element, this.attribute);
          target[property] = uiValue;
          // TODO: Verify this (web components)
          if ('setAttribute' in this.element) {
            this.element.setAttribute(this.attribute, uiValue);
          }
          this.lastValue = value;
          this.lastUIValue = uiValue;
        }
      }
    }
    this.updateViews();
  }

  public updateAtEvents(): void {
    let event = this.events.shift();
    while (event != null) {
      // console.log('UPDATED', this.attribute, event, this.object);
      const callback = UI.resolveValue(this.object, this.property!);
      // TODO: Make callback send parent model for iterator/templates?
      callback.call(this.object.$model, event, this.object.$model, this.element, this.attribute, this.object);
      event = this.events.shift();
    }
    this.views.forEach(view => view.updateAtEvents());
  }

  public updateMove(): void {
    this.views.forEach(view => view.updateMove());
  }

  public triggerAtEvent = (event: any): void => {
    // console.log('TRIGGERED', this.attribute, event, this.object);
    if (event.type === 'change') {
      this.events.push(event);
    } else {
      const callback = UI.resolveValue(this.object, this.property!);
      // TODO: Make callback send parent model for iterator/templates?
      callback.call(this.object.$model, event, this.object.$model, this.element, this.attribute, this.object);
    }
  };

  public twoWayBindingEvent = (event: any): void => {
    // const { target, property } = UI.resolveProperty(this.element, this.attribute);
    const { target, property } = UI.resolveProperty(this.object, this.property!);
    const uiValue = event.detail;
    // console.log('twoWay', this.element, this.attribute, this.property, uiValue);
    if (uiValue !== this.lastUIValue) {
      let value = uiValue;
      // this.lastUIValue = uiValue;
      if (value !== undefined && value !== this.lastValue) {
        // this.lastValue = value;
        if (UI.resolveValue(this.object, this.property!) === 'number' && !isNaN(value)) {
          value = +value;
        }
        target[property] = value;
      } else {
        // this.lastValue = value;
        target[property] = value;
      }
    }
  };

  private updateViews(value?: any[], uiValue?: any): void {
    if (value == null) {
      this.views.forEach(view => view.updateToUI());
    } else {
      this.views.forEach((view, index) => {
        const item = uiValue[index];
        // TODO: Maybe remove this?
        if (typeof item === 'object') {
          item.$index = index;
        }
        view.model.$model[this.attribute] = item;
        view.model.$index = index;
        view.updateToUI();
      });
      this.lastValue = [...value];
      this.lastUIValue = [...uiValue];
    }
    if (this.oneTime) {
      this.toUI = false;
      this.fromUI = false;
    }
  }
}
