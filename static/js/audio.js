/**
 * Configuration module for Audio formats.
 * Provides the accept attribute for file inputs and the list of supported output formats.
 */
export const audioConfig = {
    /** HTML accept attribute for file inputs */
    accept: "audio/*",

    /** List of supported audio formats for conversion */
    formats: [
        { value: 'mp3', label: 'MP3 (Standard)' },
        { value: 'wav', label: 'WAV (Lossless)' },
        { value: 'flac', label: 'FLAC (Lossless)' },
        { value: 'aac', label: 'AAC (Apple/Web)' },
        { value: 'ogg', label: 'OGG (Vorbis)' },
        { value: 'opus', label: 'OPUS (Streaming)' }
    ]
};