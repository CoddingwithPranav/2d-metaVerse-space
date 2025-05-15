import express from "express";
import { router } from "./routes/v1";
import { PORT } from "./config";

const app = express();
app.use(express.json())
app.use("/api/v1", router);

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})
