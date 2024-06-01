import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authWorkerMiddleware } from "../middleware";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { TOTAL_DECIMALS } from "./user";
import { date } from "zod";

const router = Router();

const prismaClient = new PrismaClient();
const TOTAL_SUBMISSIONS = 100;

router.post("/payout", authWorkerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId;

  const worker = await prismaClient.worker.findFirst({
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

  await prismaClient.$transaction(async (tx) => {
    await tx.worker.update({
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
    await tx.payouts.create({
      data: {
        user_id: Number(userId),
        amount: worker.pending_amount,
        status: "Processing",
        signature: txnId,
      },
    });
  });

  // send the amount to solana blokchain
  res.json({
    message: "Processing",
    amount: worker.pending_amount,
  });
});

router.get("/balance", authWorkerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId;

  const worker = await prismaClient.worker.findFirst({
    where: {
      id: Number(userId),
    },
  });

  res.json({
    pendingAmount: worker?.pending_amount,
    lockedAmount: worker?.pending_amount,
  });
});

router.post("/submission", authWorkerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const body = req.body;
  const parsedBody = createSubmissionInput.safeParse(body);

  if (parsedBody.success) {
    const task = await getNextTask(Number(userId));
    if (!task || task?.id !== Number(parsedBody.data.taskId)) {
      return res.status(411).json({
        message: "Incorrect task id",
      });
    }

    const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();

    const submission = await prismaClient.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          option_id: Number(parsedBody.data.selection),
          worker_id: userId,
          task_id: Number(parsedBody.data.taskId),
          amount: Number(amount),
        },
      });

      await tx.worker.update({
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
    });

    const nextTask = await getNextTask(Number(userId));
    res.json({
      nextTask,
      amount,
    });
  } else {
    res.status(411).json({
      message: "Incorrect inputs",
    });
  }
});

router.get("/nextTask", authWorkerMiddleware, async (req, res) => {
  //@ts-ignore
  const userId: string = req.userId;

  const task = await getNextTask(Number(userId));

  if (!task) {
    res.status(411).json({
      message: "There are no tasks for you to review",
    });
  } else {
    res.json({
      task,
    });
  }
});

router.post("/signin", async (req, res) => {
  const hardCodedWalletAddress = "0x3D68b6bE0fA7aeea256cef433373B5a81348ab4d";

  const existingUser = await prismaClient.worker.findFirst({
    where: {
      address: hardCodedWalletAddress,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      process.env.JWT_WORKER_SECRET ?? ""
    );
    console.log(process.env.JWT_WORKER_SECRET);
    res.json({
      token,
    });
  } else {
    const user = await prismaClient.worker.create({
      data: {
        address: hardCodedWalletAddress,
        pending_amount: 0,
        locked_amount: 0,
      },
    });
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_WORKER_SECRET ?? ""
    );
    res.json({
      token,
    });
  }
});

export default router;
