import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api/auth' // Ensure no extra slashes
});

export default API;