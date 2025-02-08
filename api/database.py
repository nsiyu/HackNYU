from supabase import create_client, Client
from typing import List, Optional
import requests
import json
from .config import settings
from .models import AccountInfo, LoanInfo, TransactionInfo, CustomerInfo, AddressInfo

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

BASE_C1_URL = "api.nessieisreal.com"
# def get_user_loans(user_id: int) -> Optional[List[LoanInfo]]:
#     """Fetch all loans for a given user ID"""
#     response = (
#         supabase.table("loans")
#         .select("id", "user_id", "account_number", "amount", "requested_at")
#         .eq("user_id", user_id)
#         .execute()
#     )

#     if response.data:
#         return [
#             LoanInfo(**loan) for loan in response.data
#         ]  # Convert to LoanInfo objects

#     return None  # Return None if no loans are found


# def get_user_loans(user_id: int) -> Optional[List[LoanInfo]]:
#     """Fetch all loans for a given user ID"""
#     response = (
#         supabase.table("loan_info")
#         .select("id", "user_id", "account_number", "amount", "requested_at")
#         .eq("user_id", user_id)
#         .execute()
#     )

#     if response.data:
#         return [
#             LoanInfo(**loan) for loan in response.data
#         ]  # Convert to LoanInfo objects

#     return None  # Return None if no loans are found


def get_c1_account_transactions(account_id: str) -> Optional[List[TransactionInfo]]:
    url = f"{BASE_C1_URL}/accounts/{account_id}/purchases?key={settings.C1_KEY}"

    try:
        response = requests.get(url, headers={"Content-Type": "application/json"})
        response.raise_for_status()

        transactions_data = response.json()
        return [
            TransactionInfo(
                _id=t["_id"],
                type=t["type"],
                merchant_id=t["merchant_id"],
                payer_id=t["payer_id"],
                purchase_date=t["purchase_date"],
                amount=t["amount"],
                status=t["status"],
                medium=t["medium"],
                description=t["description"],
            )
            for t in transactions_data
        ]

    except requests.exceptions.RequestException as e:
        print(f"Error fetching transactions: {e}")
        return None


def get_c1_accounts(user_id: str) -> Optional[List[AccountInfo]]:
    url = f"{BASE_C1_URL}/customers/{user_id}/accounts?key={settings.C1_KEY}"

    try:
        response = requests.get(url, headers={"Content-Type": "application/json"})
        response.raise_for_status()

        account_data = response.json()
        return [
            AccountInfo(
                _id=a["_id"],
                type=a["type"],
                nickname=a["merchant_id"],
                rewards=a["rewards"],
                balance=a["balance"],
                account_number=a["account_number"],
                customer_id=a["customer_id"],
            )
            for a in account_data
        ]

    except requests.exceptions.RequestException as e:
        print(f"Error fetching accounts: {e}")
        return None


def get_c1_account_info(account_id: str) -> Optional[AccountInfo]:
    url = f"{BASE_C1_URL}/accounts/{account_id}?key={settings.C1_KEY}"
    try:
        response = requests.get(url, headers={"Content-Type": "application/json"})
        response.raise_for_status()

        a = response.json()
        return AccountInfo(
            _id=a["_id"],
            type=a["type"],
            nickname=a["merchant_id"],
            rewards=a["rewards"],
            balance=a["balance"],
            account_number=a["account_number"],
            customer_id=a["customer_id"],
        )

    except requests.exceptions.RequestException as e:
        print(f"Error fetching laons: {e}")
        return None


def get_c1_user_transactions(user_id: str) -> Optional[List[TransactionInfo]]:
    accounts = get_c1_accounts(user_id=user_id)
    if accounts is None:
        return None
    transactions = []
    for account in accounts:
        curr_account_transactions = get_c1_account_transactions(account_id=account._id)
        if curr_account_transactions is not None:
            transactions.extend(curr_account_transactions)
    return transactions


def get_c1_account_loans(account_id: str) -> Optional[List[LoanInfo]]:
    url = f"{BASE_C1_URL}/accounts/{account_id}/loans?key={settings.C1_KEY}"
    try:
        response = requests.get(url, headers={"Content-Type": "application/json"})
        response.raise_for_status()

        loan_data = response.json()
        return [
            LoanInfo(
                _id=l["_id"],
                type=l["type"],
                creation_date=l["creation_date"],
                status=l["status"],
                credit_score=l["credit_score"],
                monthly_payment=l["monthly_payment"],
                amount=l["amount"],
                description=l["description"],
            )
            for l in loan_data
        ]

    except requests.exceptions.RequestException as e:
        print(f"Error fetching laons: {e}")
        return None


def create_c1_transfer_account(
    account_id: str,
    medium: str,
    payee_id: str,
    amount: float,
    transaction_date: Optional[str],
    status: Optional[str],
    description: Optional[str],
):
    url = f"{BASE_C1_URL}/accounts/{account_id}/transfers?key={settings.C1_KEY}"
    payload = {
        "medium": medium,
        "payee_id": payee_id,
        "amount": amount,
        "status": status,
    }

    if transaction_date:
        payload["transaction_date"] = transaction_date
    if description:
        payload["description"] = description

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        response.raise_for_status()  # Raise error for non-201 responses

        return response.json()

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        try:
            error_response = response.json()
            return {
                "error": {
                    "code": error_response.get("code"),
                    "message": error_response.get("message"),
                    "fields": error_response.get("fields"),
                }
            }
        except json.JSONDecodeError:
            return {"error": {"message": "Unknown error occurred"}}

    except requests.exceptions.RequestException as req_err:
        print(f"Request error: {req_err}")
        return {"error": {"message": "Request failed"}}

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"error": {"message": "An unexpected error occurred"}}


def get_c1_customer(user_id: str) -> Optional[CustomerInfo]:
    url = f"{BASE_C1_URL}/customers/{user_id}?key={settings.C1_KEY}"
    try:
        response = requests.get(url, headers={"Content-Type": "application/json"})
        response.raise_for_status()

        customer_data = response.json()
        return CustomerInfo(
            _id=customer_data["_id"],
            first_name=customer_data["first_name"],
            last_name=customer_data["last_name"],
            address=AddressInfo(
                street_number=customer_data["address"]["street_number"],
                street_name=customer_data["address"]["street_name"],
                city=customer_data["address"]["city"],
                state=customer_data["address"]["state"],
                zip=customer_data["address"]["zip"],
            ),
        )

    except requests.exceptions.RequestException as e:
        print(f"Error fetching Customer: {e}")
        return None
