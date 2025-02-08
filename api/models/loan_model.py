from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LoanInfo(BaseModel):
    _id: int
    type: str
    creation_date: str
    status: str
    credit_score: int
    monthly_payment: float
    amount: int
    description: Optional[str]
