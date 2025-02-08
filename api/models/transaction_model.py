from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TransactionInfo(BaseModel):
    id: int
    user_id: int
    account_number: int
    amount: float
    category: str
    created_at: Optional[datetime]
