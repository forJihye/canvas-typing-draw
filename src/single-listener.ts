export default class SingleListener extends WeakMap {
  _types = new Set;
  constructor() {
    super();
  }
  private _addEventType<K extends keyof HTMLElementEventMap>(type: K) {
    this._types.add(type);
    addEventListener(type, this._handlers.bind(this));
  }
  private _run<K extends keyof HTMLElementEventMap>(target: HTMLElement, ev: HTMLElementEventMap[K]) {
    this.has(target) && this.get(target).get(ev.type).forEach((f: (target: HTMLElement, ev: HTMLElementEventMap[K]) => void) => f(target, ev));
  }
  private _handlers(ev: any) {
    let target = ev.target ;
    do {
      this._run(target, ev);
    } while (target = target.parentElement);
  }
  add<K extends keyof HTMLElementEventMap>(el: Node, type: K, f: (this: HTMLElement, target: HTMLElement, ev: HTMLElementEventMap[K]) => void) {
    !this._types.has(type) && this._addEventType(type);
    !this.has(el) && this.set(el, new Map);
    const chn = this.get(el);
    !chn.has(type) && chn.set(type, new Set);
    chn.get(type).add(f);
  }
  remove<K extends keyof HTMLElementEventMap>(el: Node, type: K, f: (this: HTMLElement, target: HTMLElement, ev: HTMLElementEventMap[K]) => void) {
    !this.has(el) && this.set(el, new Map);
    const chn = this.get(el);
    !chn.has(type) && chn.set(type, new Set);
    const hands = chn.get(type)
    hands.delete(f);
    !hands.size && chn.delete(type);
    !chn.size && this.delete(el);
  }
};

export const singleListener = new SingleListener;
