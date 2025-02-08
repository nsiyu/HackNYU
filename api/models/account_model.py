from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AccountInfo(BaseModel):
    _id: str
    type: str
    nickname: str
    rewards: int
    balance: int
    account_number: Optional[str]
    customer_id: str
