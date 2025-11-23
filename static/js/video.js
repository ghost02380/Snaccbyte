/**
 * Configuration module for Video formats.
 * Provides the accept attribute for file inputs and the list of supported output formats.
 */
export const videoConfig = {
    /** HTML accept attribute for file inputs */
    accept: "video/*",

    /** List of supported video formats for conversion */
    formats: [
        { value: 'mp4', label: 'MP4 (Universal)' },
        { value: 'mkv', label: 'MKV (High Quality)' },
        { value: 'avi', label: 'AVI (Legacy)' },
        { value: 'mov', label: 'MOV (Apple)' },
        { value: 'webm', label: 'WEBM (Web)' },
        { value: 'gif', label: 'GIF (Animated)' }
    ]
};