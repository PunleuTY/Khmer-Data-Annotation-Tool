import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const annotationApi = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/annotations`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting annotation:", error);
    throw error;
  }
};
