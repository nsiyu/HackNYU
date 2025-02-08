from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TransactionInfo(BaseModel):
    _id: str
    type: str
    merchant_id: str
    payer_id: str
    purchase_date: str
    amount: int
    status: str
    medium: str
    description: str
