import 'styles.css';
import { Assets } from '@peasy-lib/peasy-assets';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

async function main(): Promise<void> {
  Assets.initialize();

  const uiElement = document.querySelector('#ui');
  const butlerElement = document.querySelector('#butler') as HTMLImageElement;

  alert('Start load');

  // await Assets.load(['butler.png', 'Tileset.png', { src: 'butler.png', name: 'butler2' }, 'mario-coin.mp3', { src: 'motivation-epic-inspire.mp3', name: 'music' }]);
  await Assets.load(['butler.png', 'Tileset.png', { src: 'butler.png', name: 'butler2' }]);

  console.log('Sync', Assets.image('butler'), Assets.image('Tileset'), Assets.image('butler'), Assets.audio('mario-coin'));

  try {
    // These only work if awaited
    butlerElement.src = Assets.image('butler').src;
    uiElement.appendChild(Assets.image('Tileset'));

    // Assets.audio('mario-coin').play();
  } catch (e) {
    console.warn('Failed to use image(s)', e);
  }

  setTimeout(() => {
    console.log('Async', Assets.image('butler'), Assets.image('Tileset'), Assets.image('butler'));

    // These always work since the assets have been loaded during timeout
    butlerElement.src = Assets.image('butler').src;
    uiElement.appendChild(Assets.image('butler2'));
    // Assets.audio('music').play();
  }, 2000);
}
