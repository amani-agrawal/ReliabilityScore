import parquet from 'parquetjs-lite';
import pt from "path";

interface User {
  walletAddress: string;
}

interface Transaction {
  hash: string;
}

interface Candidate {
    edge: Edge;
    path: uVertex[];
  }
  
interface CandidateWithSeq extends Candidate {
walletSeq: string[];
}
  

class uVertex {
  user: User;
  edges: Edge[];

  constructor(user: User) {
    this.user = user;
    this.edges = [];
  }

  addEdge(edge: Edge): void {
    this.edges.push(edge);
  }
}

class Edge {
  uVertexs: [uVertex, uVertex];
  transactions: Transaction[];
  transactionCount: number;

  constructor(uVertex1: uVertex, uVertex2: uVertex) {
    this.uVertexs = [uVertex1, uVertex2];
    this.transactions = [];
    this.transactionCount = 0;
  }

  getNeighbor(uVertex: uVertex): uVertex | null {
    if (this.uVertexs[0] === uVertex) {
      return this.uVertexs[1];
    } else if (this.uVertexs[1] === uVertex) {
      return this.uVertexs[0];
    }
    return null;
  }

  private isValidTransaction(tx: Transaction): boolean {
    return !!tx.hash && tx.hash.trim().length > 0;
  }

  addTransaction(tx: Transaction): void {
    if (this.isValidTransaction(tx)) {
      this.transactions.push(tx);
      this.transactionCount++;
    } else {
      console.error("Invalid transaction hash:", tx);
    }
  }
}

class Graph {
  uVertexs: uVertex[];
  edges: Edge[];

  constructor() {
    this.uVertexs = [];
    this.edges = [];
  }

  adduVertex(uVertex: uVertex): void {
    this.uVertexs.push(uVertex);
  }

  addEdge(edge: Edge): void {
    this.edges.push(edge);
    edge.uVertexs[0].addEdge(edge);
    edge.uVertexs[1].addEdge(edge);
  }

  findShortestPath(origin: uVertex, target: uVertex): uVertex[] | null {
    const queue: { vertex: uVertex; path: uVertex[] }[] = [];
    const visited = new Set<uVertex>();

    queue.push({ vertex: origin, path: [origin] });
    visited.add(origin);

    while (queue.length > 0) {
      const { vertex, path } = queue.shift()!;
      if (vertex === target) {
        return path;
      }
      for (const edge of vertex.edges) {
        const neighbor = edge.getNeighbor(vertex);
        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ vertex: neighbor, path: [...path, neighbor] });
        }
      }
    }
    return null;
  }

  findPathsFromTargetEdges(origin: uVertex, target: uVertex): { edge: Edge; path: uVertex[] | null }[] {
    const results: { edge: Edge; path: uVertex[] | null }[] = [];
    const processedNeighbors = new Set<string>(); 

    for (const edge of target.edges) {
      const neighbor = edge.getNeighbor(target);
      if (!neighbor) continue;
      const neighborWallet = neighbor.user.walletAddress;
      if (processedNeighbors.has(neighborWallet)) continue;
      processedNeighbors.add(neighborWallet);
      const path = this.findShortestPath(origin, neighbor);
      results.push({ edge, path });
    }
    return results;
  }
} 

async function buildGraph(filename: string): Promise<Graph> {
  const reader = await parquet.ParquetReader.openFile(filename);
  const cursor = reader.getCursor();
  let record: any = null;
  const graph = new Graph();
  const vertexMap: Map<string, uVertex> = new Map();

  console.log(`Reading records from ${filename}:`);

  while ((record = await cursor.next())) {
    console.log("Record:", record);
    const from = record.from;
    const to = record.to;
    const hash = record.hash;

    if (!from || !to || !hash) {
      console.warn("Incomplete record:", record);
      continue;
    }

    let vertexFrom = vertexMap.get(from);
    if (!vertexFrom) {
      vertexFrom = new uVertex({ walletAddress: from });
      vertexMap.set(from, vertexFrom);
      graph.adduVertex(vertexFrom);
    }
    let vertexTo = vertexMap.get(to);
    if (!vertexTo) {
      vertexTo = new uVertex({ walletAddress: to });
      vertexMap.set(to, vertexTo);
      graph.adduVertex(vertexTo);
    }

    let edge = graph.edges.find(
      e =>
        (e.uVertexs[0] === vertexFrom && e.uVertexs[1] === vertexTo) ||
        (e.uVertexs[0] === vertexTo && e.uVertexs[1] === vertexFrom)
    );
    if (!edge) {
      edge = new Edge(vertexFrom, vertexTo);
      graph.addEdge(edge);
    }
    edge.addTransaction({ hash });
  }

  await reader.close();
  console.log("Finished reading Parquet file.");

  return graph;
}

export async function findGraphPaths(originAddress: string, targetAddress: string): Promise<{ via: string | null; path: string[]; node_length: number; edge_length: number }[]> {
    try {
      const graph = await buildGraph("/Users/shreyaas/Desktop/SWE\ PROJECTS/ReliabilityScore/backend/src/transactions.parquet");
      const origin = graph.uVertexs.find(v => v.user.walletAddress === originAddress);
      const target = graph.uVertexs.find(v => v.user.walletAddress === targetAddress);
  
      if (!origin || !target) {
        console.log("Origin or target vertex not found in the graph.");
        return [];
      }
  
      console.log(`\nFinding candidate paths from ${originAddress} (origin) to each neighbor of ${targetAddress} (target):`);
      const candidates = graph.findPathsFromTargetEdges(origin, target);
  
      console.log(`\nFinal unique paths from ${originAddress} to ${targetAddress}:`);
      candidates.forEach(({ edge, path }, index) => {
        const neighbor = edge.getNeighbor(target);
        console.log(`\nPath ${index + 1} (via neighbor ${neighbor?.user.walletAddress}):`);
        if (path) {
          console.log("Path (wallets):", path.map(v => v.user.walletAddress).join(" -> "));
          console.log("Path length (nodes):", path.length);
          console.log("Path length (edges):", path.length - 1);
        } else {
          console.log("No path found from origin to this neighbor.");
        }
      });

      const simplePaths = candidates
      .filter(candidate => candidate.path !== null)
      .map(candidate => {
        const neighbor = candidate.edge.getNeighbor(target);
        return {
          via: neighbor ? neighbor.user.walletAddress : null,
          path: candidate.path!.map(v => v.user.walletAddress),
          node_length: candidate.path!.length,
          edge_length: candidate.path!.length - 1
        };
      });

    return simplePaths;
    } catch (err) {
      console.error("Error in findGraphPaths:", err);
      return [];
    }
  }

