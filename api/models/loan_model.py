from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LoanInfo(BaseModel):
    id: int
    user_id: int
    account_number: int
    amount: float
    requested_at: Optional[datetime]
