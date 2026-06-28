export type DAGLayoutOptions = {
  nodes: Array<{ id: string }>;
  edges: Array<{ from: string; to: string }>;
  direction?: 'vertical' | 'horizontal';
  nodeWidth?: number;
  nodeHeight?: number;
  rankGap?: number;
  nodeGap?: number;
  padding?: number;
};

export type DAGLayoutNode = {
  id: string;
  x: number;
  y: number;
  rank: number;
  order: number;
};

export type DAGLayoutEdge = {
  from: string;
  to: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isBackEdge: boolean;
};

export type DAGLayoutRank = {
  rank: number;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds: string[];
};

export type DAGLayoutResult = {
  nodes: DAGLayoutNode[];
  edges: DAGLayoutEdge[];
  ranks: DAGLayoutRank[];
  direction: 'vertical' | 'horizontal';
  width: number;
  height: number;
};

export function computeDAGLayout(options: DAGLayoutOptions): DAGLayoutResult {
  const {
    nodes,
    edges,
    direction = 'vertical',
    nodeWidth = 160,
    nodeHeight = 40,
    rankGap = 64,
    nodeGap = 48,
    padding = 24,
  } = options;

  const ids = nodes.map((n) => n.id);
  const rankMap = new Map<string, number>();
  ids.forEach((id) => rankMap.set(id, 0));

  for (let iter = 0; iter < ids.length; iter++) {
    edges.forEach(({ from, to }) => {
      if (rankMap.has(from) && rankMap.has(to)) {
        rankMap.set(to, Math.max(rankMap.get(to)!, rankMap.get(from)! + 1));
      }
    });
  }

  const byRank = new Map<number, string[]>();
  ids.forEach((id) => {
    const r = rankMap.get(id) ?? 0;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r)!.push(id);
  });

  const layoutNodes: DAGLayoutNode[] = [];
  const ranks: DAGLayoutRank[] = [];
  let maxW = 0;
  let maxH = 0;

  [...byRank.entries()].sort(([a], [b]) => a - b).forEach(([rank, nodeIds]) => {
    const rankW = nodeIds.length * nodeWidth + Math.max(0, nodeIds.length - 1) * nodeGap;
    maxW = Math.max(maxW, rankW);
    nodeIds.forEach((id, order) => {
      const x = padding + order * (nodeWidth + nodeGap);
      const y = padding + rank * (nodeHeight + rankGap);
      layoutNodes.push({ id, x, y, rank, order });
      maxH = Math.max(maxH, y + nodeHeight);
    });
    ranks.push({
      rank,
      x: padding,
      y: padding + rank * (nodeHeight + rankGap),
      width: rankW,
      height: nodeHeight,
      nodeIds,
    });
  });

  const pos = Object.fromEntries(layoutNodes.map((n) => [n.id, n]));
  const layoutEdges: DAGLayoutEdge[] = edges.map(({ from, to }) => {
    const a = pos[from];
    const b = pos[to];
    const isBackEdge = a && b ? a.rank >= b.rank : false;
    if (!a || !b) {
      return { from, to, sourceX: 0, sourceY: 0, targetX: 0, targetY: 0, isBackEdge: false };
    }
    if (direction === 'vertical') {
      return {
        from,
        to,
        sourceX: a.x + nodeWidth / 2,
        sourceY: a.y + nodeHeight,
        targetX: b.x + nodeWidth / 2,
        targetY: b.y,
        isBackEdge,
      };
    }
    return {
      from,
      to,
      sourceX: a.x + nodeWidth,
      sourceY: a.y + nodeHeight / 2,
      targetX: b.x,
      targetY: b.y + nodeHeight / 2,
      isBackEdge,
    };
  });

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    ranks,
    direction,
    width: maxW + padding * 2,
    height: maxH + padding,
  };
}
