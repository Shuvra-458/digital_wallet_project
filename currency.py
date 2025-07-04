import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

def convert_inr_to(inr_amount: float, target_currency: str) -> float:
    url = f"https://api.currencyapi.com/v3/latest?apikey={API_KEY}&base_currency=INR&currencies={target_currency}"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception("Currency API failed")
    data = response.json()
    rate = data["data"][target_currency]["value"]
    return round(inr_amount * rate, 2)
