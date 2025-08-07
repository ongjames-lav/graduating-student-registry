const config = {
    development: {
        apiUrl: 'http://localhost:8000',
        baseUrl: ''
    },
    production: {
        apiUrl: 'https://graduating-student-registry.onrender.com',
        baseUrl: '/membership-registry'
    }
};

// Check if we're running on GitHub Pages
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const currentConfig = isProduction ? config.production : config.development;

export default currentConfig;
