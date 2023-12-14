import { Goal } from '@peasy-lib/peasy-agent';

export class Win extends Goal {
  constructor(priority) {
    super('win', priority);
  }

  getScore(context) {
    const { world, agent } = context;
    return checkWin(world.state, agent.id) * this.getPriority(context);
  }
}

export function checkWin(slots, me) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  const other = me === 'cross' ? 'circle' : 'cross';

  for (const check of wins) {
    if (check.every(i => slots[i] === other)) {
      return -1;
    }
    if (check.every(i => slots[i] === me)) {
      return 1;
    }
  }
  return 0;
}
