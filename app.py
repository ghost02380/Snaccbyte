import os
import subprocess
import uuid
from flask import Flask, render_template, request, send_file, after_this_request
import static_ffmpeg

# Initialize Flask application
app = Flask(__name__)

# Initialize static_ffmpeg to ensure binaries are present
static_ffmpeg.add_paths()

# Configuration for storage paths
UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CONVERTED_FOLDER'] = CONVERTED_FOLDER

@app.route('/')
def index():
    """
    Renders the main application interface.

    :return: HTML content of the landing page.
    """
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_file():
    """
    Handles the file upload and conversion process for Video, Audio, and Images.

    1. Validates the file.
    2. Saves it temporarily.
    3. Runs FFmpeg conversion (works for images too).
    4. Returns the file to the user.
    5. Cleans up temporary files after the request.

    :return: File download response or Error message.
    """
    # Check if file part is present in request
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']
    target_format = request.form.get('format')

    # Check if a file was actually selected
    if file.filename == '':
        return "No selected file", 400

    if file and target_format:
        # Generate unique IDs to prevent filename collisions
        unique_id = str(uuid.uuid4())
        original_filename = file.filename
        _, file_ext = os.path.splitext(original_filename)

        input_filename = f"{unique_id}{file_ext}"
        output_filename = f"{unique_id}.{target_format}"

        input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
        output_path = os.path.join(app.config['CONVERTED_FOLDER'], output_filename)

        # Save the uploaded file
        file.save(input_path)

        try:
            # Construct FFmpeg command
            # FFmpeg detects image formats automatically based on extension
            command = [
                'ffmpeg',
                '-i', input_path,
                '-y',               # Overwrite output files
                output_path
            ]

            # Execute the command
            # Using subprocess to call the FFmpeg binary
            subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            # Register a callback to delete files after the response is sent
            @after_this_request
            def remove_files(response):
                try:
                    if os.path.exists(input_path):
                        os.remove(input_path)
                    if os.path.exists(output_path):
                        os.remove(output_path)
                except Exception as e:
                    app.logger.error(f"Error cleaning up files: {e}")
                return response

            # Determine download filename
            download_name = f"converted_{os.path.splitext(original_filename)[0]}.{target_format}"

            # Send file to client
            return send_file(
                output_path,
                as_attachment=True,
                download_name=download_name
            )

        except subprocess.CalledProcessError as e:
            # Handle FFmpeg errors
            error_msg = e.stderr.decode()
            print(f"FFmpeg Error: {error_msg}")
            return "Conversion failed. The file might be corrupt or the format is not supported.", 500
        except Exception as e:
            # Handle general server errors
            print(f"General Error: {str(e)}")
            return f"An error occurred: {str(e)}", 500

    return "Invalid request", 400

if __name__ == '__main__':
    # Run on port 80, listen on all interfaces
    app.run(host='0.0.0.0', port=80, debug=True)