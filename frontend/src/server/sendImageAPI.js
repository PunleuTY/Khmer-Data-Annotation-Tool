// import axios from 'axios';

import { file } from "jszip";

// const API_BASE_URL = "http://localhost:3001/api";
const BACKEND_UPLOAD_URL = "http://127.0.0.1:8000/images/";

// export const sendImagesToBackend = async (images, endpoint = '/upload-images', additionalData = {}) => {
//     try {
//         // Validate images
//         if (!images || images.length === 0) {
//             throw new Error('No images provided');
//         }

//         // Validate file types
//         const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//         const invalidFiles = images.filter(file => !allowedTypes.includes(file.type));

//         if (invalidFiles.length > 0) {
//             throw new Error('Only JPG and PNG images are allowed');
//         }

//         // Create FormData
//         const formData = new FormData();

//         // Append images
//         images.forEach((image, index) => {
//             formData.append('images', image);
//         });

//         // Append additional data
//         Object.keys(additionalData).forEach(key => {
//             formData.append(key, additionalData[key]);
//         });

//         // Send request
//         const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error sending images:', error);
//         throw error;
//     }
// };

// src/api/uploadAPI.js

// export const uploadFormData = async (url, payload = {}) => {
//   const formData = new FormData();

//   Object.entries(payload).forEach(([key, value]) => {
//     if (Array.isArray(value)) {
//       value.forEach((item) => {
//         formData.append(
//           key,
//           item instanceof Blob ? item : JSON.stringify(item)
//         );
//       });
//     } else if (value instanceof Blob) {
//       formData.append(key, value);
//     } else if (typeof value === "object") {
//       formData.append(key, JSON.stringify(value));
//     } else if (value !== undefined && value !== null) {
//       formData.append(key, value);
//     }
//   });

//   const res = await fetch(url, {
//     method: "POST",
//     body: formData,
//   });

//   if (!res.ok) {
//     throw new Error(`Request failed: ${res.statusText}`);
//   }

//   return await res.json();
// };

// // Specialized for images + annotations
// export const uploadImages = async (projectId, files, annotations = []) => {
//   return await uploadFormData(BACKEND_UPLOAD_URL, {
//     project_id: projectId,
//     images: files,
//     annotations: annotations,
//   });
// };

export const uploadImages = async (projectId, files, annotations) => {
  if (!files || files.length === 0) return null;

  const formData = new FormData();
  formData.append("project_id", projectId);

  console.log("upload to project", files, projectId);

  formData.append("image", files[0]);

  // ✅ Add annotation points (convert array/object → JSON string)
  formData.append("annotations", JSON.stringify(annotations));
  console.log("data annotation go to", annotations);

  const res = await fetch("http://127.0.0.1:8000/images/", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload images");
  }

  return await res.json();
};
