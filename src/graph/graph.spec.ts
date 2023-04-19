import { Edge, Graph } from './graph';

describe('Graph', () => {
  it('should detect no cycles', () => {
    const graph = new Graph<number>();
    graph.addEdge({ from: 1, to: 2 });
    graph.addEdge({ from: 1, to: 3 });
    const cycles = graph.getCycles();
    expect(cycles).toHaveLength(0);
  });

  it('should detect a self cycle', () => {
    const graph = new Graph<number>();
    graph.addEdge({ from: 1, to: 1 });

    const expectedCycles: Edge<number>[] = [
      {
        from: 1,
        to: 1,
      },
    ];
    const cycles = graph.getCycles();
    expect(cycles).toHaveLength(1);
    expect(expectedCycles).toEqual(cycles);
  });

  it('should detect a trivial cycle', () => {
    const graph = new Graph<number>();
    graph.addEdge({ from: 1, to: 2 });
    graph.addEdge({ from: 2, to: 3 });
    graph.addEdge({ from: 3, to: 1 });

    const expectedCycles: Edge<number>[] = [
      {
        from: 3,
        to: 1,
      },
    ];
    const cycles = graph.getCycles();
    expect(cycles).toHaveLength(1);
    expect(expectedCycles).toEqual(cycles);
  });

  it('should detect no cycle in a tree', () => {
    const graph = new Graph<number>();
    graph.addEdge({ from: 1, to: 2 });
    graph.addEdge({ from: 1, to: 3 });
    graph.addEdge({ from: 2, to: 4 });
    graph.addEdge({ from: 3, to: 4 });

    const cycles = graph.getCycles();
    expect(cycles).toHaveLength(0);
  });

  it('should detect a non-trivial cycle', () => {
    const graph = new Graph<number>();
    graph.addEdge({ from: 1, to: 2 });
    graph.addEdge({ from: 2, to: 3 });
    graph.addEdge({ from: 3, to: 4 });
    graph.addEdge({ from: 4, to: 1 });

    const expectedCycles: Edge<number>[] = [
      {
        from: 4,
        to: 1,
      },
    ];
    const cycles = graph.getCycles();
    expect(cycles).toHaveLength(1);
    expect(expectedCycles).toEqual(cycles);
  });

  it('should detect a cycle from a wide base', () => {
    const graph = new Graph<number>();

    // very wide base here
    for (let child = 2; child < 10000; child++) {
        graph.addEdge({ from: 1, to: child });
    }
    graph.addEdge({ from: 2, to: -11 });
    graph.addEdge({ from: 2, to: -12 });
    graph.addEdge({ from: 2, to: -13 });
    graph.addEdge({ from: -13, to: 1 });

    const expectedCycles: Edge<number>[] = [
      {
        from: -13,
        to: 1,
      },
    ];
    const cycles = graph.getCycles();
    expect(cycles).toHaveLength(1);
    expect(expectedCycles).toEqual(cycles);
  });
});
