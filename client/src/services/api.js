import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    signin: (data) => api.post('/auth/signin', data),
    getMe: () => api.get('/auth/me')
};

// Employee APIs
export const employeeAPI = {
    getProfile: () => api.get('/employees/profile'),
    updateProfile: (data) => api.put('/employees/profile', data),
    getAll: () => api.get('/employees'),
    getById: (id) => api.get(`/employees/${id}`),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`)
};

// Attendance APIs
export const attendanceAPI = {
    checkIn: () => api.post('/attendance/check-in'),
    checkOut: () => api.post('/attendance/check-out'),
    getMy: (params) => api.get('/attendance/my', { params }),
    getAll: (params) => api.get('/attendance/all', { params }),
    mark: (data) => api.post('/attendance/mark', data),
    update: (id, data) => api.put(`/attendance/${id}`, data)
};

// Leave APIs
export const leaveAPI = {
    apply: (data) => api.post('/leaves/apply', data),
    getMy: () => api.get('/leaves/my'),
    getAll: (params) => api.get('/leaves/all', { params }),
    approve: (id, comments) => api.put(`/leaves/${id}/approve`, { comments }),
    reject: (id, comments) => api.put(`/leaves/${id}/reject`, { comments }),
    cancel: (id) => api.delete(`/leaves/${id}`),
    getBalance: () => api.get('/leaves/balance')
};

export default api;
