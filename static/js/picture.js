/**
 * Configuration module for Picture/Image formats.
 * Provides the accept attribute for file inputs and the list of supported output formats.
 */
export const pictureConfig = {
    /** HTML accept attribute for file inputs */
    accept: "image/*",

    /** List of supported image formats for conversion */
    formats: [
        { value: 'png', label: 'PNG (Transparent)' },
        { value: 'jpg', label: 'JPG (Small Size)' },
        { value: 'webp', label: 'WEBP (Modern Web)' },
        { value: 'gif', label: 'GIF (Animated)' },
        { value: 'ico', label: 'ICO (Favicon)' },
        { value: 'bmp', label: 'BMP (Bitmap)' },
        { value: 'tiff', label: 'TIFF (Print)' }
    ]
};