import { UI } from '@peasy-lib/peasy-ui';
import 'styles.css';
// import 'styles5.css';
import { MyComponent } from './my-component';

// import * as Template from './demo.html';

// console.log('Template', Template, Template.default);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

function main3() {
  //     <img onload="imgLoaded" src="\${imgsrc}" alt=""  \${load@=>load}/>
  // <img onload="imgLoaded()" alt=""/>

  const template = `
    <div>
      <div class="window" style="width: \${width}px; height: \${height}px;">
        <div class="corner" \${mousedown @=> mouseDown}></div>
        <div class="content first">The first part</div>
        <div class="content second">The second part</div>
      </div>
    </div>`;
  const model = {
    moving: false,
    width: 400,
    height: 400,
    mouseDown(ev) {
      model.moving = true;
    },
    mouseUp(ev) {
      model.moving = false;
    },
    mouseMove(ev) {
      if (model.moving) {
        // console.log('Moving mouse', ev);
        model.width += ev.movementX;
        model.height += ev.movementY;
        // model.width = clamp(model.width, 200, 600);
        // model.height = clamp(model.height, 200, 600);
      }
    },
  };
  UI.create(document.body, template, model);

  document.addEventListener('mousemove', model.mouseMove);
  document.addEventListener('mouseup', model.mouseUp);

  // let pSrc;
  // setInterval(() => {
  //   UI.update();
  //   // const img = document.querySelector('img');
  //   // const src = model.imgsrc;
  //   // if (src !== pSrc) {
  //   //   console.log('update img', img_index, pSrc, '=>', src);
  //   //   img.src = src;
  //   //   pSrc = src;
  //   // }
  // }, 1000 / 60);
}


async function main2(): Promise<void> {
  console.log('Hello, World!');

  let index = 0;

  UI.initialize();
  model = {
    branches: <any>[],
    currentBranch: 0,
    get branch() {
      return this.branches[this.currentBranch];
    },
    get getGetData() {
      return this.branches;
    },
    get getConditions() {
      const conditions = this.branch.conditions;
      return Object.keys(conditions).map(id => {
        return { id, key: `${id}:${conditions[id]}`, entry: conditions[id] };
      });
    },
    insertData: (_event: any, model: any) => {
      model.branches.push({
        id: index,
        conditions: {},
      });
    },
    insertCondition: (_event: any, model: any) => {
      const key = window.prompt("insert key");
      if (key) model.branch.conditions[key] = false;
    },
    toggleFlag: (event: any, model: any, element: HTMLElement, _attribute: any, object: any) => {
      debugger;
      const key = element.getAttribute("data-key");
      console.log(key);

      console.log(object.$parent.$parent.$model);

      object.$parent.$parent.$model.branch.conditions[<string>key] = !object.$parent.$parent.$model.branch.conditions[<string>key];

      console.log(object.$parent.$parent.$model.branch.conditions[<string>key]);
    },
  };

  UI.create(document.body, `
  <div>
    <a href="#" \${click@=>insertData}>Insert New Data</a>
    <a href="#" \${click@=>insertCondition}>Insert New Condition</a>
    <div \${d<=*getGetData}>
      Conditions:
      <div style="width: 200px; border: 1px solid white; display: flex; justify-content: space-evenly; align-items: flex-start" \${c<=*getConditions:id}>
        <div>\${c.id}</div>
        <span>:</span>
        <div>\${c.entry}</div>
        <a href="#"  \${click@=>toggleFlag} data-key="\${c.id}">Toggle Flag</a>
      </div>

    </div>
  </div>
   `, model);
}

async function main4(): Promise<void> {
  console.log('Hello, World!');

  UI.initialize();
  model = {
    darkMode: false,
  };

  UI.create(document.body, `
  <div class="\${ 'dark' = darkMode } \${ 'light' ! darkMode }">\${ 'Dark' = darkMode } \${ 'Light' ! darkMode } mode</div>
   `, model);

  setTimeout(() => model.darkMode = true, 3000);
}

