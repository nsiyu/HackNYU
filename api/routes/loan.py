from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import joblib
import numpy as np
import os
from ..config import logger
from ..database import (
    supabase,
    get_user_accounts,
    get_user_info,
    get_user_loans,
    get_user_transactions,
)

router = APIRouter()

# Initialize loan_model as None
loan_model = None
model_path = os.path.join(os.getcwd(), "ml/loan_model.pkl")

try:
    if os.path.exists(model_path):
        loan_model = joblib.load(model_path)
        logger.info("Loan model loaded successfully.")
    else:
        logger.warning(
            f"loan_model.pkl not found at {model_path}. Loan approval functionality will be limited."
        )
except Exception as e:
    logger.error(f"Error loading loan model: {str(e)}")
    loan_model = None


class LoanApplicationModel(BaseModel):
    user_id: int
    total_debt: float
    avg_monthly_spending: float
    total_balance: float
    income: float
    age: int
    gender: str
    credit_score: int
    dependents: int


class LoanApplicationResponse(BaseModel):
    user_id: int
    approved_amount: float
    deposited_to: int
    message: str


class LoadApplicationRequest(BaseModel):
    user_id: int
    account_number: int


@router.post(
    "/submit_loan_application",
    response_model=LoanApplicationResponse,
)
async def submit_loan_application(request: Request):
    """Process a loan application, determine approval amount, and deposit to an account"""
    # 0. Get data the retell way (according to WEIHO)
    body = await request.json()
    args = body.get("args, {}")
    logger.debug(f"Args: {args}")

    loan_data = LoadApplicationRequest(
        user_id=args.get("user_id"), pin=args.get("account_number")
    )
    logger.debug(
        f"user id: {loan_data.user_id} -- account number {loan_data.account_number}"
    )
    user_id = loan_data.user_id
    account_number = loan_data.account_number

    # 1. Get user financial info for loan processing
    user_loan_data = calculate_user_loan_info(user_id)
    if not user_loan_data:
        raise HTTPException(
            status_code=404,
            detail="User not found or insufficient data for loan evaluation",
        )

    # 2. Prepare features for the Random Forest model
    features = np.array(
        [
            user_loan_data.total_debt,
            user_loan_data.avg_monthly_spending,
            user_loan_data.total_balance,
            user_loan_data.income,
            user_loan_data.age,
            user_loan_data.credit_score,
            user_loan_data.dependents,
        ]
    ).reshape(1, -1)

    # 3. Predict loan eligibility amount
    approved_loan_amount = loan_model.predict(features)[0]  # Extract single prediction
    approved_loan_amount = max(0, round(approved_loan_amount, 2))

    if approved_loan_amount == 0:
        raise HTTPException(
            status_code=400,
            detail="Loan application denied due to financial evaluation",
        )

    # 4. Add the approved loan to the database
    loan_response = (
        supabase.table("loans")
        .insert(
            {
                "user_id": user_id,
                "account_number": account_number,
                "amount": approved_loan_amount,
            }
        )
        .execute()
    )

    if loan_response.error:
        raise HTTPException(status_code=400, detail="Loan application failed")

    # 5. Deposit loan amount into the specified account
    account_update_response = (
        supabase.table("accounts")
        .update({"balance": supabase.func("balance +", approved_loan_amount)})
        .eq("user_id", user_id)
        .eq("account_number", account_number)
        .execute()
    )

    if account_update_response.error:
        raise HTTPException(
            status_code=400, detail="Failed to deposit loan into account"
        )

    # 6. Return response with approved loan details
    return LoanApplicationResponse(
        user_id=user_id,
        approved_amount=approved_loan_amount,
        deposited_to=account_number,
        message=f"Loan approved for ${approved_loan_amount} and deposited into account {account_number}.",
    )


def calculate_user_loan_info(user_id: int) -> Optional[LoanApplicationModel]:
    """Calculate loan-related metrics for a user"""

    # 1. Get all user loans and sum total debt
    user_loans = get_user_loans(user_id)
    total_debt = sum(loan.amount for loan in user_loans) if user_loans else 0.0

    # 2. Get all transactions and compute average monthly spending
    user_transactions = get_user_transactions(user_id)
    if user_transactions:
        now = datetime.now()
        one_year_ago = now - timedelta(days=365)

        # Filter transactions from the last 12 months
        last_year_transactions = [
            txn for txn in user_transactions if txn.created_at >= one_year_ago
        ]

        if last_year_transactions:
            total_spent = sum(
                abs(txn.amount) for txn in last_year_transactions if txn.amount < 0
            )  # Only expenses
            avg_monthly_spending = total_spent / 12
        else:
            avg_monthly_spending = 0.0
    else:
        avg_monthly_spending = 0.0

    # 3. Get all accounts and calculate total balance
    user_accounts = get_user_accounts(user_id)
    total_balance = (
        sum(account.balance for account in user_accounts) if user_accounts else 0.0
    )

    # 4. Get user personal details
    user_info = get_user_info(user_id)
    if not user_info:
        return None  # User not found

    # 5. Create LoanModel object
    return LoanApplicationModel(
        user_id=user_id,
        total_debt=total_debt,
        avg_monthly_spending=avg_monthly_spending,
        total_balance=total_balance,
        income=user_info.income,
        age=user_info.age,
        gender=user_info.gender,
        credit_score=user_info.credit_score,
        dependents=user_info.dependents,
    )
