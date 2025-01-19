require("dotenv").config();
const express = require("express");
const cors = require("cors");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/video", videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hopecore backend running at http://localhost:${PORT}`);
});
