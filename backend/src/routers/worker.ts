import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authWorkerMiddleware } from "../middleware";

const router = Router();

const prismaClient = new PrismaClient();

router.get("/nextTask", authWorkerMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const task = await prismaClient.task.findFirst({
    where: {
      done: false,
      submissions: {
        none: {
          worker_id: userId,
        },
      },
    },
    select: {
      title: true,
      options: true,
    },
  });

  if (!task) {
    res.status(411).json({
      message: "There are no tasks for you to review",
    });
  } else {
    res.status(411).json({
      task,
    });
  }
});

router.post("/signin", async (req, res) => {
  const hardCodedWalletAddress = "0x3D68b6bE0fA7aeea256cef433373B5a81348ab3a";

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
