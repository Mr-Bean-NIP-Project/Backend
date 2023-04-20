export interface Edge<T> {
  from: T;
  to: T;
}

export class Graph<T> {
  adjLists: Map<T, Set<T>> = new Map<T, Set<T>>();

  copy(): Graph<T> {
    const g = new Graph<T>();
    g.adjLists = new Map([...this.adjLists]);
    return g;
  }

  // immutable
  merge(other: Graph<T>): Graph<T> {
    const copy = this.copy();
    for (const [key, value] of other.adjLists) {
      if (!copy.adjLists.has(key)) {
        copy.adjLists.set(key, value);
      } else {
        // handle collision
        const cAdjList = copy.adjLists.get(key);
        copy.adjLists.set(key, new Set([...cAdjList, ...value]));
      }
    }
    return copy;
    
  }

  addEdge({ from, to }: Edge<T>): Graph<T> {
    if (!this.adjLists.has(from)) this.adjLists.set(from, new Set<T>());
    this.adjLists.get(from).add(to);
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
