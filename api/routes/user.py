from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ..database import (
    supabase,
    get_c1_accounts,
    get_c1_account_loans,
    get_c1_user_transactions,
    get_c1_account_info,
)
from ..config import logger
from ..models import AccountInfo

router = APIRouter()


class UserAuthRequest(BaseModel):
    user_id: int


@router.get("/account/{account_id}", response_model=AccountInfo)
async def get_account_info(account_id: str):
    """Fetch user account details for a specific account"""
    account_info = get_c1_account_info(account_id=account_id)

    if account_info:
        return account_info

    raise HTTPException(status_code=404, detail="Account not found")


@router.get("/accounts/{user_id}", response_model=dict)
async def get_user_accounts(user_id: int):
    """Fetch all accounts associated with a user"""
    accounts = get_c1_account_info(user_id=user_id)

    if accounts:
        return {"user_id": user_id, "accounts": accounts}

    raise HTTPException(status_code=404, detail="No accounts found for this user")


@router.get("/loans/{account_id}", response_model=dict)
async def get_account_loans(account_id: str):
    """Fetch all loans for a specific account"""
    loans = get_c1_account_loans(account_id=account_id)
    if loans:
        # Convert to LoanInfo models
        return {
            "account_id": account_id,
            "loans": loans,
        }

    raise HTTPException(status_code=404, detail="No loans found for this account")


@router.get("/transactions/{user_id}", response_model=dict)
async def get_transaction_history(user_id: int):
    """Fetch transaction history for a specific account"""
    transactions = get_c1_user_transactions(user_id)
    if transactions:
        return {
            "user_id": user_id,
            "transactions": transactions,
        }

    raise HTTPException(
        status_code=404, detail="No transactions found for this account"
    )
