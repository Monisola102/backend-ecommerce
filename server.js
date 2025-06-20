import express from "express"
import dotenv from "dotenv"
import { DataBaseConnection } from "./databaseconnection.js"
import userRoute from "./routes/user-routes.js"

dotenv.config();

const app = express();

app.use(express.json());

app.use('/users', userRoute);
DataBaseConnection().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Listening on port", process.env.PORT);
  });
});
