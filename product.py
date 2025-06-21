from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Product, User, Transaction
from auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------- SCHEMAS --------

class ProductCreate(BaseModel):
    name: str
    price: float
    description: str

class BuyRequest(BaseModel):
    product_id: int

# -------- ADD PRODUCT --------

@router.post("/product")
def add_product(prod: ProductCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if prod.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be positive")
    new_product = Product(name=prod.name, price=prod.price, description=prod.description)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Product added", "product_id": new_product.id}

# -------- LIST PRODUCTS --------

@router.get("/product")
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [{
        "id": p.id,
        "name": p.name,
        "price": p.price,
        "description": p.description
    } for p in products]

# -------- BUY PRODUCT --------

@router.post("/buy")
def buy_product(data: BuyRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if user.balance < product.price:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    user = db.merge(user)
    user.balance -= product.price
    txn = Transaction(kind="debit", amount=product.price, updated_bal=user.balance, owner=user)
    db.add(txn)
    db.commit()
    return {
        "message": f"Product '{product.name}' purchased successfully",
        "new_balance": user.balance
    }
