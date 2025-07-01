// API Configuration
const API_BASE_URL = 'https://digital-wallet-backend-0uff.onrender.com';

// Global state
let currentUser = null;
let currentBalance = 0;
let currentCurrency = 'INR';

// Utility Functions
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getAuthHeaders() {
    if (!currentUser) return {};
    
    const credentials = btoa(`${currentUser.username}:${currentUser.password}`);
    return {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
    };
}

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        showLoading();

        // Default headers
        const defaultHeaders = getAuthHeaders();

        // If the method is POST or PUT and no Content-Type is set, default to JSON
        if (options.method === 'POST' || options.method === 'PUT') {
            if (!options.headers) options.headers = {};
            if (!options.headers['Content-Type']) {
                options.headers['Content-Type'] = 'application/json';
            }
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        // If response is not JSON (e.g., empty response on 204 No Content), skip JSON parsing
        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.detail || 'API request failed');
        }

        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}


// Auth Functions
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // Test credentials by trying to get balance
        currentUser = { username, password };
        await apiCall('/bal');
        
        // If successful, show dashboard
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        document.getElementById('username-display').textContent = username;
        
        // Load initial data
        await refreshBalance();
        await loadProducts();
        await loadTransactions();
        
        showToast('Login successful!');
    } catch (error) {
        currentUser = null;
        showToast('Invalid credentials', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    try {
        await apiCall('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        showToast('Registration successful! Please login.');
        showLogin();
        
        // Clear form
        document.getElementById('register-form').reset();
    } catch (error) {
        // Error already shown by apiCall
    }
}

function logout() {
    currentUser = null;
    currentBalance = 0;
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    
    // Clear forms
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    
    showToast('Logged out successfully');
}

// Dashboard Functions
function showTab(tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.action-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab pane
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to selected tab
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'products') {
        loadProducts();
    } else if (tabName === 'history') {
        loadTransactions();
    }
}

async function refreshBalance() {
    try {
        const data = await apiCall(`/bal?currency=${currentCurrency}`);
        document.getElementById('balance-display').textContent = data.balance;
    } catch (error) {
        // Error already shown by apiCall
    }
}

async function updateBalance() {
    currentCurrency = document.getElementById('currency-select').value;
    await refreshBalance();
}

// Wallet Functions
async function handleFund(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('fund-amount').value);
    
    try {
        const data = await apiCall('/fund', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
        
        showToast(`Wallet funded successfully! New balance: ₹${data.new_balance}`);
        await refreshBalance();
        document.getElementById('fund-amount').value = '';
    } catch (error) {
        // Error already shown by apiCall
    }
}

async function handlePay(event) {
    event.preventDefault();
    
    const to = document.getElementById('pay-username').value;
    const amt = parseFloat(document.getElementById('pay-amount').value);
    
    try {
        const data = await apiCall('/pay', {
            method: 'POST',
            body: JSON.stringify({ to, amt })
        });
        
        showToast(data.message);
        await refreshBalance();
        document.getElementById('pay-username').value = '';
        document.getElementById('pay-amount').value = '';
    } catch (error) {
        // Error already shown by apiCall
    }
}

// Product Functions
function showAddProduct() {
    document.getElementById('add-product-form').classList.remove('hidden');
}

function hideAddProduct() {
    document.getElementById('add-product-form').classList.add('hidden');
    document.getElementById('add-product-form').querySelector('form').reset();
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    
    try {
        await apiCall('/product', {
            method: 'POST',
            body: JSON.stringify({ name, price, description })
        });
        
        showToast('Product added successfully!');
        hideAddProduct();
        await loadProducts();
    } catch (error) {
        // Error already shown by apiCall
    }
}

async function loadProducts() {
    try {
        const products = await apiCall('/product');
        const productsContainer = document.getElementById('products-list');
        
        if (products.length === 0) {
            productsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">No products available</p>';
            return;
        }
        
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price.toFixed(2)}</div>
                <div class="product-description">${product.description}</div>
                <button class="btn btn-primary" onclick="buyProduct(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Buy Now
                </button>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('products-list').innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Failed to load products</p>';
    }
}

async function buyProduct(productId) {
    try {
        const data = await apiCall('/buy', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId })
        });
        
        showToast(data.message);
        await refreshBalance();
        await loadTransactions();
    } catch (error) {
        // Error already shown by apiCall
    }
}

// Transaction Functions
async function loadTransactions() {
    try {
        const transactions = await apiCall('/stmt');
        const transactionsContainer = document.getElementById('transactions-list');
        
        if (transactions.length === 0) {
            transactionsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">No transactions found</p>';
            return;
        }
        
        transactionsContainer.innerHTML = transactions.map(txn => {
            const isCredit = txn.kind === 'credit';
            const icon = isCredit ? 'fa-plus' : 'fa-minus';
            const sign = isCredit ? '+' : '-';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-icon ${txn.kind}">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${txn.kind.charAt(0).toUpperCase() + txn.kind.slice(1)}</h4>
                            <p>${new Date(txn.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="transaction-amount ${txn.kind}">
                        ${sign}₹${txn.amt.toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('transactions-list').innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Failed to load transactions</p>';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set up tab click handlers
    document.querySelectorAll('.action-tab').forEach((tab, index) => {
        tab.addEventListener('click', function() {
            const tabNames = ['fund', 'pay', 'products', 'history'];
            showTab(tabNames[index]);
        });
    });
    
    // Show login form by default
    showLogin();
});
