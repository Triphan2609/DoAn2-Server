import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectDB } from "./config/database.js";
import session from "express-session";
// import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/api.js";
import configViewEngine from "./controllers/viewEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Config view engine
configViewEngine(app);

// Connect to Database

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));

// Khởi tạo Passport
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

// Routes
app.use("/api/v1", routes);

app.use("/public", express.static(path.join(__dirname, "..", "public")));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
