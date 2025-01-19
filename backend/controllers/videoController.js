const videoService = require("../services/videoService");
const {
  getRandomClips,
  trimClips,
  combineClips,
} = require("../services/videoService");

// Generate a video with Hopecore text, TTS, and video
exports.generateVideo = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 1) Generate text from GPT

    // 2) Convert that text to speech

    // 3) Merge TTS audio, background music, optional text overlays into a final video
    const videoPath = await videoService.generateHopecoreVideo({
      backgroundMusic: "assets/hopecoreMusic.mp3", // Replace with actual path
      backgroundVideo: "assets/bg.mp4", // Replace with actual path
    });

    // (Optional) Upload the video to S3 or return local path
    // const videoUrl = await someS3UploadFunction(videoPath);

    return res.json({
      success: true,
      videoPath,
      // videoUrl: videoUrl, // Uncomment if implemented
    });
  } catch (error) {
    console.error("Error generating video:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while generating video." });
  }
};

// Generate a Hopecore video by combining random clips
exports.generateHopecoreVideo = async (req, res) => {
  try {
    const { clipDuration = 3, totalDuration = 25 } = req.body; // Default: 5 seconds per clip, 30 seconds total
    const numClips = Math.ceil(totalDuration / clipDuration);

    console.log(
      `Generating a ${totalDuration}-second video using ${numClips} clips, each ${clipDuration} seconds long.`
    );

    // 1) Select random clips
    const selectedClips = getRandomClips("../backgrounds", numClips);

    // 2) Trim clips
    const trimmedClips = await trimClips(selectedClips, "./temp", clipDuration);

    // 3) Combine trimmed clips
    const outputFilePath = "./temp/final-video.mp4";
    await combineClips({ clips: trimmedClips, outputFile: outputFilePath });

    // 4) Send the generated video to the client
    res.sendFile(outputFilePath, { root: "." });
  } catch (error) {
    console.error("Error generating Hopecore video:", error);
    res.status(500).json({ error: "Failed to generate video" });
  }
};

// Test endpoint for random clip selection
exports.testRandomClips = (req, res) => {
  try {
    const randomClips = getRandomClips("../backgrounds", 3);
    console.log("Selected random clips:", randomClips);

    res.json({ randomClips });
  } catch (error) {
    console.error("Error fetching random clips:", error);
    res.status(500).json({ error: "Failed to fetch random clips" });
  }
};
