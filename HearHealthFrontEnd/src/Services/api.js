import axios from 'axios';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to connect to localhost on the host machine
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


