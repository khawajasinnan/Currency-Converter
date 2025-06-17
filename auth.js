const BACKEND_URL = 'http://localhost:5000/api/auth'; // Make sure this matches your backend URL

// Helper function to show messages
function showMessage(elementId, message, isError = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        if (isError) {
            element.style.color = '#EF4444'; // Error color
        } else {
            element.style.color = '#10B981'; // Success color
        }
    }
}

// Helper for password strength check (basic)
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length > 7) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[^a-zA-Z0-9]+/)) strength++;

    if (strength < 3) return { text: 'Weak', color: '#EF4444' };
    if (strength < 5) return { text: 'Medium', color: '#F59E0B' };
    return { text: 'Strong', color: '#10B981' };
}

// Helper function for making authenticated requests
async function makeRequest(url, options = {}) {
    const token = localStorage.getItem('currentUserToken');
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };
    return fetch(url, { ...defaultOptions, ...options });
}

// --- Signup Page Logic ---
if (document.getElementById('signup-form')) {
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');
    const signupSuccess = document.getElementById('signup-success');
    const passwordInput = document.getElementById('signup-password');
    const passwordStrengthDiv = document.getElementById('password-strength');

    passwordInput.addEventListener('input', () => {
        const strength = checkPasswordStrength(passwordInput.value);
        passwordStrengthDiv.textContent = `Strength: ${strength.text}`;
        passwordStrengthDiv.style.color = strength.color;
        passwordStrengthDiv.style.display = 'block';
        if (passwordInput.value === '') {
            passwordStrengthDiv.style.display = 'none';
        }
    });

    signupForm.onsubmit = async function(e) {
        e.preventDefault();
        signupError.style.display = 'none';
        signupSuccess.style.display = 'none';

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) {
            showMessage('signup-error', 'Passwords do not match.');
            return;
        }
        if (checkPasswordStrength(password).text === 'Weak') {
            showMessage('signup-error', 'Password is too weak.');
            return;
        }

        try {
            const response = await makeRequest(`${BACKEND_URL}/signup`, {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage('signup-error', data.message || 'Signup failed.');
            } else {
                showMessage('signup-success', data.message + ' Redirecting to login...', false);
                setTimeout(() => {
                    window.location.replace('login.html');
                }, 3000);
            }
        } catch (error) {
            console.error('Signup Error:', error);
            showMessage('signup-error', 'An error occurred during signup.');
        }
    };
}

// --- Login Page Logic ---
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const resendLink = document.getElementById('resendVerificationLink');
    const emailInput = document.getElementById('login-email');

    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        loginError.style.display = 'none';

        const email = emailInput.value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const response = await makeRequest(`${BACKEND_URL}/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage('login-error', data.message || 'Login failed.');
            } else {
                // Store token and user info (for this example, in localStorage)
                localStorage.setItem('currentUserToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.replace('index.html'); // Redirect to main page
            }
        } catch (error) {
            console.error('Login Error:', error);
            showMessage('login-error', 'An error occurred during login.');
        }
    };

    if (resendLink && emailInput) {
        resendLink.addEventListener('click', async function(e) {
            e.preventDefault();
            loginError.style.display = 'none';

            const email = emailInput.value.trim();

            if (!email) {
                showMessage('login-error', 'Please enter your email to resend the verification link.');
                return;
            }

            try {
                const response = await makeRequest(`${BACKEND_URL}/resend-verification`, {
                    method: 'POST',
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    showMessage('login-error', data.message || 'Failed to resend verification email.');
                } else {
                    showMessage('login-error', data.message || 'Verification email sent. Check your inbox.', false);
                }
            } catch (error) {
                console.error('Resend Verification Email Error:', error);
                showMessage('login-error', 'An error occurred while resending the verification email.');
            }
        });
    }
}

// --- Email Verification Page Logic ---
if (document.getElementById('verification-message')) {
    const messageDiv = document.getElementById('verification-message');
    const errorDiv = document.getElementById('verification-error');
    const successDiv = document.getElementById('verification-success');
    const loginLink = document.getElementById('login-link');

    // Get token and email from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (token && email) {
        // Call backend verification endpoint
        fetch(`${BACKEND_URL}/verify?token=${token}&email=${email}`)
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    messageDiv.style.display = 'none';
                    showMessage('verification-success', data.message, false);
                    loginLink.style.display = 'block';
                } else {
                    messageDiv.style.display = 'none';
                    showMessage('verification-error', data.message || 'Verification failed.');
                }
            })
            .catch(error => {
                console.error('Verification Error:', error);
                messageDiv.style.display = 'none';
                showMessage('verification-error', 'An error occurred during verification.');
            });
    } else {
        messageDiv.style.display = 'none';
        showMessage('verification-error', 'Invalid verification link format.');
    }
}

// --- Request Password Reset Page Logic ---
if (document.getElementById('request-reset-form')) {
    const requestResetForm = document.getElementById('request-reset-form');
    const requestResetError = document.getElementById('request-reset-error');
    const requestResetSuccess = document.getElementById('request-reset-success');

    requestResetForm.onsubmit = async function(e) {
        e.preventDefault();
        requestResetError.style.display = 'none';
        requestResetSuccess.style.display = 'none';

        const email = document.getElementById('reset-email').value.trim();

        try {
            const response = await fetch(`${BACKEND_URL}/request-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage('request-reset-error', data.message || 'Request failed.');
            } else {
                showMessage('request-reset-success', data.message, false);
            }
        } catch (error) {
            console.error('Request Reset Error:', error);
            showMessage('request-reset-error', 'An error occurred.');
        }
    };
}

