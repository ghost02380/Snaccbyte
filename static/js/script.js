document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('convertForm');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    const dropZone = document.getElementById('dropZone');
    const convertBtn = document.getElementById('convertBtn');

    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const downloadLink = document.getElementById('downloadLink');
    const resetBtn = document.getElementById('resetBtn');
    const errorMsg = document.querySelector('.error-msg');

    /**
     * Updates the UI to show the selected filename.
     */
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    /**
     * Adds visual feedback for drag and drop events.
     */
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            // Trigger change event manually
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });

    /**
     * Handles the form submission via Fetch API.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (fileInput.files.length === 0) {
            showError("Please select a file first.");
            return;
        }

        // UI State: Converting
        form.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        resultDiv.classList.add('hidden');

        const formData = new FormData(form);

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Conversion failed.");
            }

            // Get the filename from the Content-Disposition header if possible
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = "converted_file";
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            // Convert response to Blob for download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // UI State: Success
            loadingDiv.classList.add('hidden');
            resultDiv.classList.remove('hidden');

            downloadLink.href = url;
            downloadLink.download = filename;

        } catch (error) {
            showError(error.message);
            form.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
        }
    });

    /**
     * Resets the UI to allow a new conversion.
     */
    resetBtn.addEventListener('click', () => {
        form.reset();
        fileNameDisplay.textContent = '';
        resultDiv.classList.add('hidden');
        form.classList.remove('hidden');
    });

    /**
     * Helper function to display error messages.
     * @param {string} message - The error message to display.
     */
    function showError(message) {
        errorMsg.textContent = message;
        errorDiv.classList.remove('hidden');
    }
});