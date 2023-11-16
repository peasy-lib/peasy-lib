import { UI } from "./ui";
import { UIAnimation } from "./ui-animation";
import { UIBinding } from "./ui-binding";

interface IUIViewOptions {
  parent?: UIView | UIBinding | null;
  prepare?: boolean;
  sibling?: UIView | Element | null;
  host?: Element;
}

export class UIView {
  public state: 'created' | 'bound' | 'attaching' | 'attached' | 'rendered' | 'destroyed' = 'created';
  public parent!: typeof UI | UIBinding | UIView;
  public model: any;
  public element!: HTMLElement;
  public host?: Element | null = null; // Web component host
  public bindings: UIBinding[] = [];
  public views: UIView[] = [];
  public render?: boolean;
  public animations: UIAnimation[] = [];
  public animationQueue: UIAnimation[] = [];
  public destroyed: '' | 'queue' | 'destroy' | 'destroyed' = '';
  public moved: '' | 'queue' | 'move' = '';

  public attached!: Promise<void>;
  public detached!: Promise<void>;
  private _attachResolve!: () => void;
  private _detachResolve!: () => void;
  private parentElement!: HTMLElement;
  private sibling!: UIView | Element | null;

  public static create(parent: HTMLElement, model = {}, template: HTMLElement | null, options: IUIViewOptions = { parent: null, prepare: true, sibling: null }): UIView {
    const view = new UIView();

    view.model = model;
    view.element = template ?? parent;
    view.parent = (options.parent ?? UI);
    view.host = options.host ?? (view.parent as UIView).host;
    view.sibling = options.sibling ?? null;
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

    // console.log('Not TEMPLATE');
    if (view.views.length > 1) {
      view.attached = Promise.all(view.views.map(v => v.attached)) as unknown as Promise<void>;
      view.detached = Promise.all(view.views.map(v => v.detached)) as unknown as Promise<void>;
    } else {
      view.attached = new Promise((resolve) => {
        view._attachResolve = resolve;
      });
      view.detached = new Promise((resolve) => {
        view._detachResolve = resolve;
      });
    }

    return view;
  }

  public get lastElement(): Element {
    if (this.render == null) {
      this.render = !(this.element.hasAttribute?.('PUI-UNRENDERED') ?? false);
    }
    if (this.render) {
      return this.element;
    }
    const views = this.bindings.flatMap(binding => binding.views);
    const view = views.slice(-1)[0];
    return view?.lastElement;
  }

  public destroy(): void {
    this.views.forEach(view => view.destroy());
    // console.log('[view] destroy', this.element, this.model, this.element.getAnimations({ subtree: true }));
    this.element.classList?.add('pui-removing');
    this.destroyed = 'queue';
    UI.destroyed.push(this);
  }

  public terminate(): void {
    // console.log('[view] terminate', this.element, this.model, this.getAnimations());
    void Promise.all(this.getAnimations()).then(() => {
      // console.log('[view] remove', this.element, this.element.getAnimations({ subtree: true }));
      const parentElement = this.element.parentElement;
      parentElement?.removeChild(this.element);
      this._detachResolve?.();
      this.dispatchEvent(parentElement, 'removed');
      this.bindings.forEach(binding => binding.unbind());

      const index = (this.parent as UIView).views.findIndex((view: UIView) => view === this);
      if (index > -1) {
        (this.parent as UIView).views.splice(index, 1);
      }
    });
    this.destroyed = 'destroyed';
  }

