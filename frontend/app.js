// API URL - change this to your deployed backend URL when deploying
const API_URL = 'http://localhost:8000';

// Helper function to handle API errors
const handleError = (error) => {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
};

// Handle registration form submission
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            last_name: document.getElementById('lastName').value,
            first_name: document.getElementById('firstName').value,
            middle_initial: document.getElementById('middleInitial').value,
            course: document.getElementById('course').value,
            year: parseInt(document.getElementById('year').value),
            graduating: document.getElementById('graduating').checked,
            gender: document.getElementById('gender').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = 'login.html';
            } else {
                const data = await response.json();
                alert(data.detail || 'Registration failed');
            }
        } catch (error) {
            handleError(error);
        }
    });
}

// Handle login form submission
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new URLSearchParams();
        formData.append('username', document.getElementById('email').value);
        formData.append('password', document.getElementById('password').value);

        try {
            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                // Fetch user details to check if admin
                const userResponse = await fetch(`${API_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`
                    }
                });
                
                if (userResponse.ok) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                alert(data.detail || 'Login failed');
            }
        } catch (error) {
            handleError(error);
        }
    });
}

// Handle admin dashboard
if (document.getElementById('usersTable')) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }

    // Fetch and display users
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const users = await response.json();
                const tableBody = document.getElementById('usersTable');
                tableBody.innerHTML = '';

                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${user.last_name}, ${user.first_name} ${user.middle_initial || ''}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${user.course}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${user.year}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.graduating ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                ${user.graduating ? 'Graduating' : 'Enrolled'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${user.email}
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    alert(data.detail || 'Failed to fetch users');
                }
            }
        } catch (error) {
            handleError(error);
        }
    };

    // Load users when page loads
    fetchUsers();

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}
