export class GlobalUIClass {
  static items = [];
}

console.log('Checking Global UI');
if (window.GlobalUI == null) {
  if (window.top.GlobalUI == null) {
    window.top.GlobalUI = GlobalUIClass;
    console.log('Global UI set in top');
  }
  window.GlobalUI = window.top.GlobalUI;
  console.log('Global UI set from top');
}
export let GlobalUI = window.GlobalUI;
