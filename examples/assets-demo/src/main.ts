import 'styles.css';
import { Assets } from '@peasy-lib/peasy-assets';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

async function main(): Promise<void> {
  Assets.initialize();

  const uiElement = document.querySelector('#ui');
  const butlerElement = document.querySelector('#butler') as HTMLImageElement;
  const fontElement = document.querySelector('#font-test') as HTMLDivElement;

  alert('Start load');

  await Assets.load(['butler.png', 'Tileset.png', { src: 'butler.png', name: 'butler2' }, { name: 'space', family: 'Viper Squadron', src: 'VIPESRG.woff' }]);
  // Assets.load(['butler.png', 'Tileset.png', { src: 'butler.png', name: 'butler2' }, { name: 'space', family: 'Viper Squadron', src: 'VIPESRG.woff' }]);

  console.log('Sync', Assets.image('butler'), Assets.image('Tileset'), Assets.image('butler'), Assets.audio('mario-coin'), Assets.font('Viper Squadron'));

  try {
    // These only work if awaited
    butlerElement.src = Assets.image('butler').src;
    uiElement.appendChild(Assets.image('Tileset'));
    fontElement.style.fontFamily = Assets.font('space').family;
    console.log('status', Assets.requested, Assets.loaded, Assets.pending);
    // Assets.audio('mario-coin').play();
  } catch (e) {
    console.warn('Failed to use image(s)', e);
  }

  setTimeout(async () => {
    console.log('Async', Assets.image('butler'), Assets.image('Tileset'), Assets.image('butler'));

    // These always work since the assets have been loaded during timeout
    butlerElement.src = Assets.image('butler').src;
    uiElement.appendChild(Assets.image('butler2'));
    fontElement.style.fontFamily = Assets.font('space').family;
    console.log('status', Assets.requested, Assets.loaded, Assets.pending);
    // Assets.audio('music').play();

    const butlerImage = Assets.image('butler');
    const canvas = document.createElement("canvas");
    canvas.width = butlerImage.width;
    canvas.height = butlerImage.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(butlerImage, 0, 0);

    const dataURL = canvas.toDataURL("image/png");
    console.log('dataURL', dataURL);
    await Assets.load([{ src: dataURL, name: 'butlerData' }]);
    uiElement.appendChild(Assets.image('butlerData'));
  }, 2000);
}
