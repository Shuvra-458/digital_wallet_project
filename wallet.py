from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Transaction
from auth import get_current_user
from datetime import datetime
from currency import convert_inr_to
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- SCHEMAS ----------

class FundRequest(BaseModel):
    amount: float

class PayRequest(BaseModel):
    to: str
    amt: float

# ---------- FUND ----------

@router.post("/fund")
def fund_wallet(fund: FundRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if fund.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    user = db.merge(user)
    user.balance += fund.amount
    txn = Transaction(kind="credit", amount=fund.amount, updated_bal=user.balance, user_id=user.id)
    db.add(txn)
    db.commit()
    db.refresh(user)
    return {"message": "Wallet funded", "new_balance": user.balance}

# ---------- PAY ----------

@router.post("/pay")
def pay_user(data: PayRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    recipient = db.query(User).filter(User.username == data.to).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    if data.amt <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if user.balance < data.amt:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Deduct from sender
    user = db.merge(user)
    user.balance -= data.amt
    txn1 = Transaction(kind="debit", amount=data.amt, updated_bal=user.balance, owner=user)
    
    # Add to receiver
    user = db.merge(user)
    recipient.balance += data.amt
    txn2 = Transaction(kind="credit", amount=data.amt, updated_bal=recipient.balance, owner=recipient)
    
    db.add_all([txn1, txn2])
    db.commit()
    return {"message": f"Transferred ₹{data.amt} to {data.to}", "your_balance": user.balance}

# ---------- BALANCE ----------

@router.get("/bal")
def check_balance(currency: str = "INR", db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user = db.merge(user)
    if currency.upper() == "INR":
        return {"balance": f"₹{user.balance:.2f}"}
    else:
        converted = convert_inr_to(user.balance, currency.upper())
        return {"balance": f"{converted:.2f} {currency.upper()}"}

# ---------- STATEMENT ----------

@router.get("/stmt")
def get_statement(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    txns = db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.timestamp.desc()).all()
    return [{
        "kind": txn.kind,
        "amt": txn.amount,
        "updated_bal": txn.updated_bal,
        "timestamp": txn.timestamp.isoformat()
    } for txn in txns]
