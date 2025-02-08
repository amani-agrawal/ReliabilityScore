"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var parquetjs_lite_1 = require("parquetjs-lite");
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
    Graph.prototype.findPathsFromTargetEdges = function (origin, target) {
        var results = [];
        for (var _i = 0, _a = target.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            var neighbor = edge.getNeighbor(target);
            if (!neighbor)
                continue;
            var path = this.findShortestPath(origin, neighbor);
            results.push({ edge: edge, path: path });
        }
        return results;
    };
    return Graph;
}());
//building the graph
var SocialGraph = new Graph();
function getOrCreateVertex(walletAddress) {
    var vertex = SocialGraph.uVertexs.find(function (v) { return v.user.walletAddress === walletAddress; });
    if (!vertex) {
        vertex = new uVertex({ walletAddress: walletAddress });
        SocialGraph.adduVertex(vertex);
    }
    return vertex;
}
//parquet file
function processParquetFile(filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var reader, cursor, record, _loop_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, parquetjs_lite_1.ParquetReader.openFile(filepath)];
                case 1:
                    reader = _a.sent();
                    cursor = reader.getCursor();
                    record = null;
                    console.log("Reading records from ".concat(filepath, ":"));
                    _loop_1 = function () {
                        console.log("Record:", record);
                        // Assumes each record has the properties: from, to, and hash.
                        if (!record.from || !record.to || !record.hash) {
                            console.error("Record missing required fields:", record);
                            return "continue";
                        }
                        var fromVertex = getOrCreateVertex(record.from);
                        var toVertex = getOrCreateVertex(record.to);
                        // Check if an edge already exists between the two vertices
                        var edge = SocialGraph.edges.find(function (e) {
                            return (e.uVertexs[0] === fromVertex && e.uVertexs[1] === toVertex) ||
                                (e.uVertexs[0] === toVertex && e.uVertexs[1] === fromVertex);
                        });
                        if (!edge) {
                            edge = new Edge(fromVertex, toVertex);
                            SocialGraph.addEdge(edge);
                        }
                        edge.addTransaction({ hash: record.hash });
                    };
                    _a.label = 2;
                case 2: return [4 /*yield*/, cursor.next()];
                case 3:
                    if (!(record = _a.sent())) return [3 /*break*/, 4];
                    _loop_1();
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, reader.close()];
                case 5:
                    _a.sent();
                    console.log("Finished reading Parquet file.");
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error("Error reading Parquet file:", err_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var originAddress, targetAddress, originVertex, targetVertex, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, processParquetFile('transactions.parquet')];
                case 1:
                    _a.sent();
                    originAddress = "0xe9c8c97ee34dca7d80b76cc9906106cc50059d2d";
                    targetAddress = "0x35fa5004dca835b985f5c38430301f1a0279f190";
                    originVertex = SocialGraph.uVertexs.find(function (v) { return v.user.walletAddress === originAddress; });
                    targetVertex = SocialGraph.uVertexs.find(function (v) { return v.user.walletAddress === targetAddress; });
                    if (originVertex && targetVertex) {
                        results = SocialGraph.findPathsFromTargetEdges(originVertex, targetVertex);
                        console.log(results)
                        results.forEach(function (_a, index) {
                            var edge = _a.edge, path = _a.path;
                            var neighbor = edge.getNeighbor(targetVertex);
                            //console.log("Edge ".concat(index + 1, " (from ").concat(targetVertex.user.walletAddress, " to ").concat(neighbor === null || neighbor === void 0 ? void 0 : neighbor.user.walletAddress, "):"));
                            if (path) {
                                console.log("Shortest path from origin to neighbor:", path.map(function (n) { return n.user.walletAddress; }).join(" -> "));
                                console.log("Path length (nodes):", path.length);
                                console.log("Path length (edges):", path.length - 1);
                            }
                            else {
                                console.log("No path found from origin to this neighbor.");
                            }
                        });
                    }
                    else {
                        console.error("Origin or target vertex not found in the graph.");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) { return console.error("Error in main:", err); });
