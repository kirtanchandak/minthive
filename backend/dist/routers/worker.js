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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("../middleware");
const db_1 = require("../db");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
const TOTAL_SUBMISSIONS = 100;
router.post("/payout", middleware_1.authWorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const worker = yield prismaClient.worker.findFirst({
        where: { id: Number(userId) },
    });
    if (!worker) {
        return res.status(403).json({
            message: "Worker not found!",
        });
    }
    const address = worker.address;
    //logic here after solana
    const txnId = "473987493";
    yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.worker.update({
            where: {
                id: Number(userId),
            },
            data: {
                pending_amount: {
                    decrement: worker.pending_amount,
                },
                locked_amount: {
                    increment: worker.pending_amount,
                },
            },
        });
        yield tx.payouts.create({
            data: {
                user_id: Number(userId),
                amount: worker.pending_amount,
                status: "Processing",
                signature: txnId,
            },
        });
    }));
    // send the amount to solana blokchain
    res.json({
        message: "Processing",
        amount: worker.pending_amount,
    });
}));
router.get("/balance", middleware_1.authWorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const worker = yield prismaClient.worker.findFirst({
        where: {
            id: Number(userId),
        },
    });
    res.json({
        pendingAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
        lockedAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
    });
}));
router.post("/submission", middleware_1.authWorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody = types_1.createSubmissionInput.safeParse(body);
    if (parsedBody.success) {
        const task = yield (0, db_1.getNextTask)(Number(userId));
        if (!task || (task === null || task === void 0 ? void 0 : task.id) !== Number(parsedBody.data.taskId)) {
            return res.status(411).json({
                message: "Incorrect task id",
            });
        }
        const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();
        const submission = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const submission = yield tx.submission.create({
                data: {
                    option_id: Number(parsedBody.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedBody.data.taskId),
                    amount: Number(amount),
                },
            });
            yield tx.worker.update({
                where: {
                    id: userId,
                },
                data: {
                    pending_amount: {
                        increment: Number(amount),
                    },
                },
            });
            return submission;
        }));
        const nextTask = yield (0, db_1.getNextTask)(Number(userId));
        res.json({
            nextTask,
            amount,
        });
    }
    else {
        res.status(411).json({
            message: "Incorrect inputs",
        });
    }
}));
router.get("/nextTask", middleware_1.authWorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const task = yield (0, db_1.getNextTask)(Number(userId));
    if (!task) {
        res.status(411).json({
            message: "There are no tasks for you to review",
        });
    }
    else {
        res.json({
            task,
        });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const hardCodedWalletAddress = "0x3D68b6bE0fA7aeea256cef433373B5a81348ab4d";
    const existingUser = yield prismaClient.worker.findFirst({
        where: {
            address: hardCodedWalletAddress,
        },
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id,
        }, (_a = process.env.JWT_WORKER_SECRET) !== null && _a !== void 0 ? _a : "");
        console.log(process.env.JWT_WORKER_SECRET);
        res.json({
            token,
        });
    }
    else {
        const user = yield prismaClient.worker.create({
            data: {
                address: hardCodedWalletAddress,
                pending_amount: 0,
                locked_amount: 0,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, (_b = process.env.JWT_WORKER_SECRET) !== null && _b !== void 0 ? _b : "");
        res.json({
            token,
        });
    }
}));
exports.default = router;
