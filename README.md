# Snaccbyte 🐲

I built Snaccbyte because I was tired of **"Free Online Converters" that aren't actually free**.

We've all been there: you just need to turn a `.wav` into an `.mp3` or a `.mkv` into an `.mp4`, but the website makes you wait in a queue, bombards you with ads, or hits you with a "Daily Limit Reached" after two files. Plus, uploading my personal videos to a random server just to change the container format never felt right.

I wanted something where **I** control the processing. A tool that runs locally on my machine, uses the power of my own CPU, and doesn't send my data anywhere.

## What is this?

Snaccbyte is a local, universal media converter with a modern, drag-and-drop interface. It wraps the power of FFmpeg in a clean UI.

*   **All-in-One Tool:** Convert Video, Audio, and Images all in one place.
*   **Privacy First:** Your files are processed strictly on your local machine (localhost). Nothing is ever uploaded to the cloud.
*   **No Limits:** Convert as many files as you want, as large as you want. If your computer can handle it, Snaccbyte can convert it.
*   **Smart Formats:** Pre-configured presets for the most common needs (MP4, MP3, WEBP, GIF, WAV, and more).

## Getting Started

You only need Python. The heavy lifting is handled by libraries.

### 1. Requirements
Make sure you have **Python 3** installed.

### 2. Install
Install the dependencies via terminal. We use Flask for the interface and `static-ffmpeg` so you don't have to mess with system paths.

```bash
pip install flask static-ffmpeg
```

### 3. Run it
Start the application:

```bash
python app.py
```

Then open your browser to `http://localhost:80` (or the port shown in your terminal).

## How to use

### ⚡ User Guide
1.  **Select Mode:** Toggle between Video, Audio, or Image at the top.
2.  **Drop it:** Drag your file into the "Drop Zone" or click to browse.
3.  **Select Format:** Choose your target extension from the dropdown (e.g., `.mp4` for video, `.webp` for images).
4.  **Convert:** Hit the button. The tool will process the data using your local CPU.
5.  **Download:** Once the success screen appears, save your converted file directly to your disk.

---

*No limits, no clouds, just conversion.*