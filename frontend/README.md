# Digital Wallet Frontend

A clean and modern frontend for the Digital Wallet API built with plain HTML, CSS, and JavaScript.

## Features

- 🔐 User Authentication (Login/Register)
- 💰 Wallet Balance Display with Currency Conversion
- 💸 Fund Wallet
- 👥 Pay Other Users
- 🛒 Product Store (Add/Buy Products)
- 📊 Transaction History
- 📱 Responsive Design
- 🎨 Modern UI with Smooth Animations

## Setup

1. Simply open `index.html` in your web browser
2. The frontend connects to the live API at: `https://digital-wallet-backend-0uff.onrender.com`

## File Structure

```
frontend/
├── index.html      # Main HTML file
├── styles.css      # All CSS styles
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Usage

1. **Register**: Create a new account with username and password
2. **Login**: Sign in with your credentials
3. **Fund Wallet**: Add money to your wallet (in INR)
4. **View Balance**: Check balance in different currencies (INR, USD, EUR, GBP)
5. **Pay Users**: Send money to other registered users
6. **Products**: Add products to the store or buy existing products
7. **History**: View all your transactions

## API Integration

The frontend communicates with the FastAPI backend using:
- HTTP Basic Authentication
- RESTful API endpoints
- JSON data format
- Real-time currency conversion

## Browser Compatibility

Works on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Responsive Design

The interface adapts to different screen sizes:
- Desktop: Full layout with grid-based product display
- Tablet: Adjusted spacing and layout
- Mobile: Stacked layout with touch-friendly buttons