# Peasy Physics

This is the repository for Peasy Physics, a small-ish and relatively easy to use physics library.

## Introduction

Peasy Physics provides uncomplicated physics. It's intended to be used in vanilla JavaScript/Typescript projects.

## First look

Peasy Physics applies physics to one or more added entities according to the forces applied to their shapes.

```ts
// Add an entity
const entity = {
  position: { x: 100, y: 100 },
  color: 'blue',
  shapes: [{ radius: 50 }],
  maxSpeed: 500,
  forces: [{ direction: { x: 50, y: 25 }, duration: 0 }],
};
const physicsEntity = Physics.addEntities(entity);

// Add some more force
physicsEntity.addForce({
  name: 'movement',
  direction: new Vector(100, 50),
  maxMagnitude: 500,
  duration: 0,
});

// In game loop
Physics.update();
```
This example adds an entity and then tracks it regarding movement and collisions.

## Getting started

If you've got a build process and are using npm, install Peasy Physics with

    npm i @peasy-lib/peasy-physics

and `import` it into whichever files you want to use it

```ts
import { Physics } from '@peasy-lib/peasy-physics';
```

If you don't have a build process or don't want to install it, use a `script` tag of type `module` and import from `https://cdn.skypack.dev/@peasy-lib/peasy-physics` instead.

```html
<html>
<body>
  <div id="my-viewport" style="position: relative; widht: 400; height: 400;">
    <div>Hello, world!</div>
  </div>
  <script type="module">
    import { Physics } from "https://cdn.skypack.dev/@peasy-lib/peasy-physics";

    // Add an entity
    const entity = {
      position: { x: 100, y: 100 },
      color: 'blue',
      shapes: [{ radius: 50 }],
      maxSpeed: 500,
      forces: [{ direction: { x: 50, y: 25 }, duration: 0 }],
    };
    const physicsEntity = Physics.addEntities(entity);

    // Add some more force
    physicsEntity.addForce({
      name: 'movement',
      direction: new Vector(100, 50),
      maxMagnitude: 500,
      duration: 0,
    });

    const tick = () => {
      Physics.update();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  </script>
</body>
</html>
```

## Features and syntax

To be written.

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
