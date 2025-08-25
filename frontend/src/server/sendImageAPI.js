import axios from 'axios';

const API_BASE_URL = "http://localhost:3001/api";

export const sendImagesToBackend = async (images, endpoint = '/upload-images', additionalData = {}) => {
    try {
        // Validate images
        if (!images || images.length === 0) {
            throw new Error('No images provided');
        }

        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const invalidFiles = images.filter(file => !allowedTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            throw new Error('Only JPG and PNG images are allowed');
        }

        // Create FormData
        const formData = new FormData();
        
        // Append images
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        // Append additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        // Send request
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending images:', error);
        throw error;
    }
};
