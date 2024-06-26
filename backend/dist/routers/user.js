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
exports.TOTAL_DECIMALS = void 0;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../types");
const middleware_1 = require("../middleware");
const web3_js_1 = require("@solana/web3.js");
const DEFAULT_TITLE = "Upload thumbanails, to select the best one!";
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
exports.TOTAL_DECIMALS = 1000000;
router.get("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const taskId = req.query.taskId;
    // @ts-ignore
    const userId = req.userId;
    const taskDetails = yield prismaClient.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(taskId),
        },
        include: {
            options: true,
        },
    });
    if (!taskDetails) {
        return res.status(411).json({
            message: "You dont have access to this task",
        });
    }
    // Todo: Can u make this faster?
    const responses = yield prismaClient.submission.findMany({
        where: {
            task_id: Number(taskId),
        },
        include: {
            option: true,
        },
    });
    const result = {};
    taskDetails.options.forEach((option) => {
        result[option.id] = {
            count: 0,
            option: {
                imageUrl: option.image_url,
            },
        };
    });
    responses.forEach((r) => {
        result[r.option_id].count++;
    });
    res.json({
        result,
        taskDetails,
    });
}));
router.post("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-expect-error
    const userId = req.userId;
    const body = req.body;
    const parseData = types_1.createTaskInput.safeParse(body);
    if (!parseData.success) {
        return res.status(411).json({
            message: "You've sent the wrong data!",
        });
    }
    let response = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const response = yield tx.task.create({
            data: {
                title: (_a = parseData.data.title) !== null && _a !== void 0 ? _a : DEFAULT_TITLE,
                amount: 1 * exports.TOTAL_DECIMALS,
                signature: parseData.data.signature,
                user_id: userId,
            },
        });
        yield tx.option.createMany({
            data: parseData.data.options.map((x) => ({
                image_url: x.imageUrl,
                task_id: response.id,
            })),
        });
        return response;
    }));
    res.json({
        id: response.id,
    });
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { signature, publicKey } = req.body;
    const message = new TextEncoder().encode("Sign into minthive");
    // const message = "Sign into minthive";
    const result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(signature.data), new web3_js_1.PublicKey(publicKey).toBytes());
    console.log(result);
    const existingUser = yield prismaClient.user.findFirst({
        where: {
            address: publicKey,
        },
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id,
        }, (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "");
        console.log(process.env.JWT_SECRET);
        res.json({
            token,
        });
    }
    else {
        const user = yield prismaClient.user.create({
            data: {
                address: publicKey,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, (_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : "");
        res.json({
            token,
        });
    }
}));
exports.default = router;
