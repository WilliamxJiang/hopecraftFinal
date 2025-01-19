const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

// POST /video/generate
router.post("/generate", videoController.generateVideo);
// POST /video/hopecore - Generate a full Hopecore video
router.post("/hopecore", videoController.generateHopecoreVideo);

// GET /video/test-clips - Test random video clip selection
router.get("/test-clips", videoController.testRandomClips);

module.exports = router;
