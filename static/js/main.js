import { videoConfig } from './video.js';
import { audioConfig } from './audio.js';
import { pictureConfig } from './picture.js';

/**
 * Main Controller for Snaccbyte.
 * Handles DOM manipulation, Event Listeners, and API communication.
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements references
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

    /**
     * Aggregate configuration object for easy access based on type keys.
     */
    const strategies = {
        video: videoConfig,
        audio: audioConfig,
        image: pictureConfig // Maps 'image' radio value to pictureConfig
    };

    /**
     * Updates the UI based on the selected media type.
     * Populates the format dropdown and updates file input constraints.
     *
     * @param {string} type - The media type ('video', 'audio', or 'image').
     */
    function setMediaType(type) {
        formatSelect.innerHTML = '';
        const config = strategies[type];

        if (!config) {
            console.error(`No configuration found for type: ${type}`);
            return;
        }

        // Populate dropdown options
        config.formats.forEach(fmt => {
            const option = document.createElement('option');
            option.value = fmt.value;
            option.textContent = fmt.label;
            formatSelect.appendChild(option);
        });

        // Update file input filter
        fileInput.setAttribute('accept', config.accept);
    }

    /**
     * Toggles the UI between "Empty" and "File Selected" states.
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

    // --- Event Listeners ---

    // Media Type Switching
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            setMediaType(e.target.value);
        });
    });

    // Initialize with the default checked radio button
    const initialType = document.querySelector('input[name="type"]:checked').value;
    setMediaType(initialType);

    // Drag and Drop Interactions
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

    // File Input Change
    fileInput.addEventListener('change', updateFileUI);

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (fileInput.files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No File Selected',
                text: 'Please upload a file to continue.',
                confirmButtonColor: '#4f46e5',
                background: '#1e293b',
                color: '#fff'
            });
            return;
        }

        // Transition to Loading State
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

            // Extract filename from Content-Disposition header
            const disposition = response.headers.get('Content-Disposition');
            let filename = "snaccbyte_converted." + formatSelect.value;

            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            // Create Blob URL for download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Update Download Link
            downloadLink.href = url;
            downloadLink.download = filename;

            // Transition to Result State
            loadingArea.classList.add('hidden');
            loadingArea.classList.remove('flex');
            resultArea.classList.remove('hidden');

        } catch (error) {
            // Handle Errors and reset UI
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

    // Reset Application State
    resetBtn.addEventListener('click', () => {
        form.reset();
        fileInput.value = '';
        updateFileUI();

        // Reset UI to Video default
        const videoRadio = document.querySelector('input[value="video"]');
        if(videoRadio) {
            videoRadio.checked = true;
            setMediaType('video');
        }

        resultArea.classList.add('hidden');
        form.classList.remove('hidden');
    });
});