import express from "express";
import { router } from "./routes/v1";
import { PORT } from "./config";

const app = express();
app.use(express.json())
app.use("/api/v1", router);

// allow cross-origin requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})
