import { UI } from "@peasy-lib/peasy-ui";
import 'styles.css';
import { Input } from '@peasy-lib/peasy-input';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

const model = {
  actions: [] as string[],
  borderElement: null as any,
  modal: null as any,
  modalKeys: null as any,
  x: 100,
  y: 100,
};
async function main(): Promise<void> {
  UI.create(document.body, `
    <div class="main">
      <div class="border" \${ ==> borderElement}>
        <div class="viewport">
          <div \${action <=* actions}>\${action}</div>
        </div>
        <div class="ball" style="translate: \${x}px \${y}px;"></div>
      </div>
   </div>
   `, model);

  Input.initialize(10); // Repeats per second

  // Call mapping.unmap() to remove mapping
  const mapping = Input.map(
    {
      ArrowLeft: 'walk-left',
      ArrowRight: 'walk-right',
      ArrowDown: 'walk-down',
      ArrowUp: 'walk-up',
      Escape: { action: 'close', repeat: false },
      ' ': { action: 'interact', repeat: false },
      'Shift+ArrowLeft': 'run-left',
      'Shift+ArrowRight': 'run-right',
      'Shift+ArrowDown': 'run-down',
      'Shift+ArrowUp': 'run-up',
    },
    (action: string, doing: boolean) => {
      if (doing) {
        model.actions.push(action);
        switch (action) {
          case 'interact':
            if (model.modal == null) {
              openModal(model);
            } else {
              closeModal(model);
            }
            break;
          case 'close':
            if (model.modal != null) {
              closeModal(model);
            }
            break;
        }
        moveActions(model, action);
      }
    });
  Input.map({ w: 'walk-up' });
  Input.map(['a', 's', 'd']);
  Input.map('g', () => console.log('g:', Input.is('g')));
  // requestAnimationFrame(start);
}

function tick() {
  console.log('is a', Input.is('a'), Input.is('ArrowLeft'), Input.is('walk-up'));
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
// let last;
// function start(now: number) {
//   last = now;
//   requestAnimationFrame(update);
// }

// function update(now: number) {
//   const deltaTime = (now - last) / 1000;
//   last = now;
//   Input.update(deltaTime);
//   UI.update();

//   // console.log('action is walk-up', Input.is('walk-up'), 'modal-up', Input.is('modal-up'));

//   requestAnimationFrame(update);
// }

function openModal(model) {
  model.modal = UI.create(model.borderElement,
    `<div class="modal">
    A modal with (imagined) options
    that remaps arrow keys and space</div>`,
    {});
  model.modalKeys = Input.map({
    ArrowLeft: { action: 'modal-left', repeat: false },
    ArrowRight: { action: 'modal-right', repeat: false },
    ArrowDown: { action: 'modal-down', repeat: false },
    ArrowUp: { action: 'modal-up', repeat: false },
    ' ': { action: 'select', repeat: false },
  },
    (action: string, doing: boolean) => {
      model.actions.push(`${action}: ${doing}`);
      if (doing) {
        if (action === 'select') {
          closeModal(model);
        }
      }
    });
}
function closeModal(model) {
  model.modal.destroy();
  model.modalKeys.unmap();
  model.modal = null;
  model.modalKeys = null;
}

function moveActions(model, action) {
  let move = 0;
  const [speed, direction] = action.split('-');
  switch (speed) {
    case 'run': move += 4;
    case 'walk': move += 4;
  }
  switch (direction) {
    case 'up':
      moveY(model, -move);
      break;
    case 'down':
      moveY(model, move);
      break;
    case 'left':
      moveX(model, -move);
      break;
    case 'right':
      moveX(model, move);
      break;
  }
}

function moveX(model, d) {
  model.x = Math.max(Math.min(model.x + d, 375), 0);

}
function moveY(model, d) {
  model.y = Math.max(Math.min(model.y + d, 375), 0);

}

// const mapping = Input.map(
// {
//   ArrowLeft: 'walk-left',
//   ArrowRight: 'walk-right',
//   ArrowDown: 'walk-down',
//   ArrowUp: 'walk-up',
//   Escape: { action: 'close', repeat: false },
//   ' ': { action: 'interact', repeat: false },
// },
// null,
// 'interval'
// );

// // In rAF:
// Input.update(deltaTime);
// if (Input.is('walk-left') { /* True every key repeat interval */ }
// if (Input.is('interact') { /* True only first time after a keypress, not repeating */ }
