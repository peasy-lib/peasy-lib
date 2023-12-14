import { TicTacToeWorld } from './tic-tac-toe-world.js';
import { AgentPlay } from './agent-play.js';
import { Win } from './win.js';
import { Agent } from '@peasy-lib/peasy-agent';

const agent = Agent.create({
  id: 'cross',
  actions: [AgentPlay],
  goals: [new Win(1)],
});
const opponent = Agent.create({
  id: 'circle',
  actions: [AgentPlay],
  goals: [new Win(1)],
  active: false,
});

let player = 'circle';
let ended = false;
const wins = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
const slots = [...Array.from(document.querySelectorAll('.board > div > div'))];
const status = document.querySelector('.status');
const again = document.querySelector('a');

function turn() {
  return slots.map(s => s.classList.value).filter(v => v.replace('unallowed', '')).length;
}

(window as any).play = (e) => {
  // function play(e) {
  if (ended) return;

  let target = e.target;
  while (target.firstChild) target = target.firstChild;

  // if (turn() === 0 && target === slots[4]) return;
  if (target.classList.contains('unallowed')) return;
  slots[4].classList.remove('unallowed');

  if (target.classList.value !== '') return;

  target.classList.add(player);

  for (const check of wins) {
    if (check.every(i => slots[i].classList.value === player)) {
      status.textContent = player + " won!";
      again.classList.remove('hide');
      slots.forEach(s => s.classList.add('unallowed'));
      ended = true;
      return;
    }
  }
  if (turn() === 9) {
    status.textContent = "It's a draw!";
    again.classList.remove('hide');
    ended = true;
    return;
  }

  player = player === 'circle' ? 'cross' : 'circle';
  status.textContent = player + "'s turn.";

  if (player === 'cross') {
    console.log("AI's turn", agent);
    const world = TicTacToeWorld.create(slots);
    world.nodeCounts = {};
    world.performances = {};

    const agentActions = Agent.getSelectedActions(world);
    for (const agentAction of agentActions) {
      const { action } = agentAction;
      const squareIndex = action.context.target;
      (document.querySelectorAll('.board > div')[squareIndex] as HTMLElement).click();
    }
  }
}

(window as any).restart = () => {
  // function restart() {
  slots.forEach(s => s.classList.value = '');
  player = 'circle';
  status.textContent = "New game, " + player + " starts."
  again.classList.add('hide');
  slots[4].classList.add('unallowed');
  ended = false;
}
