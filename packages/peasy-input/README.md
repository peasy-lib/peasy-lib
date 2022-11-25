# Peasy Input

This is the repository for Peasy Input, a small-ish and relatively easy to use input library.

## Introduction

Peasy Input provides input handling that maps keys, clicks and taps to actions and let's the application be action based rather than tied to specific input device events. It supports both a callback and a query usage. In both usages, both repeating and non-repeating actions can be specified.

## First look

Callback usage:
```ts
import { Input } from 'peasy-input';

const mapping = Input.map(
  {
    ArrowLeft: 'walk-left',
    ArrowRight: 'walk-right',
    Escape: { action: 'close', repeat: false },
    ' ': { action: 'interact', repeat: false },
    'Shift+ArrowLeft': 'run-left',
    'Shift+ArrowRight': 'run-right',
  },
  (action: string, doing: boolean) => {
    if (doing) {
      switch (action) {
        case 'interact':
          if (modal == null) {
            openModal();
          } else {
            closeModal();
          }
          break;
        case 'close':
          if (modal != null) {
            closeModal();
          }
          break;
      }
      moveActions(action);
    }
  }
);

function openModal() {
  // Code to open modal

  modalKeys = Keyboard.map({
    ArrowLeft: { action: 'modal-left', repeat: false },
    ArrowRight: { action: 'modal-right', repeat: false },
    ' ': { action: 'select', repeat: false },
  },
    (action: string, doing: boolean) => {
      if (doing) {
        if (action === 'select') {
          closeModal();
        }
      }
    });
}
function closeModal() {
  // Code to close modal
  modalKeys.unmap();
  modalKeys = null;
}
```
<!-- Shortcut form callback usage (callback not called when action stops):
```ts
const mappings = [
  Input.map('ArrowLeft', () => player.x -= player.speed),
  Input.map('ArrowRight', () => player.x += player.speed),
];
``` -->
Query usage:
```ts
const mapping = Input.map({
  ArrowLeft: 'walk-left',
  ArrowRight: 'walk-right',
});

const tick = () => {
  if (Input.is('walk-left')) player.x -= player.speed;
  if (Input.is('walk-right')) player.x += player.speed;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```
<!-- TODO: Finish examples above -->

## Getting started

If you've got a build process and are using npm, install Peasy Input with

    npm i peasy-input

and `import` it into whichever files you want to use it

```ts
import { Input } from 'peasy-input';
```

If you don't have a build process or don't want to install it, use a `script` tag

```html
<script src="https://unpkg.com/peasy-input">
```
to make `Input` available.

## Features and syntax

#### Control updates

Peasy Input will by default use `requestAnimationFrame` for notifications and repeats. By calling `Input.initialize` before any other `Input` method a number can be provided to set notifications and repeats per second and `false` to prevent Peasy Input from doing any notifications at all.

```ts
Input.initialize(30, false);

const tick = () => {
    doSomething();
    Input.update();
    doSomethingElse();
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
