# Peasy Assets

This is the repository for Peasy Assets, a small-ish and relatively easy to use assets library.

## Introduction

Peasy Assets provides assets handling that maps asset names to (pre)loaded assets.

## First look

```ts
import { Assets } from '@peasy-lib/peasy-assets';

Assets.initialize({ src: '/public/assets/' }); // Not necessary, but shortens future paths

await Assets.load([ 'cat.png', { src: 'mouse.jpg', name: 'cat-food' }, 'miao.wav' ]);

const catImage = Assets.image('cat'); // A HTMLImageElement ready to use
const catFood = Assets.image('cat-food'); // A HTMLImageElement ready to use
const catAudio = Assets.audio('miao'); // A HTMLAudioElement ready to use
```
<!-- TODO: Finish examples above -->

## Getting started

If you've got a build process and are using npm, install Peasy Assets with

    npm i @peasy-lib/peasy-assets

and `import` it into whichever files you want to use it

```ts
import { Assets } from '@peasy-lib/peasy-assets';
```

If you don't have a build process or don't want to install it, use a `script` tag

```html
<script src="https://unpkg.com/@peasy-lib/peasy-assets">
```
to make `Assets` available.

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
