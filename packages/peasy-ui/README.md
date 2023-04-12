# Peasy UI

This is the repository for Peasy UI, a small-ish and relatively easy to use UI binding library.

## Introduction

Peasy UI provides uncomplicated UI bindings for HTML via templating. It encourages a modular approach and supports both HTML and JavaScript single file components. Peasy UI is intended to be used in vanilla JavaScript/Typescript projects where using `createElement` is too cumbersome and adding a complete SPA framework is overkill or simply not desired. Thanks to the small scope of the library, performance is decent.

**Peasy UI does not require an installation and can be used in vanilla HTML+JavaScript without a build step.**

## First look

In Peasy UI, an HTML template is combined with a JavaScript/Typescript object, the model, into a `UI View` that's added to an element. Peasy UI will then sync state between the UI and the model according to the one-way, two-way and event bindings. For a more exact control over when the state is synced, the `update()` method can be called manually, typically after updating the model or in a recurring (game) loop.

```ts
const template = `
    Color: <input \${value <=> color}>
    <span style="background-color: \${color}">\${color}</span>
    <button \${click @=> clicked}>Gold</button>
    `;

const model = {
    color: 'red';
    clicked: () => model.color = 'gold';
};

const view = UI.create(document.body, template, model);
```
This example creates a two-way bound input field where whatever color is typed in is displayed in a span with that background color. When the button Gold is clicked, the click event binding will update the color property in the model which in turn will update all bindings in the view.

## Getting started

If you've got a build process and are using npm, install Peasy UI with

    npm i @peasy-lib/peasy-ui

and `import` it into whichever files you want to use it

```ts
import { UI } from '@peasy-lib/peasy-ui';
```

If you don't have a build process or don't want to install it, use a `script` tag of type `module` and import from `https://cdn.skypack.dev/@peasy-lib/peasy-ui`.

```html
<html>
<body>
  <template id="#app">
    <div>${greeting} (Been running for ${timer} seconds.)</div>
  </template>

  <script type="module">
    import { UI } from "https://cdn.skypack.dev/@peasy-lib/peasy-ui";

    const template = '#app'; // A string starting with # uses a template element with that id
    const model = { greeting: 'Hello, World!', timer: -1 };
    UI.create(document.body, template, model);

    setInterval(() => {
      model.timer++;
    }, 1000);
  </script>
</body>
</html>
```

## Features and syntax

Peasy UI uses the JavaScript/Typescript string interpolation syntax of `${ }` and a `pui` attribute in combination with different versions of the spaceship operator `<=>` to bind between an `attribute` on the element and a `property` on the model.

```ts
'Color: <input ${value <=> color}>' // Two-way binding between value attribute and color property
```
### Available bindings

There are two types of bindings: text bindings, that inject text anywhere between elements or within an element attribute, and attribute bindings, that goes within an element tag to create or interact with the element and its attributes.

#### Text bindings

Text bindings use either `\${ }` or `\${| }` (for one-time) to inject text based on a model property.

```html
<div style="color: ${color}">This is ${color}.</div>
```

Available text bindings are

    ${prop}             Bindning from model property to attribute or text
    ${|prop}            One-time bindning from model property to attribute or text

    ${'value' = prop}   Bindning that renders value if model property is truthy
    ${'value' ! prop}   Bindning that renders value if model property is not truthy

    ${|'value' = prop}  One-time bindning that renders value if model property is truthy
    ${|'value' ! prop}  One-time bindning that renders value if model property is not truthy

#### Attribute bindings

Attribute bindings use either `\${ }` or the `pui` attribute within an element tag to affect the behaviour of the element. When using `\${ }`, the `\${ }` are placed around each individual binding. When using the `pui` attribute multiple bindings are separated with `;` within the `pui` attribute.

```html
<input ${ value <=> theNumber }><span pui=" === isTheNumberEven">The number is even.</span>
```

Available attribute bindings are

    attr <== prop     From model property to element attribute
    attr <=| prop     One-time from model property to element attribute
    attr ==> prop     From element attribute to model property
    attr <=> prop     Two-way between element attribute and model property

    event @=> method  Event from element attribute to model method

    'value' ==> prop  From element to model property, used to bind values of
                      radio buttons and select inputs to a model property

    ==> prop    One-time that stores the element in model property

    === prop    Renders the element if model property is not false and not nullish
    !== prop    Renders the element if model property is false or nullish

    alias <=* list(:key)  From model list property to view template alias
                          for each item in the list. If key is provided
                          property key will be used to decide item equality

    comp === (state)  Renders component (property with type or instance) with
                      a template and passes state, if component type, to
                      component's create method

### Examples

A combination of the text value binding and a binding for the `change` event can be used to capture and react to changes in radio buttons and selects.

```ts
const template = `
    <input type="radio" \${'red' ==> color} \${change @=> changedColor}> Red
    <input type="radio" pui="'green' ==> color; change @=> changedColor"> Green
    `;
const model = {
    color: 'red';
    changedColor: (event, model) => alert(`Changed color to ${model.color}.`),
};
```

```ts
const template = `
    <select \${change @=> changedColor}>
        <option \${'red' ==> color}>Red</option>
        <option pui="'green' ==> color">Green</option>
    </select>
    `;
const model = {
    color: 'red';
    changedColor: (event, model) => alert(`Changed color to ${model.color}.`),
};
```

```ts
const template = `
    <div pui=" === preferCats">I prefer cats.</div>
    <div \${ !== preferDogs}>I DON'T prefer dogs.</div>
`;
const model = { preferCats: true, preferDogs: false };
```

```ts
const template = `
    <div class="\${ 'dark-mode' = darkMode }">\${ 'Dark' = darkMode } \${ 'Light' ! darkMode } mode</div>
`;
const model = { darkMode: true };
```

