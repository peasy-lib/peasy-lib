# Peasy States

This is the repository for Peasy States, a small-ish and relatively easy to use state machine library.

## Introduction

Peasy States provides the possibility to create (fixed step) state machines that will invoke a callback at a desired interval.

## First look

```ts
import { States } from '@peasy-lib/peasy-states';

States.create((deltaTime: number) => {
  // Called 60 times per second with deltaTime = 16.667
});
```
<!-- TODO: Finish examples above -->

## Getting started

If you've got a build process and are using npm, install Peasy States with

    npm i @peasy-lib/peasy-states

and `import` it into whichever files you want to use it

```ts
import { States } from '@peasy-lib/peasy-states';
```

If you don't have a build process or don't want to install it, use a `script` tag

```html
<script src="https://unpkg.com/@peasy-lib/peasy-states">
```
to make `States` available.

## Features and syntax

Peasy States enables creating one or more (fixed step) state machines and specify individual callbacks and callback intervals for each one. In addition, an state machine can be manually started, stopped and paused.

```ts
function update(deltaTime: number) {
  // Update physics based on delta time
}

function render() {
  if (Input.is('menu')) {
    physicsEngine.pause();
  } else if (Input.is('close-menu')) {
    physicsEngine.start();
  }

  // Draw/create ui
}

const renderEngine = Engine.create(render);
const physicsEngine = Engine.create({ fps: 240, callback: update, started: false });

// Create world

physicsEngine.start();

// Clean up
renderEngine.destroy();
physicsEngine.destroy();
```
Setting `oneTime` to `true` will make an engine fire its callback once and then self-destruct.
```ts
const trapEngine = Engine.create({ ms: 5000, callback: triggerTrap, oneTime: true });

trapEngine.pause(); // Now time is paused for this engine

trapEngine.start(); // Time starts ticking again
```
In addition to controlling individual engines, Peasy Engine provides methods to control all engines that haven't been created with `isolated` set to `true`.
```ts
const renderEngine = Engine.create({ fps: 60, callback: render, isolated: true });
Engine.create({ fps: 240, callback: updatePhysics });
Engine.create({ ms: 5000, callback: triggerTrap, oneTime: true });

// Pause and start all engines except renderEngine
if (Input.is('menu')) {
  Engine.pause();
} else if (Input.is('close-menu')) {
  Engine.start();
}

// Clean up
renderEngine.destroy();
Engine.destroy();
```

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
