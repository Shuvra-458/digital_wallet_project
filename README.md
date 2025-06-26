# 💸 Digital Wallet API

A secure and fully-featured **digital wallet backend system** built with **FastAPI**, supporting user authentication, wallet funding, product purchases, payments, and real-time currency conversion(300 Requests).

[![Live API](https://img.shields.io/badge/Live%20API-Render-blue)](https://digital-wallet-backend-0uff.onrender.com/docs)

---

## 🔗 Live Demo

👉 **API Documentation (Swagger UI):**  
[https://digital-wallet-backend-0uff.onrender.com/docs](https://digital-wallet-backend-0uff.onrender.com/docs)

---

## ⚙️ Features

- ✅ User Registration & Authentication (HTTP Basic)
- 💰 Fund Wallet with INR
- 🔁 Real-time Currency Conversion (via currencyapi.com)
- 🛒 Purchase Products
- 💸 Transfer Money to Other Users
- 📄 Auto-generated API Docs with Swagger (`/docs`)

---

## 📦 Tech Stack

- **Backend**: FastAPI + Uvicorn
- **Database**: MySQL (Clever Cloud)
- **ORM**: SQLAlchemy
- **Auth**: HTTPBasic + Passlib
- **Currency API**: [currencyapi.com](https://currencyapi.com/)
- **Deployment**: Render

---

## 🛠️ Setup Locally

```bash
# Clone the repo
git clone https://github.com/Shuvra-458/digital-wallet-api.git
cd digital-wallet-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (DATABASE_URL, CURRENCY_API_KEY)

# Run the server
uvicorn main:app --reload
