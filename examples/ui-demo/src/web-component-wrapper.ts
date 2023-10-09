import { UI, UIView } from '@peasy-lib/peasy-ui';

function registerWebComponent(name: string, component: any): any {
  name ??= component.WebComponent;

  class WebComponentWrapper extends HTMLElement {
    private component = component;
    private uiView: UIView;

    private _text: string;

    constructor() {
      super();
      this._text = 'Hello, World!';
      this.attachShadow({ mode: 'open' });
      // this.render();
    }
    static get observedAttributes() {
      return ['text'];
    }

    connectedCallback() {
      console.log('MyComponent added to the DOM', this.shadowRoot.host);
      this.initialize();
    }

    disconnectedCallback() {
      console.log('MyComponent removed from the DOM');
      this.terminate();
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
      console.log(`Attribute "${name}" changed from "${oldVal}" to "${newVal}"`);
      this.initialize();
      this.uiView.model[name] = newVal;
    }

    private initialize(): void {
      if (this.uiView == null) {
        this.uiView = UI.create(this.shadowRoot.host as HTMLElement, this.component.template, this.component.create(this._text));
      }
    }
    private terminate(): void {
      if (this.uiView != null) {
        this.uiView = UI.create(this.shadowRoot.host as HTMLElement, this.component.template, this.component.create(this._text));
      }
    }

    // private render() {
    //   this.shadowRoot.innerHTML = `
    //   <p>${this._text}</p>
    //   <button>Click Me</button>
    // `;
    //   const button = this.shadowRoot.querySelector('button');
    //   button.addEventListener('click', () => {
    //     this.dispatchEvent(new Event('my-component-click'));
    //   });
    // }
  }

  customElements.define('my-webcomponent', WebComponentWrapper);
}

class MyWebComponent {
  static webComponent = 'my-webcomponent';
  static observedAttributes = ['text', 'value'];

  static template = `
  <p>MyWebComponent: \${text}</p>
  <div><input pui="value <=> value"> value: \${value}</div>
  <button pui="click @=> copy">Copy value</button>
  `;

  public text: string = 'First text';
  public value: string;

  public constructor() { }

  public static create(): MyWebComponent {
    return new MyWebComponent();
  }

  public copy = () => {
    console.log('Copy value', this.value);
  }
}

UI.register(MyWebComponent);
