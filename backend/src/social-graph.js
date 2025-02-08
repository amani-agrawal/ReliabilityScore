//user interface
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
//uVertexclass--each uVertexstores a user using our app
var uVertex = /** @class */ (function () {
    function uVertex(user) {
        this.user = user;
        this.edges = [];
    }
    uVertex.prototype.addEdge = function (edge) {
        this.edges.push(edge);
    };
    return uVertex;
}());
//edge class--a connection between two users (at least 1 valid transaction)
var Edge = /** @class */ (function () {
    function Edge(uVertex1, uVertex2) {
        this.uVertexs = [uVertex1, uVertex2];
        this.transactions = [];
        this.transactionCount = 0;
    }
    Edge.prototype.getNeighbor = function (uVertex) {
        if (this.uVertexs[0] === uVertex) {
            return this.uVertexs[1];
        }
        else if (this.uVertexs[1] === uVertex) {
            return this.uVertexs[0];
        }
        return null;
    };
    Edge.prototype.isValidTransaction = function (tx) {
        return !!tx.hash && tx.hash.trim().length > 0;
    };
    Edge.prototype.addTransaction = function (tx) {
        if (this.isValidTransaction(tx)) {
            this.transactions.push(tx);
            this.transactionCount++;
        }
        else {
            console.error("Invalid transaction hash:", tx);
        }
    };
    return Edge;
}());
//graph class
var Graph = /** @class */ (function () {
    function Graph() {
        this.uVertexs = [];
        this.edges = [];
    }
    Graph.prototype.adduVertex = function (uVertex) {
        this.uVertexs.push(uVertex);
    };
    Graph.prototype.addEdge = function (edge) {
        this.edges.push(edge);
        edge.uVertexs[0].addEdge(edge);
        edge.uVertexs[1].addEdge(edge);
    };
    Graph.prototype.findShortestPath = function (origin, target) {
        var queue = [];
        var visited = new Set();
        queue.push({ uVertex: origin, path: [origin] });
        visited.add(origin);
        while (queue.length > 0) {
            var _a = queue.shift(), uVertex_1 = _a.uVertex, path = _a.path;
            if (uVertex_1 === target) {
                return path;
            }
            for (var _i = 0, _b = uVertex_1.edges; _i < _b.length; _i++) {
                var edge = _b[_i];
                var neighbor = edge.getNeighbor(uVertex_1);
                if (neighbor && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push({ uVertex: neighbor, path: __spreadArray(__spreadArray([], path, true), [neighbor], false) });
                }
            }
        }
        return null;
    };
    //for each edge the target uVertexis part of, find shortest path to the origin
    Graph.prototype.findPathsFromTargetEdges = function (origin, target) {
        var results = [];
        for (var _i = 0, _a = target.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            var neighbor = edge.getNeighbor(target);
            if (!neighbor)
                continue; //safety check || sanity check
            var path = this.findShortestPath(origin, neighbor);
            results.push({ edge: edge, path: path });
        }
        return results;
    };
    return Graph;
}());
//testing
var userA = { walletAddress: "A" }; //origin
var userB = { walletAddress: "B" };
var userC = { walletAddress: "C" }; //target
var userD = { walletAddress: "D" };
var uVertexA = new uVertex(userA);
var uVertexB = new uVertex(userB);
var uVertexC = new uVertex(userC);
var uVertexD = new uVertex(userD);
var SocialGraph = new Graph();
SocialGraph.adduVertex(uVertexA);
SocialGraph.adduVertex(uVertexB);
SocialGraph.adduVertex(uVertexC);
SocialGraph.adduVertex(uVertexD);
var edgeAB = new Edge(uVertexA, uVertexB);
edgeAB.addTransaction({ hash: "tx1" });
SocialGraph.addEdge(edgeAB);
var edgeBC = new Edge(uVertexB, uVertexC);
edgeBC.addTransaction({ hash: "tx2" });
SocialGraph.addEdge(edgeBC);
var edgeAD = new Edge(uVertexA, uVertexD);
edgeAD.addTransaction({ hash: "tx3" });
SocialGraph.addEdge(edgeAD);
var edgeDC = new Edge(uVertexD, uVertexC);
edgeDC.addTransaction({ hash: "tx4" });
SocialGraph.addEdge(edgeDC);
var results = SocialGraph.findPathsFromTargetEdges(uVertexA, uVertexC);
results.forEach(function (_a, index) {
    var edge = _a.edge, path = _a.path;
    var neighbor = edge.getNeighbor(uVertexC);
    console.log("Edge ".concat(index + 1, " (from uVertex").concat(uVertexC.user.walletAddress, " to uVertex").concat(neighbor === null || neighbor === void 0 ? void 0 : neighbor.user.walletAddress, "):"));
    if (path) {
        console.log("Shortest path from origin to neighbor:", path.map(function (n) { return n.user.walletAddress; }).join(" -> "));
        console.log("Path length: ", path.length - 1);
    }
    else {
        console.log("No path found from origin to this neighbor.");
    }
});
