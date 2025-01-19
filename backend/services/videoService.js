const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

exports.generateHopecoreVideo = async ({
  text,
  ttsAudioPath,
  backgroundMusic,
  backgroundVideo,
}) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(__dirname, `../temp/output-${Date.now()}.mp4`);

    ffmpeg()
      .input(backgroundVideo) // index 0 -> video
      .input(ttsAudioPath) // index 1 -> TTS audio
      .input(backgroundMusic) // index 2 -> music
      .complexFilter(
        [
          {
            // Combine TTS + music
            filter: "amix",
            options: {
              inputs: 2, // TTS + music
              duration: "longest",
              dropout_transition: 2,
            },
            inputs: ["1:0", "2:0"],
            outputs: "mixedAudio",
          },

          // OPTIONAL: Overlay text with drawtext
          // {
          //   filter: 'drawtext',
          //   options: {
          //     fontfile: '/path/to/font.ttf',
          //     text: text,
          //     fontsize: 40,
          //     fontcolor: 'white',
          //     x: '(w-text_w)/2',
          //     y: '(h-text_h)/2'
          //   },
          //   inputs: '0:v',
          //   outputs: 'textOverlay'
          // }
        ],
        ["mixedAudio"]
      )
      .outputOptions("-map 0:v") // Take video from first input
      .outputOptions("-map [mixedAudio]") // Take the combined audio
      .outputOptions("-shortest") // Stop when shortest stream ends
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err));
  });
};
const fs = require("fs");

/**
 * Get a specified number of random video clips from the backgrounds directory.
 * @param {string} folderPath - The path to the backgrounds folder.
 * @param {number} count - The number of random clips to select.
 * @returns {string[]} - An array of file paths to the selected clips.
 */
function getRandomClips(folderPath, count = 3) {
  const videoDir = path.join(__dirname, folderPath);
  const videos = fs
    .readdirSync(videoDir)
    .filter((file) => file.endsWith(".mp4"));

  // Shuffle and select `count` clips
  const shuffled = videos.sort(() => 0.5 - Math.random());
  const selectedClips = shuffled.slice(0, count);

  // Return full paths
  return selectedClips.map((clip) => path.join(videoDir, clip));
}

/**
 * Normalize video clips to ensure they have consistent resolution, framerate, and codec.
 * @param {string[]} clips - The array of input clip paths.
 * @param {string} outputDir - The directory to save normalized clips.
 * @returns {Promise<string[]>} - An array of file paths to the normalized clips.
 */
async function normalizeClips(clips, outputDir) {
  const normalizedClips = [];

  for (const [index, clip] of clips.entries()) {
    const normalizedClip = `${outputDir}/normalized-${index}.mp4`;

    await new Promise((resolve, reject) => {
      ffmpeg(clip)
        .outputOptions([
          "-c:v libx264", // Normalize video codec to H.264
          "-c:a aac", // Normalize audio codec to AAC
          "-preset veryfast", // Optimize processing speed
          "-movflags +faststart", // Optimize for progressive streaming
          "-vf scale=1920:1080", // Normalize resolution to 1920x1080 (adjust as needed)
          "-r 30", // Normalize framerate to 30 fps
        ])
        .on("end", () => {
          console.log(`Normalized clip saved: ${normalizedClip}`);
          normalizedClips.push(normalizedClip);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error normalizing clip ${clip}:`, err);
          reject(err);
        })
        .save(normalizedClip);
    });
  }

  return normalizedClips;
}

/**
 * Combine multiple video clips into a single video using FFmpeg.
 * @param {Object} options - Options for combining videos.
 * @param {string[]} options.clips - An array of file paths to the video clips.
 * @param {string} options.outputFile - The path to save the final video.
 * @param {string} [options.backgroundMusic] - The path to the background music file (optional).
 * @returns {Promise<string>} - The path to the generated video.
 */
async function combineClips({ clips, outputFile }) {
  return new Promise((resolve, reject) => {
    console.log("Combining Clips:", clips);

    const ffmpegCommand = ffmpeg();

    // Add each clip as an input to FFmpeg
    clips.forEach((clip) => {
      ffmpegCommand.input(clip);
      console.log(`Added clip to FFmpeg input: ${clip}`);
    });

    ffmpegCommand
      .on("start", (cmd) => console.log(`FFmpeg command: ${cmd}`))
      .on("end", () => {
        console.log(`Video saved to ${outputFile}`);
        resolve(outputFile);
      })
      .on("error", (err) => {
        console.error("Error during FFmpeg processing:", err);
        reject(err);
      })
      .outputOptions(["-filter_complex", `concat=n=${clips.length}:v=1:a=0`]) // Updated concat filter
      .save(outputFile);
  });
}

async function trimClips(clips, outputDir, duration) {
  const trimmedClips = [];

  for (const [index, clip] of clips.entries()) {
    const trimmedClip = `${outputDir}/trimmed-${index}.mp4`;

    await new Promise((resolve, reject) => {
      ffmpeg(clip)
        .setStartTime(0) // Start trimming from the beginning
        .setDuration(duration) // Trim to the specified duration
        .outputOptions([
          "-c:v libx264", // Re-encode to H.264
          "-preset veryfast", // Speed up encoding
          "-movflags +faststart", // Optimize for progressive streaming
          "-vf scale=1920:1080", // Normalize resolution
          "-r 30", // Normalize framerate
          "-an", // Remove audio stream
        ])
        .on("end", () => {
          console.log(`Trimmed clip saved: ${trimmedClip}`);
          trimmedClips.push(trimmedClip);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error trimming clip ${clip}:`, err);
          reject(err);
        })
        .save(trimmedClip);
    });
  }

  return trimmedClips;
}

module.exports = { getRandomClips, normalizeClips, combineClips, trimClips };
