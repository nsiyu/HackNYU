from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AccountInfo(BaseModel):
    user_id: int  # Foreign key reference to users
    account_number: int  # Unique account number (BIGINT)
    balance: float  # Account balance
    created_at: Optional[datetime]  # Timestamp when the account was created
