/**
 * Media Converter Logic
 * Handles UI state, file validation, and Fetch API interaction.
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('convertForm');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const emptyState = document.getElementById('emptyState');
    const fileState = document.getElementById('fileState');
    const fileNameDisplay = document.getElementById('fileName');
    const formatSelect = document.getElementById('formatSelect');
    const typeRadios = document.getElementsByName('type');

    const loadingArea = document.getElementById('loadingArea');
    const resultArea = document.getElementById('resultArea');
    const downloadLink = document.getElementById('downloadLink');
    const resetBtn = document.getElementById('resetBtn');

    // Format definitions
    const formats = {
        video: [
            { value: 'mp4', label: 'MP4 (Universal)' },
            { value: 'mkv', label: 'MKV (High Quality)' },
            { value: 'avi', label: 'AVI (Legacy)' },
            { value: 'mov', label: 'MOV (Apple)' },
            { value: 'webm', label: 'WEBM (Web)' },
            { value: 'flv', label: 'FLV (Flash)' },
            { value: 'wmv', label: 'WMV (Windows)' },
            { value: 'gif', label: 'GIF (Animated)' }
        ],
        audio: [
            { value: 'mp3', label: 'MP3 (Standard)' },
            { value: 'wav', label: 'WAV (Lossless)' },
            { value: 'flac', label: 'FLAC (Lossless)' },
            { value: 'aac', label: 'AAC (Apple/Web)' },
            { value: 'ogg', label: 'OGG (Vorbis)' },
            { value: 'm4a', label: 'M4A (Mobile)' },
            { value: 'wma', label: 'WMA (Windows)' },
            { value: 'opus', label: 'OPUS (Streaming)' }
        ]
    };

    /**
     * Updates the dropdown options based on selected type (audio/video).
     * @param {string} type - 'audio' or 'video'
     */
    function populateFormats(type) {
        formatSelect.innerHTML = '';
        formats[type].forEach(fmt => {
            const option = document.createElement('option');
            option.value = fmt.value;
            option.textContent = fmt.label;
            formatSelect.appendChild(option);
        });
    }

    // Event Listeners for Switch
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            populateFormats(e.target.value);
        });
    });

    // Initialize with video
    populateFormats('video');

    /**
     * UI Helper: Toggle File Display
     */
    function updateFileUI() {
        if (fileInput.files.length > 0) {
            emptyState.classList.add('hidden');
            fileState.classList.remove('hidden');
            fileState.classList.add('flex');
            fileNameDisplay.textContent = fileInput.files[0].name;
            dropZone.classList.add('border-primary', 'bg-primary/10');
        } else {
            emptyState.classList.remove('hidden');
            fileState.classList.add('hidden');
            fileState.classList.remove('flex');
            fileNameDisplay.textContent = '';
            dropZone.classList.remove('border-primary', 'bg-primary/10');
        }
    }

    // Drag and Drop Handlers
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary', 'bg-primary/5');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-primary', 'bg-primary/5');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary', 'bg-primary/5');

        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            updateFileUI();
        }
    });

    fileInput.addEventListener('change', updateFileUI);

    /**
     * Form Submission Handler
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (fileInput.files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No File Selected',
                text: 'Please upload a media file to continue.',
                confirmButtonColor: '#4f46e5',
                background: '#1e293b',
                color: '#fff'
            });
            return;
        }

        // Switch to Loading State
        form.classList.add('hidden');
        loadingArea.classList.remove('hidden');
        loadingArea.classList.add('flex');

        const formData = new FormData(form);

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            // Extract filename from header
            const disposition = response.headers.get('Content-Disposition');
            let filename = "converted." + formatSelect.value;
            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Update Download Button
            downloadLink.href = url;
            downloadLink.download = filename;

            // Show Success
            loadingArea.classList.add('hidden');
            loadingArea.classList.remove('flex');
            resultArea.classList.remove('hidden');

        } catch (error) {
            // Reset to Form
            loadingArea.classList.add('hidden');
            loadingArea.classList.remove('flex');
            form.classList.remove('hidden');

            Swal.fire({
                icon: 'error',
                title: 'Conversion Failed',
                text: error.message || 'An unknown error occurred.',
                confirmButtonColor: '#ef4444',
                background: '#1e293b',
                color: '#fff'
            });
        }
    });

    /**
     * Reset Button Handler
     */
    resetBtn.addEventListener('click', () => {
        form.reset();
        // Reset file input manually
        fileInput.value = '';
        updateFileUI();

        // Check defaults
        document.querySelector('input[value="video"]').checked = true;
        populateFormats('video');

        resultArea.classList.add('hidden');
        form.classList.remove('hidden');
    });
});