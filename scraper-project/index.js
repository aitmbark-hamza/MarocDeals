import { connectDB } from "./utils/db.js";
connectDB(process.env.MONGO_URI);
