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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const opossum_1 = __importDefault(require("opossum"));
const async_1 = __importDefault(require("async"));
(0, axios_retry_1.default)(axios_1.default, { retries: 3, retryDelay: axios_retry_1.default.exponentialDelay });
const fetchDataWithRetry = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(url);
        return data;
    }
    catch (error) {
        console.error("Failed to fetch data after retres", String(error));
    }
});
//Circuit Breaker configuration
const breaker = new opossum_1.default(fetchDataWithRetry, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 5000,
});
breaker.fallback(() => "Service temporarily available");
const queue = async_1.default.queue((_a) => __awaiter(void 0, [_a], void 0, function* ({ url }) {
    try {
        const result = yield breaker.fire(url);
        console.log({ result });
    }
    catch (error) {
        console.error("Error fetching data", String(error));
    }
}));
const fetchMultipleURLs = (urls) => {
    urls.forEach((url) => queue.push({ url }));
};
fetchMultipleURLs(Array(10).fill("http://localhost:3001/unstable"));
