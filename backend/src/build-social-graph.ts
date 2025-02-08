import parquet from 'parquetjs-lite';
//social graph classes
interface User {
  walletAddress: string;
}

interface Transaction {
  hash: string;
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
    let queue: { uVertex: uVertex; path: uVertex[] }[] = [];
    let visited = new Set<uVertex>();

    queue.push({ uVertex: origin, path: [origin] });
    visited.add(origin);

    while (queue.length > 0) {
      const { uVertex, path } = queue.shift()!;
      if (uVertex === target) {
        return path;
      }
      for (const edge of uVertex.edges) {
        const neighbor = edge.getNeighbor(uVertex);
        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ uVertex: neighbor, path: [...path, neighbor] });
        }
      }
    }
    return null;
  }
  findPathsFromTargetEdges(origin: uVertex, target: uVertex): { edge: Edge; path: uVertex[] | null }[] {
    const results: { edge: Edge; path: uVertex[] | null }[] = [];
    for (const edge of target.edges) {
      const neighbor = edge.getNeighbor(target);
      if (!neighbor) continue;
      const path = this.findShortestPath(origin, neighbor);
      results.push({ edge, path });
    }
    return results;
  }
}

//building the graph
const SocialGraph = new Graph();

function getOrCreateVertex(walletAddress: string): uVertex {
  let vertex = SocialGraph.uVertexs.find(v => v.user.walletAddress === walletAddress);
  if (!vertex) {
    vertex = new uVertex({ walletAddress });
    SocialGraph.adduVertex(vertex);
  }
  return vertex;
}

//parquet file
async function processParquetFile(filepath: string): Promise<void> {
  try {
    const reader = await parquet.ParquetReader.opnFile(filepath);
    const cursor = reader.getCursor();
    let record: any = null;

    console.log(`Reading records from ${filepath}:`);
    while (record = await cursor.next()) {
      console.log("Record:", record);
      // Assumes each record has the properties: from, to, and hash.
      if (!record.from || !record.to || !record.hash) {
        console.error("Record missing required fields:", record);
        continue;
      }
      const fromVertex = getOrCreateVertex(record.from);
      const toVertex = getOrCreateVertex(record.to);

      // Check if an edge already exists between the two vertices
      let edge = SocialGraph.edges.find(e =>
        (e.uVertexs[0] === fromVertex && e.uVertexs[1] === toVertex) ||
        (e.uVertexs[0] === toVertex && e.uVertexs[1] === fromVertex)
      );

      if (!edge) {
        edge = new Edge(fromVertex, toVertex);
        SocialGraph.addEdge(edge);
      }
      edge.addTransaction({ hash: record.hash });
    }

    await reader.close();
    console.log("Finished reading Parquet file.");
  } catch (err) {
    console.error("Error reading Parquet file:", err);
  }
}

async function main() {
  await processParquetFile('transactions.parquet');

  const originAddress = "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001";
  const targetAddress = "0x35fa5004dca835b985f5c38430301f1a0279f190"; 

  const originVertex = SocialGraph.uVertexs.find(v => v.user.walletAddress === originAddress);
  const targetVertex = SocialGraph.uVertexs.find(v => v.user.walletAddress === targetAddress);

  if (originVertex && targetVertex) {
    const results = SocialGraph.findPathsFromTargetEdges(originVertex, targetVertex);
    results.forEach(({ edge, path }, index) => {
      const neighbor = edge.getNeighbor(targetVertex);
      console.log(`Edge ${index + 1} (from ${targetVertex.user.walletAddress} to ${neighbor?.user.walletAddress}):`);
      if (path) {
        console.log("Shortest path from origin to neighbor:", path.map(n => n.user.walletAddress).join(" -> "));
        console.log("Path length (nodes):", path.length);
        console.log("Path length (edges):", path.length - 1);
      } else {
        console.log("No path found from origin to this neighbor.");
      }
    });
  } else {
    console.error("Origin or target vertex not found in the graph.");
  }
}

main().catch(err => console.error("Error in main:", err));
