export interface Edge<T> {
  from: T;
  to: T;
}

export class Graph<T> {
  adjLists: Map<T, Array<T>> = new Map<T, Array<T>>();

  addEdge({ from, to }: Edge<T>): Graph<T> {
    if (!this.adjLists.has(from)) this.adjLists.set(from, []);
    this.adjLists.get(from).push(to);
    return this;
  }

  getCycles(): Edge<T>[] {
    const discovered: Set<T> = new Set();
    const finished: Set<T> = new Set();
    let cycles: Edge<T>[] = [];
    for (const u of [...this.adjLists.keys()]) {
      if (!discovered.has(u) && !finished.has(u)) {
        for (const cycle of getCyclesHelper<T>({
          G: this,
          u,
          discovered,
          finished,
        })) {
          cycles.push(cycle);
        }
      }
    }

    return cycles;
  }
}

function getCyclesHelper<T>({
  G,
  u,
  discovered,
  finished,
}: {
  G: Graph<T>;
  u: T;
  discovered: Set<T>;
  finished: Set<T>;
}): Edge<T>[] {
  discovered.add(u);
  let cycles: Edge<T>[] = [];
  for (const v of G.adjLists.get(u) ?? []) {
    if (discovered.has(v)) {
      const cycle: Edge<T> = {
        from: u,
        to: v,
      };
      cycles.push(cycle);
      break;
    }

    if (!finished.has(v)) {
      for (const cycle of getCyclesHelper<T>({
        G,
        u: v,
        discovered,
        finished,
      })) {
        cycles.push(cycle);
      }
    }
  }

  discovered.delete(u);
  finished.add(u);
  return cycles;
}
