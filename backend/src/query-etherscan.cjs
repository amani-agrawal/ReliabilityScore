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
Object.defineProperty(exports, "__esModule", { value: true });
var parquetjs_lite_1 = require("parquetjs-lite");
// Define the Parquet schema using parquetjs-lite
var schema = new parquetjs_lite_1.ParquetSchema({
    from: { type: 'UTF8' },
    to: { type: 'UTF8' },
    hash: { type: 'UTF8' }
});
// Helper function to delay execution for a given number of milliseconds.
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var chains, startBlockDec, endBlockDec, writer, _i, chains_1, chain, block, blockHex, index, queryCount, indexHex, url, queryResponse, data, simpleTx, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chains = [480];
                    startBlockDec = 9821950;
                    endBlockDec = 9822070;
                    return [4 /*yield*/, parquetjs_lite_1.ParquetWriter.openFile(schema, 'transactions.parquet')];
                case 1:
                    writer = _a.sent();
                    _i = 0, chains_1 = chains;
                    _a.label = 2;
                case 2:
                    if (!(_i < chains_1.length)) return [3 /*break*/, 15];
                    chain = chains_1[_i];
                    console.log("\nProcessing chain ".concat(chain));
                    block = startBlockDec;
                    _a.label = 3;
                case 3:
                    if (!(block <= endBlockDec)) return [3 /*break*/, 14];
                    blockHex = '0x' + block.toString(16);
                    console.log("\nFetching transactions for block ".concat(block, " (").concat(blockHex, ")"));
                    index = 0;
                    queryCount = 0;
                    _a.label = 4;
                case 4:
                    if (!true) return [3 /*break*/, 13];
                    indexHex = '0x' + index.toString(16);
                    url = "https://api.etherscan.io/v2/api?chainid=".concat(chain, "&module=proxy&action=eth_getTransactionByBlockNumberAndIndex&tag=").concat(blockHex, "&index=").concat(indexHex, "&apikey=53SU3USFB3C3ZYH5Y6S817SZCSST8FE1PT");
                    console.log("Querying block ".concat(block, " transaction index ").concat(index, " (").concat(indexHex, ")"));
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 11, , 12]);
                    return [4 /*yield*/, fetch(url)];
                case 6:
                    queryResponse = _a.sent();
                    return [4 /*yield*/, queryResponse.json()];
                case 7:
                    data = _a.sent();
                    if (!data.result) {
                        console.log("No transaction at index ".concat(index, " for block ").concat(block, "."));
                        return [3 /*break*/, 13]; // exit the inner loop if no transaction is found
                    }
                    simpleTx = {
                        from: data.result.from,
                        to: data.result.to,
                        hash: data.result.hash
                    };
                    console.log("Storing transaction: from ".concat(simpleTx.from, " to ").concat(simpleTx.to, ", hash ").concat(simpleTx.hash));
                    return [4 /*yield*/, writer.appendRow(simpleTx)];
                case 8:
                    _a.sent();
                    queryCount++;
                    if (!(queryCount % 5 === 0)) return [3 /*break*/, 10];
                    console.log("Reached 5 queries. Waiting for 1 minute...");
                    return [4 /*yield*/, delay(60000)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_1 = _a.sent();
                    console.error("Fetch error at block ".concat(block, ", index ").concat(index, ":"), error_1);
                    return [3 /*break*/, 13];
                case 12:
                    index++;
                    return [3 /*break*/, 4];
                case 13:
                    block++;
                    return [3 /*break*/, 3];
                case 14:
                    _i++;
                    return [3 /*break*/, 2];
                case 15: return [4 /*yield*/, writer.close()];
                case 16:
                    _a.sent();
                    console.log('All transactions stored in transactions.parquet');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) { return console.error('Main error:', err); });
