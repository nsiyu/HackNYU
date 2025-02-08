from pydantic import BaseModel
from typing import Optional


class UserInfo(BaseModel):
    user_id: Optional[int]  # Auto-incremented SERIAL, so it can be optional
    first_name: str
    last_name: str
    age: int
    gender: str
    income: float
    credit_score: int
    dependents: int
    pin: int


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    income: Optional[float] = None
    credit_score: Optional[int] = None
    dependents: Optional[int] = None
    pin: Optional[int] = None