async function main5(): Promise<void> {
  const template = `<div>
      <button \${click@=>button}>Toggle data</button>
      <div class="dataEntry" \${ entry <=* currentArray:id }>
          <div>id: \${entry.id}</div>
          <div>SRC: \${entry.src}</div>
          <div>X : \${entry.x}</div>
          <div>Y : \${entry.y}</div>
      </div>
      </div>`;

  class App {
    currentKey: 'A' | 'B' = "A";

    myMap = {
      A: [
        {
          id: 0,
          src: "A first string",
          x: 23,
          y: 42,
        },
        {
          id: 1,
          src: "A 2nd string",
          x: 32,
          y: 24,
        },
      ],
      B: [
        {
          id: 0,
          src: "B string",
          x: 3454,
          y: 4123,
        },
        {
          id: 1,
          src: "B 2nd string",
          x: 7890,
          y: 6747,
        },
      ],
    };

    // myArray = this.myMap[this.currentKey];

    get currentArray() {
      return this.myMap[this.currentKey];
    };

    button = () => {
      console.log("before: ", this.currentArray);

      this.currentKey = this.currentKey === 'A' ? 'B' : 'A';
      // myArray = this.myMap[this.currentKey];
      // this.myArray = [...];

      /* this.myMap[nextKey].forEach((key: any) => {
        this.myArray.push(key);
      }); */
      console.log("after: ", this.currentArray);
    };
  }

  UI.create(document.body, template, new App());
}



