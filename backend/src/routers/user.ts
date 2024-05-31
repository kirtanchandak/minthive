import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const prismaClient = new PrismaClient();

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
