import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const requireHeader = config?.requireheader;

    if (requireHeader === false) {
      config.headers["Content-Type"] = "application/json";
      return config;
    }

    config.headers["Client-App-Key"] = process.env.REACT_APP_API_KEY;
    config.headers["Client-App-Type"] = process.env.REACT_APP_API_TYPE;
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

