const API_BASE_URL = "http://localhost:3001/api";

export const saveResultAPI = async (resultData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resultData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error saving result:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};