const balls = 200;
let model;
async function main(): Promise<void> {
  console.log('Hello, World!');

  let demoUI;

  UI.initialize();
  model = {
    darkMode: false,
    MyComponent,
    models: [{ item: 1 }, { item: 3 }],
    components: [MyComponent.create({ item: 1 }), MyComponent.create({ item: 3 })],
    showComponents: true,
    players: [
      { name: 'asdf', colors: [{ c: 'red' }, { c: 'green' }] },
      { name: 'qwer', colors: [{ c: 'blue' }, { c: 'yellow' }] },
    ],
    color: 'lightgray',
    textareaMessage: 'This is the message in the textarea',
    drawerMessage: 'Any kind of message',
    message: '',
    transitionDuration: 0,
    list: ['one', 'two', 'three'],
    left: false,
    right: true,
    undef: undefined as any,
    demo: 'card',
    clicked: (_event, model, _boundElement, _boundEvent) => {
      model.transitionDuration += 2000;
      model.color = 'gold';
    },
    get hasNoColor() { return (this.color.length ?? '') === 0; },
    changed: async (_ev, model, element) => {
      model.transitionDuration = 0;
      model.color = 'lightgreen';
      demoUI = await selectDemo(model, demoUI);
    },
    card: {
      value: 'The Ace',
      position: { x: 50, y: 25 },
      faceUp: false,
      get rotateY() { return this.faceUp ? 0 : 180; },
      flip: () => model.card.faceUp = !model.card.faceUp,
    },
    balls: [],
    todos: [],
    get remainingTodos() { return model.todos.filter(todo => !todo.done) },
    get doneTodos() { return model.todos.filter(todo => todo.done) },
    get hasRemaining() { return model.remainingTodos.length > 0; },
    get hasDone() { return model.doneTodos.length > 0; },
    addTodo: (_event, model) => {
      model.todos.push({ text: model.todo, done: false });
      model.todo = '';
      model.inputElement.focus();
      console.log(model);
    },
    removeTodo: (_event, model, _element, _at, context) => {
      console.log(model, _at, context);
      context.$parent.$model.todos = context.$parent.$model.todos.filter(todo => todo !== model.todo);
    },

    // slots: [],
    animationElement: null,

    cards: [],
    shuffle: (_event, model) => {
      // const shuffled = shuffle(model.cards);
      // shuffled.forEach((card, index) => card.$index = index);
      // setTimeout(() => model.cards = shuffled, 500);
      model.cards = shuffle(model.cards);
    },

    drawerUI: null as any,
    get showDrawer() {
      return model.message.length > 0 ? 'show-drawer' : '';
    },
    async setMessage() {
      if (model.drawerUI == null) {
        model.drawerUI = UI.create(document.body, `<div class="drawer \${showDrawer}" \${click @=> clearMessage}>\${message}</div>`, model);
        await model.drawerUI.attached;
      }
      model.message = model.drawerMessage;
    },
    clearMessage() {
      model.message = '';
      // setTimeout(() => {
      model.drawerUI.destroy();
      model.drawerUI = null;
      // }, 500);
    },

    maxHp: 100,
    hp: 50,
    get barPercentage() {
      return Math.round(model.hp / model.maxHp * 100);
    },
    hpInc() { model.hp += 10; },
    hpDec() { model.hp -= 10; },
    slashX: 250,
    doSlash: false,
    animations: [],
    impact() { for (let i = 0; i < 5; i++) model.animations.push({ name: 'impact', x: random(-300, 200), y: random(-100, 200), text: 'HELLO, WORLD!' }); }
  };

  //       <div \${ ==> stateChanged ==> animationRun }>Stage changed test</div>

  UI.create(document.body, `
    <div class="main" style="background-color: \${|color}; transition-duration: \${|transitionDuration}ms;">
      <div class="slash" \${ === doSlash}></div>
      <div \${ animation <=* animations } class="\${animation.name}" style="left: \${animation.x}px; top: \${animation.y}px;">\${animation.text}</div>
      <button \${click @=> impact}>Impact</button>
      <div class="player" \${player <=* players}>
        <div>Name: \${player.name} - colors: <span \${playerColor <=* player.colors}> (\${player.name}) \${playerColor.c} </span></div>
      </div>
      <hr>
      <div class="player" \${player <=* players:name}>
        <div>Name: \${player.name} - colors: <span \${playerColor <=* player.colors}> (\${player.name}) \${playerColor.c} </span></div>
      </div>
      <hr>
      <div style="height: 2px"></div>
      <div><label>Show components: <input type="checkbox" \${ checked <=> showComponents }></label></div>
      <div>Global state: \${models[0].item}, \${models[1].item}</div>
      <\${ components[0] === } \${ === showComponents }>
      <\${ MyComponent === models[1] } \${ === showComponents }>
      <\${ MyComponent === state } \${state <=* models}>
      <\${ component === } \${component <=* components}>
      <div \${item <=* list} class="item" style="background-color: \${color};">Item: \${item} <button \${click @=> clicked}>Set to gold (\${item})</button></div>
      List: \${list[1]}
      <div><input \${value<=>myIndex} name="source" type="number" min="1" max="4">: \${myIndex}</div>
      <div>Color: <input \${value <=> color}> <span>The color is <b>\${color}</b>.</span> <button \${click @=> clicked} \${disabled <== hasNoColor}>Set to gold</button></div>
      <div>Message: <input \${value <=> drawerMessage}> <button \${click @=> setMessage}>Show message</button></div>
      <div>Text: <textarea \${value <=> textareaMessage}>Textarea</textarea> \${textareaMessage}</div>
      <div>Checks: <label><input type="checkbox" \${checked <=> left}> Left</label> <label><input type="checkbox" \${checked <=> right}> Right</label> <b>\${left} \${right} <span \${ === left}> Left </span> <span \${ !== right}> Not right </span></b>  <span \${ !== undef}> Undefined </span>  <span \${ === undef}> Not Undefined </span></div>
      <div><label><input type="checkbox" \${checked <=> darkMode}> Dark mode</label></div>
      <div class="\${ 'dark-mode' = darkMode } \${ 'light-mode' ! darkMode }">\${ 'Dark' = darkMode } \${ 'Light' ! darkMode } mode</div>
      <div class="\${| 'dark-mode' = darkMode } \${| 'light-mode' ! darkMode }">Always \${| 'Dark' = darkMode } \${| 'Light' ! darkMode } mode</div>
      <div>Demo:
        <label><input type="radio" name="demo" \${'card' ==> demo} \${change @=> changed}>Card</label>
        <label><input type="radio" name="demo" \${'ball' ==> demo} \${change @=> changed}>Ball</label>
        <label><input type="radio" name="demo" \${'todo' ==> demo} \${change @=> changed}>Todo</label>
        <label><input type="radio" name="demo" \${'cards' ==> demo} \${change @=> changed}>Cards</label>
        <label><input type="radio" name="demo" \${'bar' ==> demo} \${change @=> changed}>Bar</label>
        <b>\${demo}</b>
       </div>
      <div>Demo:
        <select \${change @=> changed} \${ ==> demoElement}>
          <option \${'card' ==> demo}>Card</option>
          <option \${'ball' ==> demo}>Ball</option>
          <option \${'todo' ==> demo}>Todo</option>
          <option \${'cards' ==> demo}>Cards</option>
          <option \${'bar' ==> demo}>bar</option>
        </select>
       <b>\${demo}</b>
      </div>
      <div \${ ==> animationElement} style="width: 50px; height: 50px; background-color: red; position: relative;">XXXX</div>
   </div>
   `, model);

  console.log('model', model);

  //   const slots = 5;
  //   let templateSlots = `
  //    <div class="slots">
  //    `;
  //   for (let i = 0; i < slots; i++) {
  //     model.slots[i] = {
  //       index: i,
  //       name: i + 1
  //     };
  //     console.log('slot', model.slots[i]);
  //     templateSlots += `<div class="slot slot-\${slots[${i}].index}" style="background-color: \${color};">\${slots[${i}].name}</div>`;
  //   }
  //   templateSlots += `
  //    </div>
  //  `;
  //   UI.create(document.body, templateSlots, model);

  // setInterval(() => {
  //   for (let i = 0; i < balls; i++) {
  //     updateBall(model.balls[i]);
  //   }
  //   model.slashX = (model.slashX + 250) % 3250;
  //   UI.update();
  //   // console.log(JSON.stringify(model));
  // }, 1000 / 60);

  demoUI = await selectDemo(model, demoUI);

  setTimeout(() => model.color = 'blue', 2000);
  setTimeout(() => model.textareaMessage = 'This is an UPDATED textarea message', 2500);

  setTimeout(() => model.undef = 'defined', 3000);
  // setTimeout(() => {
  //   model.demo = 'ball';
  //   demoUI = selectDemo(model, demoUI);
  // }, 3000);
  setTimeout(() => model.color = 'skyblue', 4000);
  // setTimeout(() => model.list = model.list.concat({ id: 'four' }), 6000);
  setTimeout(() => { model.list.push('four'); model.list.push('five') }, 6000);
  setTimeout(() => { const list = model.list;[list[1], list[2]] = [list[2], list[1]]; }, 7000);
  setTimeout(() => { model.list = model.list.filter(item => item !== 'three') }, 8000);

  setInterval(() => model.card.flip(), 2500);

  setTimeout(() => {
    model.players = [
      { name: 'asdf', colors: [{ c: 'red' }, { c: 'green' }] },
      { name: 'qwer', colors: [{ c: 'blue' }, { c: 'yellow' }] },
      { name: 'jkl', colors: [{ c: 'green' }, { c: 'red' }] },
    ];
  }, 2500);
  setTimeout(() => {
    model.players = [
      { name: 'asdf', colors: [{ c: 'red' }, { c: 'green' }] },
      { name: 'jkl', colors: [{ c: 'green' }, { c: 'red' }] },
    ];
  }, 6000);
  setTimeout(() => {
    model.players = [
      { name: 'jkl', colors: [{ c: 'green' }, { c: 'red' }] },
      { name: 'asdf', colors: [{ c: 'red' }, { c: 'green' }] },
      { name: 'qwer', colors: [{ c: 'blue' }, { c: 'yellow' }] },
    ];
  }, 9500);

  setTimeout(() => model.darkMode = true, 4000);


  // setInterval(() => {
  //   const item = itemsShift(model.slots);
  //   setTimeout(() => {
  //     // itemsPush(model.slots, item);
  //   }, 1000);
  // }, 2000);

  // const anim = UIAnimation.create({
  //   name: 'change-color',
  //   keyframes: [{ backgroundColor: 'green' }],
  //   options: {
  //     duration: 5000,
  //     fill: 'forwards',
  //   },
  //   blocking: 'block',
  //   blockDuration: 1500,
  // });

  // setTimeout(() => {
  //   // anim.play(model.animationElement);
  //   const anim = UI.play('change-color', model.animationElement);
  //   UIAnimation.create({
  //     element: model.animationElement,
  //     keyframes: [{ transform: 'translateX(200px)' }],
  //     options: {
  //       duration: 2000,
  //       fill: 'forwards',
  //     },
  //   });
  //   UIAnimation.create({
  //     chain: anim,
  //     element: model.animationElement,
  //     keyframes: [{ color: 'white', class: 'test-class' }],
  //     options: {
  //       duration: 2000,
  //       fill: 'forwards',
  //     },
  //   });
  // }, 1000);

  tick();
}

