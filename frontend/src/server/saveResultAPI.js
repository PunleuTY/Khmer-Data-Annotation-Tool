import { loadProject } from "@/lib/storage";

const API_BASE_URL = "http://localhost:3001/api";
const BACKEND_PROJECT_URL = "http://127.0.0.1:5000/projects";

export const loadProjectAPI = async () => {
  try {
    const res = await fetch(BACKEND_PROJECT_URL);
    // if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.projects;
  } catch (e) {
    log(e.message);
  }
};

export const createProjectAPI = async (name) => {
  try {
    const res = await fetch(BACKEND_PROJECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    projects.push(data);
    currentProjectId = data.id;
    refreshProjects();
    projectNameInput.value = "";
  } catch (e) {
    alert("Failed to create project");
    log(e);
  }
};

export const saveResultAPI = async (resultData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    console.error("Error saving result:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
