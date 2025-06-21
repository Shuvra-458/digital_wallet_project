from fastapi import FastAPI
from database import Base, engine
from auth import router as auth_router
from wallet import router as wallet_router
from product import router as product_router

app = FastAPI()

app.include_router(product_router)
app.include_router(wallet_router)
Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
