import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { createTaskInput } from "../types";
import { authMiddleware } from "../middleware";

const DEFAULT_TITLE = "Upload thumbanails, to select the best one!";

const router = Router();

const prismaClient = new PrismaClient();

router.post("/task", authMiddleware, async (req, res) => {
  //@ts-expect-error
  const userId = req.userId;
  const body = req.body;

  const parseData = createTaskInput.safeParse(body);

  if (!parseData.success) {
    return res.status(411).json({
      message: "You've sent the wrong data!",
    });
  }

  let response = await prismaClient.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title ?? DEFAULT_TITLE,
        amount: "1",
        signature: parseData.data.signature,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data: parseData.data.options.map((x) => ({
        image_url: x.imageUrl,
        task_id: response.id,
      })),
    });

    return response;
  });

  res.json({
    id: response.id,
  });
});

router.post("/signin", async (req, res) => {
  const hardCodedWalletAddress = "0x3D68b6bE0fA7aeea256cef433373B5a81348ab4C";

  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: hardCodedWalletAddress,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      process.env.JWT_SECRET ?? ""
    );
    console.log(process.env.JWT_SECRET);
    res.json({
      token,
    });
  } else {
    const user = await prismaClient.user.create({
      data: {
        address: hardCodedWalletAddress,
      },
    });
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET ?? ""
    );
    res.json({
      token,
    });
  }
});

export default router;
