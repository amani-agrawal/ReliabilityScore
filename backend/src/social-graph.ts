//user interface

interface User {
    walletAddress: string;
}

//transaction interface
interface Transaction {
    hash: string;
}

//uVertexclass--each uVertexstores a user using our app
export class uVertex{
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

//edge class--a connection between two users (at least 1 valid transaction)
export class Edge {
    uVertexs: [uVertex, uVertex];
    transactions: Transaction[];
    transactionCount: number;

    constructor(uVertex1: uVertex, uVertex2: uVertex) {
        this.uVertexs = [uVertex1, uVertex2];
        this.transactions = [];
        this.transactionCount = 0;
    }

    getNeighbor(uVertex: uVertex): uVertex| null {
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

//graph class
export class Graph {
    uVertexs: uVertex[];
    edges: Edge[];
    static uVertexs: any;

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
            if (uVertex=== target) {
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

    //for each edge the target uVertexis part of, find shortest path to the origin
    findPathsFromTargetEdges(origin: uVertex, target: uVertex): { edge: Edge; path: uVertex[] | null}[] {
        const results: { edge: Edge; path: uVertex[] | null}[] = [];
        for (const edge of target.edges) {
            const neighbor = edge.getNeighbor(target);
            if (!neighbor) continue; //safety check || sanity check
            const path = this.findShortestPath(origin, neighbor);
            results.push({ edge, path });
        }
        return results;
    }

}


//testing
const userA: User = { walletAddress: "A"}; //origin
const userB: User = { walletAddress: "B"};
const userC: User = { walletAddress: "C"}; //target
const userD: User = { walletAddress: "D"};

const uVertexA = new uVertex(userA);
const uVertexB = new uVertex(userB);
const uVertexC = new uVertex(userC);
const uVertexD = new uVertex(userD);

const SocialGraph = new Graph();
SocialGraph.adduVertex(uVertexA);
SocialGraph.adduVertex(uVertexB);
SocialGraph.adduVertex(uVertexC);
SocialGraph.adduVertex(uVertexD);

const edgeAB = new Edge(uVertexA, uVertexB);
edgeAB.addTransaction({ hash: "tx1" });
SocialGraph.addEdge(edgeAB);

const edgeBC = new Edge(uVertexB, uVertexC);
edgeBC.addTransaction({ hash: "tx2" });
SocialGraph.addEdge(edgeBC);

const edgeAD = new Edge(uVertexA, uVertexD);
edgeAD.addTransaction({ hash: "tx3" });
SocialGraph.addEdge(edgeAD);

const edgeDC = new Edge(uVertexD, uVertexC);
edgeDC.addTransaction({ hash: "tx4" });
SocialGraph.addEdge(edgeDC);

const results = SocialGraph.findPathsFromTargetEdges(uVertexA, uVertexC);

results.forEach(({ edge, path }, index) => {
    const neighbor = edge.getNeighbor(uVertexC);
    console.log(`Edge ${index + 1} (from uVertex${uVertexC.user.walletAddress} to uVertex${neighbor?.user.walletAddress}):`);
    if (path) {
      console.log("Shortest path from origin to neighbor:", path.map(n => n.user.walletAddress).join(" -> "));
      console.log("Path length (nodes): ", path.length);
      console.log("Path length (edges): ", path.length - 1);
    } else {
      console.log("No path found from origin to this neighbor.");
    }
  });