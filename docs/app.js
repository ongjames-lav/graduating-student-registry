document.addEventListener('DOMContentLoaded', () => {
    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    function togglePasswordVisibility(button, input) {
        button.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon (you can add different icons for visibility states)
            button.classList.toggle('text-theme-orange');
        });
    }

    togglePasswordVisibility(togglePassword, passwordInput);
    togglePasswordVisibility(toggleConfirmPassword, confirmPasswordInput);

    // Form validation and submission
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic validation
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long!');
            return;
        }

        // Collect form data
        const formData = {
            lastName: document.getElementById('lastName').value,
            firstName: document.getElementById('firstName').value,
            middleInitial: document.getElementById('middleInitial').value,
            course: document.getElementById('course').value,
            year: document.getElementById('year').value,
            gender: document.getElementById('gender').value,
            email: document.getElementById('email').value,
            password: password,
            graduating: document.getElementById('graduating').checked
        };

        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                mode: 'cors',  // Explicitly set CORS mode
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);  // Debug log
            
            if (response.ok) {
                const result = await response.json();
                console.log('Registration successful:', result);  // Debug log
                showWelcomeModal(formData.firstName);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 5000); // Redirect after 5 seconds
            } else {
                const errorText = await response.text();
                console.error('Registration failed:', response.status, errorText);  // Debug log
                try {
                    const error = JSON.parse(errorText);
                    alert(error.detail || 'Registration failed. Please try again.');
                } catch {
                    alert('Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Network Error:', error);  // Debug log
            alert('An error occurred. Please try again later.');
        }
    });

    // Input validation
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('invalid', (e) => {
            e.preventDefault();
            input.classList.add('border-red-500');
        });

        input.addEventListener('input', () => {
            input.classList.remove('border-red-500');
        });
    });

    // Modal functions
    window.showWelcomeModal = (firstName) => {
        const modal = document.getElementById('welcomeModal');
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = `Congratulations ${firstName}! Your account has been created successfully. You will be redirected to the login page in a few seconds.`;
        
        modal.classList.add('show');
        createConfetti();
    };

    window.closeModal = () => {
        const modal = document.getElementById('welcomeModal');
        modal.classList.remove('show');
        window.location.href = 'login.html';
    };

    function createConfetti() {
        const colors = ['#ff7f00', '#ff4b00', '#ff9500', '#ff6b00', '#ff5500'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(confetti);

            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
});
