# Peasy Audio

This is the repository for Peasy Audio, a small-ish and relatively easy to use audio library.

## Introduction

Peasy Audio provides uncomplicated Audio for HTML. It's intended to be used in vanilla JavaScript/Typescript projects where using "proper audio" is too cumbersome and adding a complete engine is overkill or simply not desired. Thanks to the small scope of the library, performance is decent.

## First look

In Peasy Audio one or more audio layers are added on top of existing graphics in an element serving as viewport. Peasy Audio only requires light sources to be added, but by providing informaton about entities more advanced features such as layered audio and shadows can be used.

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
const light = Audio.addLight({
  entity: light,
  viewport: document.querySelector('#my-viewport'),
});
// Render the light source
Audio.update();

// Move the light source
light.position.x = 200;
light.position.y = 250;
light.radius = 200;
light.color = 'green';

// Render the moved light source
Audio.update();
```
This example creates and renders a light source and then moves and re-renders it.

## Getting started

If you've got a build process and are using npm, install Peasy Audio with

    npm i @peasy-lib/peasy-audio

and `import` it into whichever files you want to use it

```ts
import { Audio } from '@peasy-lib/peasy-audio';
```

If you don't have a build process or don't want to install it, use a `script` tag of type `module` and import from `https://cdn.skypack.dev/@peasy-lib/peasy-audio` instead.

```html
<html>
<body>
  <div id="my-viewport" style="position: relative; widht: 400; height: 400;">
    <div>Hello, world!</div>
  </div>
  <script type="module">
    import { Audio } from "https://cdn.skypack.dev/@peasy-lib/peasy-audio";

    // Add a static light source
    Audio.addLight({
        position: { x: 150, y: 150 },
        radius: 250,
        color: 'red',
        viewport: document.querySelector('#my-viewport'),
    });
    // Render the light source
    Audio.update();
  </script>
</body>
</html>
```

## Features and syntax

Peasy Audio supports multiple dynamic light sources with colour mixing for overlapping lights. By specifying information about entities and normal maps it's possible to also get "3d shadows" for entities.

Documentation to be written, but for now check out the source code of the demo app.

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
