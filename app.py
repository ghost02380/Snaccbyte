import os
import subprocess
import uuid
from flask import Flask, render_template, request, send_file, after_this_request
import static_ffmpeg

# Initialize Flask application
app = Flask(__name__)

# Initialize static_ffmpeg to ensure binaries are present in the path
static_ffmpeg.add_paths()

# Configuration for storage paths
UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'

# Ensure working directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CONVERTED_FOLDER'] = CONVERTED_FOLDER

@app.route('/')
def index():
    """
    Renders the main Snaccbyte interface.

    :return: HTML content of the landing page.
    """
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_file():
    """
    Handles the file upload and conversion process.

    1. Validates input file.
    2. Saves to upload folder with a UUID.
    3. Invokes FFmpeg for conversion.
    4. Returns the converted file stream.
    5. Schedules cleanup of temporary files.

    :return: File download response or Error message (HTTP 400/500).
    """
    # Check for file part
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']
    target_format = request.form.get('format')

    # Check for empty filename
    if file.filename == '':
        return "No selected file", 400

    if file and target_format:
        # Generate unique identifiers
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
            # -y forces overwrite if file exists
            command = [
                'ffmpeg',
                '-i', input_path,
                '-y',
                output_path
            ]

            # Execute conversion
            subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            # Cleanup hook: Deletes files after response is sent
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

            # Define friendly download filename
            download_name = f"snaccbyte_{os.path.splitext(original_filename)[0]}.{target_format}"

            # Return the file
            return send_file(
                output_path,
                as_attachment=True,
                download_name=download_name
            )

        except subprocess.CalledProcessError as e:
            # FFmpeg processing error
            error_msg = e.stderr.decode()
            print(f"FFmpeg Error: {error_msg}")
            return "Conversion failed. The file format might be incompatible.", 500
        except Exception as e:
            # General server error
            print(f"General Error: {str(e)}")
            return f"An internal error occurred: {str(e)}", 500

    return "Invalid request parameters", 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)