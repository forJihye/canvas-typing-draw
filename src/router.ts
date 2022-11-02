const docFrag = document.createDocumentFragment();

class Router {
  routes!: HTMLElement[];
  routesMap: Map<string, [Comment, HTMLElement]> = new Map();
  currentRoute!: [Comment, HTMLElement];
  previousRoute!: [Comment, HTMLElement];
  constructor(els: HTMLElement[]) {
    this.routes = els;
    this.routes.forEach(el => this.routesMap.set(el.getAttribute('name') as string, [document.createComment(''), el]));
    console.log(this.routesMap)
  }
  hide() {
    this.routesMap.forEach((value) => {
      const [comment, route] = value;
      if (!route.parentElement) return;
      route.parentElement.replaceChild(comment, route);
      docFrag.appendChild(route);
    })
  }
  push(routeName: string) {
    const name = this.setCurrentRoute(routeName);
    this.routesMap.forEach((value, key) => {
      const [comment, route] = value;
      if (key === name) {
        if (route.parentElement) return // * docFrag 밖에 있으면 중지
        comment.parentElement?.replaceChild(route, comment);
      } else {
        if (!route.parentElement) return;
        route.parentElement.replaceChild(comment, route);
        docFrag.appendChild(route);
      }
    });
  }
  setCurrentRoute(routeName: string) {
    this.previousRoute = this.currentRoute || this.routesMap.get(routeName);
    this.currentRoute = this.routesMap.get(routeName) as [Comment, HTMLElement];
    return routeName;
  }
}

export default Router;