```ts
const template = `<div \${item <=* list}>Item: \${item}</div>`;
const model = { list: ['one', 'two', 'three'] };
```

```ts
const template = `<div pui="object <=* list">Item: \${object.id}</div>`;
const model = { list: [{ id: 'one' }, { id: 'two' }, { id: 'three' }] };
```

```ts
const template = `<div \${object <=* list:id}>Item: \${object.id}</div>`;
const model = { list: [{ id: 'one' }, { id: 'two' }, { id: 'three' }] };
```

```ts
class Greeting {
  // Queried by parent to create markup
  public static template = '<div>Hello, ${name}</div>';

  // Called by parent to create model
  public static create(state: { name: string }): Greeting {
    return new Greeting(state.name);
  }

  public constructor(public name: string) { }
}

const template = `<div>
        <\${Greeting === greet} \${greet <=* greets}>
        <\${greetObject === }>
    </div>`;
const model = { Greeting,
                greets: [{ name: 'World' }, { name: 'Everyone' }],
                greetObject: { template: '<div>Hello, ${name}</div>', name: 'Someone' } };
```

## Additional features

### Awaiting animations

Peasy UI will not detach/remove an `UIView` with elements that have an active animation on them, so there's no need to await the end of any removal activations before destroying an `UIView`.

### Control updates

Peasy UI will by default use `requestAnimationFrame` for updates. By calling `UI.initialize` before any other `UI` method a number can be provided to set updates per second or `false` to prevent Peasy UI from doing any automatic updates at all.

```ts
UI.initialize(false);

const tick = () => {
    doSomething();
    UI.update();
    doSomethingElse();
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

### Queue updates

Sometimes you might need to wait with an action until Peasy UI has finished its current update. Passing a function to `UI.queue` will make it run after the current update is completed and before the next update starts.

```ts
const template = `
    <input pui=" === showInput; value <=> input; ==> inputElement">
    <button \${ click !== toggleInput }>Toggle input</button>
`;
const model = {
  showInput: false,
  toggleInput() {
    model.showInput = !model.showInput;
    if (model.showInput) {
      UI.queue(() => model.inputElement.focus()); // Since inputElement is not available until after finished update
    }
  }
};
```

### Register single file components

Peasy UI makes it possible to create both JavaScript and HTML single file components and import them for use in the app, **without the need of a build step**. As shown in the `greetObject` example above, Peasy UI only needs a `template` property in order to render a component, but for Peasy UI to instantiate and render components based on a _template object/class_ and (optionally) data, the _template object/class_ needs

  1. a `template` property,
  2. a `create` method (that gets invoked with the specified model data), and
  3. to be known to the parent model either as a property or through the use of the `UI.register` method

#### JavaScript single file component

JavaScript single file components are just an exported object or a class that fulfills the requirements above.

```ts
// list-item.js
import { UI } from "https://cdn.skypack.dev/@peasy-lib/peasy-ui";

export class ListItem {
  static template = '<span>Hello, ${name}!</span>'; // This can also be a template element

  constructor(name) {
    this.name = name;
  }
  static create(state) {
    return new ListItem(state.name);
  }
}
UI.register('ListItem', ListItem); // Can be replaced with a property on invoking model
```

Using a JavaScript single file component is done by importing it in script and then using it in parent's HTML.

```html
<!-- index.html -->
<body>
  <template id="sfc-app">
    <div>
      <div pui="name <=* names"><list-item pui="ListItem === name"></list-item>
    </div>
  </template>

  <script type="module">
    import { UI } from "https://cdn.skypack.dev/@peasy-lib/peasy-ui";
    import { ListItem } from './list-item.js';

    class SFCApp {
      names = [{ name: 'World' }, { name: 'everyone' }];
    }

    UI.create(document.body, '#sfc-app', new SFCApp());
  </script>
```

#### HTML single file component

HTML single file components rely on the `UI.register` and `UI.import` methods.

```html
<!-- list-item.html -->
<style>
  list-item {
    color: gold;
  }
</style>

<template id="list-item">
  <span>Hello, ${name}!</span>
</template>

<script type="module">
  import { UI } from "https://cdn.skypack.dev/@peasy-lib/peasy-ui";

  export class ListItem {
    static template = document.querySelector('#list-item'); // This can also be a string

    constructor(name) {
      this.name = name;
    }

    static create(state) {
      return new ListItem(state.name);
    }
  }
  UI.register('ListItem', ListItem); // Is necessary for HTML single file components
</script>
```

Since _HTML imports_ aren't here (yet), Peasy UI uses the `UI.import` and `UI.ready` methods to support HTML single file components.

```html
<!-- index.html -->
<head>
  <script type="module">
    import { UI } from "https://cdn.skypack.dev/@peasy-lib/peasy-ui";

    UI.initialize(); // UI.initialize is necessary with HTML components and needs to be in a head in top file
  </script>
</head>

<body>
  <template id="sfc-app">
    <div>
      <div pui="name <=* names"><list-item pui="ListItem === name"></list-item></div>
    </div>
  </template>

  <script type="module">
    import { UI } from "https://cdn.skypack.dev/@peasy-lib/peasy-ui";

    UI.import('./list-item.html');

    class SFCApp {
      names = [{ name: 'World' }, { name: 'everyone' }];
    }

    await UI.ready(); // Awaiting UI.ready is necessary with HTML imports
    UI.create(document.body, '#sfc-app', new SFCApp());
  </script>
</body>
```

From a templating perspective, there's no difference between JavaScript and HTML single file components and the two types can co-exist and be used in the same app.

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).

## Joining the community

If you want to keep up with the latest and greatest about Peasy UI, or if you have questions or opinions about it, please come [join our discord](https://discord.gg/CDWn6Uq7). We'd love to hear from you!
