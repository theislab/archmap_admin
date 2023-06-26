import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_ADDRESS, // Replace with your desired base URL
});

export const axiosInstanceWithAuth = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_ADDRESS, // Replace with your desired base URL
});

axiosInstanceWithAuth.interceptors.request.use(
  (config) => {
    console.log(localStorage.getItem("auth"));
    const authData = JSON.parse(localStorage.getItem("auth") || "{}");
    const token = authData.jwttoken;
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `JWT ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
