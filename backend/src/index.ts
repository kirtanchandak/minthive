import express from "express";
import userRouter from "./routers/user";
import workerRouter from "./routers/worker";

export const JWT_SECRET = "chandak";

const app = express();

app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

app.listen(3000);
