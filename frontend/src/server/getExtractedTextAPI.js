const API_BASE_URL ="http://localhost:3001/api";

export const getExtractedText = async (fileId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/extracted-text/${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching extracted text:', error);
        throw error;
    }
};