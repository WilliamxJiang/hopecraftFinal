from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, AudioFileClip
from moviepy.video.fx import all as vfx
import openai
import os
from dotenv import load_dotenv
import random

# Load environment variables from .env file
load_dotenv()

# Set OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_hopecore_text(user_prompt):
    system_prompt = "You are an uplifting script generator in a Hopecore style. Please provide a short, comforting message that is exactly 50 words. If the user is feeling sad about mental health, include a self-help resource or helpline in Canada."

    user_message = f"User is sad about: {user_prompt}. Generate a short, comforting message in Hopecore style."

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            max_tokens=90,
        )

        generated_text = response['choices'][0]['message']['content'].strip()
        words = generated_text.split()

        if len(words) == 50:
            return generated_text
        else:
            return generate_hopecore_text(user_prompt)
    except Exception as e:
        print(f"Error in GPT: {e}")
        return "Something went wrong, please try again later."

def get_helplines_for_sadness(prompt):
    mental_health_keywords = ["sad", "anxiety", "depression", "stress", "overwhelmed", "mental health"]
    if any(keyword in prompt.lower() for keyword in mental_health_keywords):
        return """
        If you're feeling down or struggling with your mental health, here are some helplines:
        - Kids Help Phone: Call 1-800-668-6868 (Canada-wide, for youth under 20)
        - Crisis Services Canada: Call 1-833-456-4566 (24/7)
        - Canadian Mental Health Association: Visit https://cmha.ca/
        - Text 686868 to speak with a trained volunteer for immediate help.
        """
    return ""

def create_video_with_text(user_prompt, video_files, audio_path, output_path):
    try:
        # Validate file paths
        video_path = random.choice(video_files)
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # Load video safely
        try:
            video = VideoFileClip(video_path)
        except UnicodeDecodeError as e:
            print(f"Error loading video file: {e}")
            return

        # Generate the comforting message and helplines
        hopecore_message = generate_hopecore_text(user_prompt)
        helplines = get_helplines_for_sadness(user_prompt)

        # Create the text clips
        text_clips = []
        hopecore_words = hopecore_message.split()
        hopecore_chunks = [' '.join(hopecore_words[i:i + 5]) for i in range(0, len(hopecore_words), 5)]

        for i, chunk in enumerate(hopecore_chunks):
            txt_clip = TextClip(chunk, fontsize=40, color='white',
                                font='/Users/wj/Documents/hopecoreF/hopecraft/assets/MinecraftStandardBoldOblique.ttf',
                                size=(video.size[0] * 0.9, None), method='caption', stroke_color='black', stroke_width=2)
            txt_clip = txt_clip.set_pos('center').set_duration(2).set_start(i * 2)
            text_clips.append(txt_clip)

        if helplines:
            txt_clip_helplines = TextClip(helplines, fontsize=30, color='white',
                                          font='/Users/wj/Documents/hopecoreF/hopecraft/assets/MinecraftStandardBoldOblique.ttf',
                                          size=(video.size[0] * 0.9, None), method='caption', stroke_color='black',
                                          stroke_width=2)
            txt_clip_helplines = txt_clip_helplines.set_pos('center').set_duration(10).set_start(len(hopecore_chunks) * 2)
            text_clips.append(txt_clip_helplines)

        final_clip = CompositeVideoClip([video] + text_clips)

        # Add audio safely
        try:
            audio_clip = AudioFileClip(audio_path).subclip(15)  # Start audio at 15 seconds
        except UnicodeDecodeError as e:
            print(f"Error loading audio file: {e}")
            return

        # Trim or loop the audio to match the video's duration
        audio_clip = audio_clip.subclip(0, min(audio_clip.duration, final_clip.duration))

        if audio_clip.duration < final_clip.duration:
            audio_clip = audio_clip.fx(vfx.audio_loop, duration=final_clip.duration)

        final_clip = final_clip.set_audio(audio_clip)
        final_clip.write_videofile(
            output_path, codec="libx264", audio_codec="aac", fps=24, threads=4,
            temp_audiofile="temp-audio.m4a", remove_temp=True
        )
        print("Video has been created successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    user_prompt = input("Enter what you're feeling sad about: ")
    video_files = ["./temp/final-video.mp4"]
    audio_path = "/Users/wj/Documents/hopecoreF/hopecraft/assets/hopecore-music.mp3"
    output_path = "reencoded-final-video.mp4"
    create_video_with_text(user_prompt, video_files, audio_path, output_path)