let doDamage = true;
function tick() {
  for (let i = 0; i < balls; i++) {
    updateBall(model.balls[i]);
  }
  // model.slashX = (model.slashX + 250) % 3250;
  if (doDamage) {
    model.doSlash = true;
    doDamage = false;
  }
  if (model.animations.length > 0) console.log('animations before update', model.animations);
  // UI.update();
  model.doSlash = false;
  if (model.animations.length > 0) console.log('animations after update', model.animations);
  model.animations = model.animations.filter(a => !a.added);
  model.animations.forEach(a => a.added = true);

  requestAnimationFrame(tick);
}


// function itemsShift(items) {
//   items.forEach(item => item.index--);
//   return items.shift();
// }
//  function itemsPush(items, item) {
//   const maxIndex = Math.max(...items.map(item => item.index));
//   console.log(maxIndex);
//   item.index = maxIndex + 1;
//   items.push(item);
// }

function updateBall(ball) {
  ball.position.x += ball.velocity.x * 1 / 60;
  ball.position.y += ball.velocity.y * 1 / 60;
  if (ball.position.x < 0) {
    ball.position.x = 0;
    ball.velocity.x = -ball.velocity.x;
  } else if (ball.position.x > 180) {
    ball.position.x = 180;
    ball.velocity.x = -ball.velocity.x;
  }
  if (ball.position.y < 0) {
    ball.position.y = 0;
    ball.velocity.y = -ball.velocity.y;
  } else if (ball.position.y > 180) {
    ball.position.y = 180;
    ball.velocity.y = -ball.velocity.y;
  }
}

