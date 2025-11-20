import os
import subprocess
import uuid
from flask import Flask, render_template, request, send_file, after_this_request

# Import static_ffmpeg to handle binaries automatically via pip
import static_ffmpeg

app = Flask(__name__)

# This function downloads the ffmpeg binaries if missing and adds them to the PATH
static_ffmpeg.add_paths()

# Configuration for upload and output directories
UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CONVERTED_FOLDER'] = CONVERTED_FOLDER

@app.route('/')
def index():
    """
    Renders the main page of the application.
    """
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_file():
    """
    Handles file upload, conversion process using FFmpeg, and returns the converted file.
    """
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']
    target_format = request.form.get('format')

    if file.filename == '':
        return "No selected file", 400

    if file and target_format:
        # Generate unique filenames to prevent collisions
        unique_id = str(uuid.uuid4())
        original_filename = file.filename
        file_ext = os.path.splitext(original_filename)[1]

        input_filename = f"{unique_id}{file_ext}"
        output_filename = f"{unique_id}.{target_format}"

        input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
        output_path = os.path.join(app.config['CONVERTED_FOLDER'], output_filename)

        # Save the uploaded file to the server
        file.save(input_path)

        try:
            # Construct the FFmpeg command
            # Since static_ffmpeg.add_paths() was called, 'ffmpeg' is now recognized
            command = [
                'ffmpeg',
                '-i', input_path,
                '-y',
                output_path
            ]

            # Execute the conversion command
            subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            # Schedule file deletion after the response is sent to save space
            @after_this_request
            def remove_files(response):
                try:
                    if os.path.exists(input_path):
                        os.remove(input_path)
                    if os.path.exists(output_path):
                        os.remove(output_path)
                except Exception as e:
                    print(f"Error removing files: {e}")
                return response

            # Send the converted file to the user
            return send_file(
                output_path,
                as_attachment=True,
                download_name=f"converted_{os.path.splitext(original_filename)[0]}.{target_format}"
            )

        except subprocess.CalledProcessError as e:
            # Log the error output from ffmpeg for debugging
            print(f"FFmpeg Error: {e.stderr.decode()}")
            return f"Conversion failed. The file might be corrupt or the format not supported.", 500
        except Exception as e:
            return f"An error occurred: {str(e)}", 500

    return "Invalid request", 400

if __name__ == '__main__':
    # Run the Flask application
    app.run(host='0.0.0.0', port=80, debug=False)