  public move(sibling: UIView | HTMLElement): void {
    // console.log('[view] move', this.element, this.model, this.model.$model.card?.suit, this.model.$model.card?.value, sibling.innerText);
    this.moved = 'queue';
    this.element.classList?.add('pui-moving');
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
    const updateSelfFirst = /* this.element instanceof Comment && */ this.state === 'created';
    if (!updateSelfFirst) {
      this.views.forEach(view => view.updateToUI());
      this.bindings.forEach(binding => binding.updateToUI());
    }
    // if (this.element.classList.contains('impact')) {
    //   debugger;
    // }
    switch (this.state) {
      case 'created':
        // console.log('[view] add', this.element, this.model);
        this.element.classList?.add('pui-adding');
        this.render = !(this.element.hasAttribute?.('PUI-UNRENDERED') ?? false);
        if (this.render) {
          const parentView = ((this.parent as UIBinding)?.parent as UIView);
          const renderedParent = parentView?.render ?? false;
          let sibling = (!renderedParent ? parentView?.sibling : this.sibling) ?? null;
          sibling = (sibling instanceof UIView ? sibling.lastElement : sibling) ?? null;
          const parentElement = this.parentElement ?? UI.parentElement(this.element, this.parent as UIBinding);
          // console.log('parentElement', parentElement, this, sibling, parentView, renderedParent);
          parentElement.insertBefore(this.element,
            /* (parentView == null || renderedParent ? */ sibling?.nextSibling /* : sibling) */ ?? null
          );
          // if (parentElement instanceof Comment) {
          //   parentElement = parentElement.parentElement ?? parentElement.parentNode as HTMLElement;
          // }
          // parentElement.insertBefore(this.element, this.sibling?.nextSibling ?? null);
          // } else {
          // console.log('PUI-UNRENDERED - created', this);
          // const parentElement = this.parentElement ?? UI.parentElement(this.element, this.parent as UIBinding);
          // const sibling = this.sibling ?? null;
          // console.log('parentElement', parentElement, sibling instanceof Comment, this, sibling);
          // parentElement.insertBefore(this.element, sibling?.nextSibling ?? null);
          this.dispatchEvent(parentElement, 'added');
        }
        this._attachResolve();
        this.state = 'attaching';
        break;
      case 'attaching':
        if (
          this.getAnimations(false).length === 0
          // this.element.getAnimations({ subtree: false })
          // .filter(animation => animation.playState !== 'finished').length === 0
        ) {
          this.element.classList?.remove('pui-adding');
          this.state = 'attached';
        }
        break;
      case 'attached':
        this.state = 'rendered';
        break;
    }
    if (updateSelfFirst) {
      this.views.forEach(view => view.updateToUI());
      this.bindings.forEach(binding => binding.updateToUI());
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
          const parent = (this.parentElement ?? UI.parentElement(this.element, this.parent as UIBinding)); // UI.parentElement(this.element, this.parent as UIBinding);
          // console.log('[view] moving', this.element.nextSibling === this.sibling.nextSibling, '>', (this.element.nextSibling as any).cloneNode(), '<', (this.sibling.nextSibling as any).innerText)
          let sibling = (this.sibling instanceof UIView ? this.sibling.lastElement : this.sibling) ?? null;
          // console.log('parentElement', parentElement, this, sibling, parentView, renderedParent);
          if (this.render) {
            parent.insertBefore(this.element, sibling?.nextSibling ?? null);
          } else {
            const views = this.bindings.flatMap(binding => binding.views);
            for (const view of views) {
              parent.insertBefore(view.element, sibling?.nextSibling ?? null);
              sibling = view.element;
            }
            // for (let i = views.length - 1; i >= 0; i--) {
            //   const element = views[i].element;
            //   parent.insertBefore(element, sibling ?? null);
            //   sibling = element;
            // }
          }
          // parent.insertBefore(this.element, this.sibling!.nextSibling);
          this.element.classList?.remove('pui-moving');
          this.moved = '';
          this.sibling = null;
        }
        // });
        break;
    }
    this.bindings.forEach(binding => binding.updateMove());
    this.views.forEach(view => view.updateMove());
  }

  private getAnimations(subtree = true) {
    return (this.element.getAnimations?.({ subtree }) ?? [])
      .filter(animation => animation.playState !== 'finished' && animation.effect?.getTiming().iterations !== Infinity)
      .map(animation => animation.finished);
  }

  private dispatchEvent(parentElement: HTMLElement | undefined | null, type: 'added' | 'removed'): void {
    if (parentElement != null) {
      const detachEvent = new CustomEvent(`pui-${type}`, {
        detail: {
          model: this.model.$model ?? this.model,
          context: this.model,
          element: this.element,
          view: this,
        },
        bubbles: true,
        cancelable: true,
      });
      parentElement.dispatchEvent(detachEvent);
    }
  }
}