class Card {
  public constructor(public suit: string, public value: number) { }

  public get name(): string {
    switch (this.value) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return `${this.value}`;
    }
  }
  public get color(): string {
    switch (this.suit) {
      case 'clubs':
      case 'spades':
        return 'black';
      case 'diamonds':
      case 'hearts':
        return 'red';
    }
  }
  public get pip(): string {
    switch (this.suit) {
      case 'diamonds':
        return '&#9830;';
      default:
        return `&${this.suit};`;
    }
  }
  public get face(): string {
    switch (this.value) {
      case 1:
        return this.pip;
      default:
        return this.name;
    }
  }

  public get showCorners(): boolean {
    return this.value >= 4 && this.value <= 10;
  }
  public get showOuterCenter(): boolean {
    return this.value >= 2 && this.value <= 3;
  }
  public get showUpperCenter(): boolean {
    switch (this.value) {
      case 7:
      case 8:
      case 10:
        return true;
      default:
        return false;
    }
  }
  public get showLowerCenter(): boolean {
    switch (this.value) {
      case 8:
      case 10:
        return true;
      default:
        return false;
    }
  }
  public get showHighs(): boolean {
    switch (this.value) {
      case 9:
      case 10:
        return true;
      default:
        return false;
    }
  }
  public get showCenters(): boolean {
    switch (this.value) {
      case 6:
      case 7:
      case 8:
        return true;
      default:
        return false;
    }
  }
  public get showCenter(): boolean {
    switch (this.value) {
      case 3:
      case 5:
      case 9:
        return true;
      default:
        return false;
    }
  }
  public get showFace(): boolean {
    // console.log('showFace', this.suit, this.name, this.value === 1 || this.value >= 11);
    return this.value === 1 || this.value >= 11;
  }

  public get x(): number {
    return ((this as any).$index % 13) * 90;
  }
  public get y(): number {
    return Math.floor((this as any).$index / 13) * 125;
  }
}

