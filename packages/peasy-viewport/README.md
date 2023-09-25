# Peasy Viewport

This is the repository for Peasy Viewport, a small-ish and relatively easy to use viewport library.

## Introduction

Peasy Viewport provides an uncomplicated Viewport for HTML.

## First look

In Peasy Viewport a viewport is created and then one or more viewport layers are added into it. Viewport layers can be background and foreground images, html overlays or canvases. It supports camera and parallax functionality out of the box. Peasy Viewport should work nicely with different HTML-based UI and graphics libraries.

```html
<div id="my-viewport" style="position: relative">
    <!--  Whatever graphics you've got -->
</div>
```
```ts
// Create an object for the light source (can be an existing object such as player)
const light = {
    position: { x: 150, y: 150 },
    radius: 250,
    color: 'red',
};
// Add the light source
const light = Viewport.addLight({
  entity: light,
  viewport: document.querySelector('#my-viewport'),
});
// Render the light source
Viewport.update();

// Move the light source
light.position.x = 200;
light.position.y = 250;
light.radius = 200;
light.color = 'green';

// Render the moved light source
Viewport.update();
```
This example creates and renders a light source and then moves and re-renders it.

## Getting started

If you've got a build process and are using npm, install Peasy Viewport with

    npm i @peasy-lib/peasy-viewport

and `import` it into whichever files you want to use it

```ts
import { Viewport } from '@peasy-lib/peasy-viewport';
```

If you don't have a build process or don't want to install it, use a `script` tag of type `module` and import from `https://cdn.skypack.dev/@peasy-lib/peasy-viewport` instead.

```html
<html>
<body>
  <div id="my-viewport" style="position: relative; widht: 400; height: 400;">
    <div>Hello, world!</div>
  </div>
  <script type="module">
    import { Viewport } from "https://cdn.skypack.dev/@peasy-lib/peasy-viewport";

    // Add a static light source
    Viewport.addLight({
        position: { x: 150, y: 150 },
        radius: 250,
        color: 'red',
        viewport: document.querySelector('#my-viewport'),
    });
    // Render the light source
    Viewport.update();
  </script>
</body>
</html>
```

## Features and syntax

Peasy Viewport supports multiple dynamic light sources with colour mixing for overlapping lights. By specifying information about entities and normal maps it's possible to also get "3d shadows" for entities.

Documentation to be written, but for now check out the source code of the demo app.

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
