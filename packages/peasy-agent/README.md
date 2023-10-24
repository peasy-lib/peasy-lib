# Peasy Planner

This is the repository for Peasy Planner, a small-ish and relatively easy to use planner library.

## Introduction

Peasy Planner provides an uncomplicated Planner for NPC AI. (THIS FILE ISN'T UPDATE, IGNORE FOR NOW.)

## First look

In Peasy Planner a planner is created and then one or more planner layers are added into it. Planner layers can be background and foreground images, html overlays or canvases. It supports camera and parallax functionality out of the box. Peasy Planner should work nicely with different HTML-based UI and graphics libraries.

```html
<div id="my-planner" style="position: relative">
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
const light = Planner.addLight({
  entity: light,
  planner: document.querySelector('#my-planner'),
});
// Render the light source
Planner.update();

// Move the light source
light.position.x = 200;
light.position.y = 250;
light.radius = 200;
light.color = 'green';

// Render the moved light source
Planner.update();
```
This example creates and renders a light source and then moves and re-renders it.

## Getting started

If you've got a build process and are using npm, install Peasy Planner with

    npm i @peasy-lib/peasy-agent

and `import` it into whichever files you want to use it

```ts
import { Planner } from '@peasy-lib/peasy-agent';
```

If you don't have a build process or don't want to install it, use a `script` tag of type `module` and import from `https://cdn.skypack.dev/@peasy-lib/peasy-agent` instead.

```html
<html>
<body>
  <div id="my-planner" style="position: relative; widht: 400; height: 400;">
    <div>Hello, world!</div>
  </div>
  <script type="module">
    import { Planner } from "https://cdn.skypack.dev/@peasy-lib/peasy-agent";

    // Add a static light source
    Planner.addLight({
        position: { x: 150, y: 150 },
        radius: 250,
        color: 'red',
        planner: document.querySelector('#my-planner'),
    });
    // Render the light source
    Planner.update();
  </script>
</body>
</html>
```

## Features and syntax

Peasy Planner supports multiple dynamic light sources with colour mixing for overlapping lights. By specifying information about entities and normal maps it's possible to also get "3d shadows" for entities.

Documentation to be written, but for now check out the source code of the demo app.

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
