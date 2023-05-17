import { UI } from "./ui";
import { UIAnimation } from "./ui-animation";
import { UIBinding } from "./ui-binding";

export class UIView {
  public state: 'created' | 'bound' | 'attaching' | 'attached' | 'rendered' | 'destroyed' = 'created';
  public parent!: typeof UI | UIBinding | UIView;
  public model: any;
  public element!: HTMLElement;
  public host?: Element | null = null; // Web component host
  public bindings: UIBinding[] = [];
  public views: UIView[] = [];
  public animations: UIAnimation[] = [];
  public animationQueue: UIAnimation[] = [];
  public destroyed: '' | 'queue' | 'destroy' | 'destroyed' = '';
  public moved: '' | 'queue' | 'move' = '';

  public attached!: Promise<void>;
  private attachResolve!: () => void;
  private parentElement!: HTMLElement;
  private sibling!: HTMLElement | null;

  public static create(parent: HTMLElement, model = {}, template: HTMLElement | null, options: { parent?: any; prepare?: boolean; sibling?: any; host?: Element } = { parent: null, prepare: true, sibling: null }): UIView {
    const view = new UIView();

    view.model = model;
    view.element = template ?? parent;
    view.parent = (options.parent ?? UI);
    view.host = options.host ?? (view.parent as UIView).host;
    if (template instanceof HTMLTemplateElement || template?.tagName === 'TEMPLATE') {
      const content = (template as HTMLTemplateElement).content.cloneNode(true) as HTMLElement;
      if (content.children.length === 1) {
        // console.log('TEMPLATE, single child');
        return UI.create(parent, model, content.firstElementChild as HTMLElement, options);
      }
      // console.log('TEMPLATE, many children');
      view.views = [...content.children].map(child => UI.create(parent, model, child as HTMLElement, { ...options, ...{ parent: view } }));
      view.state = 'rendered';
    } else {
      view.bindings.push(...UI.parse(view.element, model, view, options.parent));
    }
    view.parentElement = template != null ? parent : parent.ownerDocument.documentElement;
    view.sibling = options.sibling;

    // console.log('Not TEMPLATE');
    if (view.views.length > 1) {
      view.attached = Promise.all(view.views.map(v => v.attached)) as unknown as Promise<void>;
    } else {
      view.attached = new Promise((resolve) => {
        view.attachResolve = resolve;
      });
    }

    return view;
  }

  public destroy(): void {
    this.views.forEach(view => view.destroy());
    // console.log('[view] destroy', this.element, this.model, this.element.getAnimations({ subtree: true }));
    this.element.classList.add('pui-removing');
    this.destroyed = 'queue';
    UI.destroyed.push(this);
  }

  public terminate(): void {
    // console.log('[view] terminate', this.element, this.model, this.element.getAnimations({ subtree: true }));
    void Promise.all(
      this.getAnimations()
      // this.element.getAnimations({ subtree: true })
      //   .map(animation => animation.finished)
    ).then(() => {
      // console.log('[view] remove', this.element, this.element.getAnimations({ subtree: true }));
      this.element.parentElement?.removeChild(this.element);
      this.bindings.forEach(binding => binding.unbind());

      const index = (this.parent as UIView).views.findIndex((view: UIView) => view === this);
      if (index > -1) {
        (this.parent as UIView).views.splice(index, 1);
      }
    });
    this.destroyed = 'destroyed';
  }

  public move(sibling: HTMLElement): void {
    // console.log('[view] move', this.element, this.model, this.model.$model.card?.suit, this.model.$model.card?.value, sibling.innerText);
    this.moved = 'queue';
    this.element.classList.add('pui-moving');
    this.sibling = sibling;
  }

  public play(animation: string | UIAnimation, element: HTMLElement): UIAnimation {
    if (typeof animation === 'string') {
      animation = this.animations.find(anim => anim.name === animation)!.clone();
    }
    animation.element = element;
    animation.state = 'pending';
    this.animationQueue.push(animation);
    this.updateAnimations(performance.now());

    return animation;
  }

  public updateFromUI(): void {
    this.views.forEach(view => view.updateFromUI());
    this.bindings.forEach(binding => binding.updateFromUI());
  }
  public updateToUI(): void {
    this.views.forEach(view => view.updateToUI());
    this.bindings.forEach(binding => binding.updateToUI());

    // if (this.element.classList.contains('impact')) {
    //   debugger;
    // }
    switch (this.state) {
      case 'created':
        // console.log('[view] add', this.element, this.model);
        this.element.classList.add('pui-adding');
        if (!this.element.hasAttribute('PUI-UNRENDERED')) {
          (this.parentElement ?? UI.parentElement(this.element, this.parent as UIBinding)).insertBefore(this.element, this.sibling?.nextSibling ?? null);
        }
        this.attachResolve();
        this.state = 'attaching';
        break;
      case 'attaching':
        if (
          this.getAnimations(false).length === 0
          // this.element.getAnimations({ subtree: false })
          // .filter(animation => animation.playState !== 'finished').length === 0
        ) {
          this.element.classList.remove('pui-adding');
          this.state = 'attached';
        }
        break;
      case 'attached':
        this.state = 'rendered';
        break;
    }
  }
  public updateAtEvents(): void {
    this.views.forEach(view => view.updateAtEvents());
    this.bindings.forEach(binding => binding.updateAtEvents());
  }

  public updateAnimations(now: number): void {
    while (this.animationQueue[0]?.state === 'finished' ?? false) {
      const finished = this.animationQueue.shift();
      finished!.destroy();
    }
    for (let i = 0; i < this.animationQueue.length; i++) {
      const animation = this.animationQueue[i];
      if (animation.state !== 'pending') {
        continue;
      }
      if (animation.isBlocked(now)) {
        continue;
      }
      animation.state = 'playing';
      animation.startTime = now;
      animation.animation = animation.element!.animate(animation.keyframes, animation.options!);
      animation.finished = animation.animation.finished;
      void animation.finished.then(() => {
        (animation as UIAnimation).state = 'finished';
        this.updateAnimations(performance.now());
      });
    }
  }

  public updateMove(): void {
    switch (this.moved) {
      case 'queue':
        this.moved = 'move';
        break;
      case 'move':
        // Promise.all(
        //   this.element.getAnimations({ subtree: true })
        //     .map(animation => animation.finished)
        // ).then(() => {
        // if (this.element.getAnimations({ subtree: true }).length === 0) {
        if (this.getAnimations().length === 0) {
          const parent = UI.parentElement(this.element, this.parent as UIBinding);
          // console.log('[view] moving', this.element.nextSibling === this.sibling.nextSibling, '>', (this.element.nextSibling as any).cloneNode(), '<', (this.sibling.nextSibling as any).innerText)
          parent.insertBefore(this.element, this.sibling!.nextSibling);
          this.element.classList.remove('pui-moving');
          this.moved = '';
          this.sibling = null;
        }
        // });
        break;
    }
    this.bindings.forEach(binding => binding.updateMove());
  }

  private getAnimations(subtree = true) {
    return this.element.getAnimations({ subtree })
      .filter(animation => animation.playState !== 'finished' && animation.effect?.getTiming().iterations !== Infinity)
      .map(animation => animation.finished);
  }
}