// --- Reset Password Page Logic ---
if (document.getElementById('reset-password-form')) {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const resetError = document.getElementById('reset-error');
    const resetSuccess = document.getElementById('reset-success');
    const resetLoginLink = document.getElementById('reset-login-link');
    const newPasswordInput = document.getElementById('new-password');
    const newPasswordStrengthDiv = document.getElementById('new-password-strength');

    newPasswordInput.addEventListener('input', () => {
        const strength = checkPasswordStrength(newPasswordInput.value);
        newPasswordStrengthDiv.textContent = `Strength: ${strength.text}`;
        newPasswordStrengthDiv.style.color = strength.color;
        newPasswordStrengthDiv.style.display = 'block';
        if (newPasswordInput.value === '') {
            newPasswordStrengthDiv.style.display = 'none';
        }
    });

    resetPasswordForm.onsubmit = async function(e) {
        e.preventDefault();
        resetError.style.display = 'none';
        resetSuccess.style.display = 'none';

        const newPassword = newPasswordInput.value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmNewPassword) {
            showMessage('reset-error', 'Passwords do not match.');
            return;
        }
        if (checkPasswordStrength(newPassword).text === 'Weak') {
            showMessage('reset-error', 'Password is too weak.');
            return;
        }

        // Get token and email from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (!token || !email) {
            showMessage('reset-error', 'Missing token or email in URL.');
            return;
        }

        try {
            const response = await makeRequest(`${BACKEND_URL}/reset`, {
                method: 'POST',
                body: JSON.stringify({ token, email, password: newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage('reset-error', data.message || 'Password reset failed.');
            } else {
                showMessage('reset-success', data.message, false);
                resetLoginLink.style.display = 'block';
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            showMessage('reset-error', 'An error occurred.');
        }
    };
}

// --- Auth Check for Protected Pages ---
document.addEventListener('DOMContentLoaded', function() {
    const protectedPages = ['index.html', 'chart.html', 'conversionHistory.html'];
    const currentPage = window.location.pathname.split('/').pop();

    const token = localStorage.getItem('currentUserToken');
    if (protectedPages.includes(currentPage) && !token) {
        window.location.replace('login.html');
    }
});

// --- Logout Function ---
function logout() {
    localStorage.removeItem('currentUserToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// --- Centralized Event Listener for Logout and Auth Check ---
document.addEventListener('DOMContentLoaded', function() {
    // Attach logout handler if button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});