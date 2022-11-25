# Peasy Lighting

This is the repository for Peasy Lighting, a small-ish and relatively easy to use lighting library.

## Introduction

Peasy Lighting provides uncomplicated Lighting for HTML. It's intended to be used in vanilla JavaScript/Typescript projects where using "proper lighting" is too cumbersome and adding a complete engine is overkill or simply not desired. Thanks to the small scope of the library, performance is decent.

## First look

In Peasy Lighting one or more lighting layers are added on top of existing graphics in an element serving as viewport. Peasy Lighting only requires light sources to be added, but by providing informaton about entities more advanced features such as shadows can be used.

```html
<div id="my-viewport" style="position: relative">
    <!--  Whatever graphics you've got -->
</div>
```
```ts
// Add a light source
const light = Lighting.addLight({
    position: new Vector(150, 150),
    radius: 250,
    color: 'red',
    viewport: document.querySelector('#my-viewport'),
});
// Render the light source
Lighting.update();

// Move the light source
light.position.x = 200;
light.position.y = 250;
light.position.radius = 200;
light.position.color = 'green';

// Render the moved light source
Lighting.update();
```
This example creates and renders a light source and then moves and re-renders it.

## Getting started

If you've got a build process and are using npm, install Peasy Lighting with

    npm i @peasy-lib/peasy-lighting

and `import` it into whichever files you want to use it

```ts
import { Lighting } from '@peasy-lib/peasy-lighting';
```

If you don't have a build process or don't want to install it, use a `script` tag of type `module` and import from `https://cdn.skypack.dev/@peasy-lib/peasy-lighting` instead.

```html
<html>
<body>
  <div id="my-viewport" style="position: relative; widht: 400; height: 400;">
    <div>Hello, world!</div>
  </div>
  <script type="module">
    import { Lighting } from "https://cdn.skypack.dev/@peasy-lib/peasy-lighting";

    // Add a light source
    const light = Lighting.addLight({
        position: new Vector(150, 150),
        radius: 250,
        color: 'red',
        viewport: document.querySelector('#my-viewport'),
    });
    // Render the light source
    Lighting.update();
  </script>
</body>
</html>
```

## Features and syntax

Peasy Lighting supports multiple dynamic light sources with colour mixing for overlapping lights. By specifying information about entities and normal maps it's possible to also get "3d shadows" for entities.

Documentation to be written, but for now check out the source code of the demo app.

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
