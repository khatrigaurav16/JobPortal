const API_BASE = '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    
    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    
    getMe: () => apiCall('/auth/me'),
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
};

// Jobs API
const jobsAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/jobs${query ? '?' + query : ''}`);
    },
    
    getOne: (id) => apiCall(`/jobs/${id}`),
    
    getMyJobs: () => apiCall('/jobs/my-jobs'),
    
    create: (jobData) => apiCall('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
    }),
    
    update: (id, jobData) => apiCall(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData)
    }),
    
    delete: (id) => apiCall(`/jobs/${id}`, {
        method: 'DELETE'
    }),
    
    getApplicants: (jobId) => apiCall(`/jobs/${jobId}/applicants`)
};

// Applications API
const applicationsAPI = {
    apply: (jobId) => apiCall('/applications', {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId })
    }),
    
    getMy: () => apiCall('/applications'),
    
    withdraw: (id) => apiCall(`/applications/${id}`, {
        method: 'DELETE'
    }),
    
    getAll: () => apiCall('/applications/all'),
    
    updateStatus: (id, status) => apiCall(`/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    }),
    
    checkStatus: (jobId) => apiCall(`/applications/check/${jobId}`)
};

// Profile API
const profileAPI = {
    getStudent: () => apiCall('/profile/student'),
    
    updateStudent: (data) => apiCall('/profile/student', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    uploadResume: async (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch(`${API_BASE}/profile/student/resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        return response.json();
    },
    
    getRecruiter: () => apiCall('/profile/recruiter'),
    
    updateRecruiter: (data) => apiCall('/profile/recruiter', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    getSavedJobs: () => apiCall('/profile/saved-jobs'),
    
    saveJob: (jobId) => apiCall('/profile/saved-jobs', {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId })
    }),
    
    unsaveJob: (jobId) => apiCall(`/profile/saved-jobs/${jobId}`, {
        method: 'DELETE'
    }),
    
    getStats: () => apiCall('/profile/stats')
};

// Helper to check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = 'toast ' + type;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    } else {
        alert(message);
    }
}