async function selectDemo(model, demoUI) {
  // console.log('Selecting demo', model.card, model.ball, model.demo);

  const templateCard = `
  <div class="border">
    <div class="card" \${click @=> card.flip} style="
      transform: translate3d(\${card.position.x}px, \${card.position.y}px, 0) rotateY(\${card.rotateY}deg);
    ">
      <div class="card-back" style="background-color: \${color}"></div>
      <div class="card-face">\${card.value}</div>
    </div>
  </div>
  `;

  model.balls = [];
  for (let i = 0; i < balls; i++) {
    model.balls.push({
      position: { x: random(25, 175), y: random(25, 175) },
      velocity: { x: random(100, 200), y: random(100, 200) },
    });
  }

  const templateBall = `
    <div class="border">
      <div class="ball" \${ball <=* balls} style="background-color: \${color}; transform: translate3d(\${ball.position.x}px, \${ball.position.y}px, 0)"></div>
    </div>
    `;

  const templateTodo = `
    <div class="todos">
      <div class="input"><input \${value <=> todo} \${==> inputElement}> <button \${click @=> addTodo}>Add todo</button></div>
      <div class="header" \${ === hasRemaining}>Remaining</div>
      <div class="todo remaining-todo" \${todo <=* remainingTodos} style="background-color: \${color};"><label><input type="checkbox" \${checked <=> todo.done}> \${todo.text}</label> <button \${click @=> removeTodo}>Remove todo</button></div>
      <div class="header" \${ === hasDone}>Done</div>
      <div class="todo done-todo" \${todo <=* doneTodos} style="background-color: \${color};"><label><input type="checkbox" \${checked <=> todo.done}> \${todo.text}</label> <button \${click @=> removeTodo}>Remove todo</button></div>
    </div>
    `;

  model.cards = [];
  for (const suit of ['clubs', 'spades', 'diamonds', 'hearts']) {
    for (let i = 1; i <= 13; i++) {
      model.cards.push(new Card(suit, i));
    }
  }

  const templateCards = `
    <div style="margin-top: 30px;">
      <div class="cards">
        <div class="card" \${card <=* cards} style="color: \${|card.color}; position: absolute; transform: translate3d(\${card.x}px, \${card.y}px, 0);">
          <div class="value top">\${|card.name} <span \${ innerHTML <=| card.pip }></span></div>
          <div class="value bottom">\${|card.name} <span \${ innerHTML <=| card.pip }></span></div>

          <div \${ ==| card.showCorners } class="pip" style="grid-row-start: 1; grid-column-start: 1;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showOuterCenter } class="pip" style="grid-row-start: 1; grid-column-start: 2;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showCorners } class="pip" style="grid-row-start: 1; grid-column-start: 3;" \${ innerHTML <=| card.pip }></div>

          <div \${ ==| card.showUpperCenter } class="pip" style="grid-row-start: 2; grid-column-start: 2;" \${ innerHTML <=| card.pip }></div>

          <div \${ ==| card.showHighs } class="pip" style="grid-row-start: 3; grid-column-start: 1;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showHighs } class="pip" style="grid-row-start: 3; grid-column-start: 3;" \${ innerHTML <=| card.pip }></div>

          <div \${ ==| card.showCenters } class="pip" style="grid-row-start: 4; grid-column-start: 1;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showCenter } class="pip" style="grid-row-start: 4; grid-column-start: 2;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showCenters } class="pip" style="grid-row-start: 4; grid-column-start: 3;" \${ innerHTML <=| card.pip }></div>

          <div \${ ==| card.showHighs } class="pip rotated" style="grid-row-start: 5; grid-column-start: 1;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showHighs } class="pip rotated" style="grid-row-start: 5; grid-column-start: 3;" \${ innerHTML <=| card.pip }></div>

          <div \${ ==| card.showLowerCenter } class="pip rotated" style="grid-row-start: 6; grid-column-start: 2;" \${ innerHTML <=| card.pip }></div>

          <div \${ ==| card.showCorners } class="pip rotated" style="grid-row-start: 7; grid-column-start: 1;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showOuterCenter } class="pip rotated" style="grid-row-start: 7; grid-column-start: 2;" \${ innerHTML <=| card.pip }></div>
          <div \${ ==| card.showCorners } class="pip rotated" style="grid-row-start: 7; grid-column-start: 3;" \${ innerHTML <=| card.pip }></div>

          <div \${ ==| card.showFace } class="pip face" \${ innerHTML <=| card.face }></div>
        </div>
      </div>
      <button \${click @=> shuffle} style="top: -25px; position: relative;">Shuffle</button>
    </div>
    `;

  // const templateBar = `
  //   <div>
  //     <div class="bar">
  //       <div class="status" style="width: \${barPercentage}%;"></div>
  //     </div>
  //     <div>\${hp}/\${maxHp}&nbsp;&nbsp; <button \${click @=> hpDec}>-</button> <button \${click @=> hpInc}>+</button> </div>
  //   </div>
  //   `;
  const templateBar = '#bar';

  if (demoUI != null) {
    demoUI.destroy();
  }
  let template;
  switch (model.demo) {
    case 'ball':
      template = templateBall;
      break;
    case 'card':
      template = templateCard;
      break;
    case 'todo':
      template = templateTodo;
      UI.queue(() => model.inputElement.focus());
      break;
    case 'cards':
      template = templateCards;
      break;
    case 'bar':
      template = templateBar;
      break;
  }
  demoUI = UI.create(document.body, template, model);

  return demoUI;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function shuffle(array) {
  array = [...array];
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

class Something {
  private _left = 0;
  private _right = 0;

  public get left(): number {
    return this._left;
  }
  public set left(value) {
    this._left = value;
  }

  public get right(): number {
    return this._right;
  }
  public set right(value) {
    this._right = value;
  }

  public getTotal(): number {
    return this._left + this._right;
  }
}

class SomethingCleaner {
  public left = 0;
  public right = 0;

  public get total(): number {
    return this.left + this.right;
  }
}
