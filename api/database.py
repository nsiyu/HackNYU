from supabase import create_client, Client
from typing import List, Optional
from .config import settings
from .models import AccountInfo, LoanInfo, TransactionInfo, UserInfo

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_user_loans(user_id: int) -> Optional[List[LoanInfo]]:
    """Fetch all loans for a given user ID"""
    response = (
        supabase.table("loans")
        .select("id", "user_id", "account_number", "amount", "requested_at")
        .eq("user_id", user_id)
        .execute()
    )

    if response.data:
        return [
            LoanInfo(**loan) for loan in response.data
        ]  # Convert to LoanInfo objects

    return None  # Return None if no loans are found


def get_user_transactions(user_id: int) -> Optional[List[TransactionInfo]]:
    """Fetch all transactions for a given user ID across all their accounts"""
    response = (
        supabase.table("transactions")
        .select("id", "user_id", "account_number", "amount", "category", "created_at")
        .eq("user_id", user_id)
        .execute()
    )

    if response.data:
        return [
            TransactionInfo(**txn) for txn in response.data
        ]  # Convert to TransactionInfo objects

    return None  # Return None if no transactions are found


def get_user_accounts(user_id: int) -> Optional[List[AccountInfo]]:
    """Fetch all accounts associated with a given user ID"""
    response = (
        supabase.table("accounts")
        .select("user_id", "account_number", "balance", "created_at")
        .eq("user_id", user_id)
        .execute()
    )

    if response.data:
        return [
            AccountInfo(**account) for account in response.data
        ]  # Convert to AccountInfo objects

    return None  # Return None if no accounts are found


def get_user_info(user_id: int) -> Optional[UserInfo]:
    """Fetch user details for a given user ID"""
    response = (
        supabase.table("users")
        .select(
            "user_id",
            "first_name",
            "last_name",
            "age",
            "gender",
            "income",
            "credit_score",
            "dependents",
            "pin",
        )
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if response.data:
        return UserInfo(**response.data)  # Convert to UserInfo object

    return None  # Return None if user is not found
