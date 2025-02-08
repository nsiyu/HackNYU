from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ..database import supabase
from ..config import logger
from ..models import UserInfo, AccountInfo, LoanInfo, TransactionInfo, UserUpdate

router = APIRouter()


class UserAuthRequest(BaseModel):
    user_id: int
    pin: int


@router.post("/auth")
async def authenticate(request: Request):
    try:
        logger.debug(f"user/auth request")
        body = await request.json()
        args = body.get("args", {})
        logger.debug(f"Args: {args}")

        auth_data = UserAuthRequest(user_id=args.get("user_id"), pin=args.get("pin"))
        logger.debug(f"user id: {auth_data.user_id} -- pin {auth_data.pin}")

        query = supabase.table("users").select("*").eq("user_id", auth_data.user_id)
        response = query.execute()

        if not response.data:
            logger.debug(f"NOT FOUND - user id: {auth_data.user_id}")
            return JSONResponse(
                status_code=200,
                content={
                    "result": {
                        "error": "Not found",
                        "message": f"No account found with ID: {auth_data.user_id}",
                    }
                },
            )
        user_data = response.data[0]
        user = UserInfo(**user_data)

        if user.pin != auth_data.pin:
            logger.debug(f"BAD PIN - user id: {auth_data.user_id}")
            return JSONResponse(
                status_code=200,
                content={
                    "result": {
                        "error": "Authentication Failed",
                        "message": f"Account with ID: {auth_data.user_id} provided incorrect pin",
                    }
                },
            )

        # Add success response with first name
        return JSONResponse(
            status_code=200,
            content={
                "result": {
                    "message": "Authentication successful",
                    "data": {"first_name": user.first_name, "user_id": user.user_id},
                }
            },
        )

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return JSONResponse(
            status_code=422,
            content={"result": {"error": "Validation error", "message": str(e)}},
        )
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"result": {"error": "Internal server error", "message": str(e)}},
        )


@router.get("/accounts/{user_id}", response_model=dict)
async def get_user_accounts(user_id: int):
    """Fetch all accounts associated with a user"""
    response = (
        supabase.table("accounts")
        .select("user_id", "account_number", "balance", "created_at")
        .eq("user_id", user_id)
        .execute()
    )

    if response.data:
        accounts = [AccountInfo(**account) for account in response.data]
        return {"user_id": user_id, "accounts": accounts}

    raise HTTPException(status_code=404, detail="No accounts found for this user")


@router.get("/account/{user_id}/{account_number}", response_model=AccountInfo)
async def get_account_info(user_id: int, account_number: int):
    """Fetch user account details for a specific account"""
    response = (
        supabase.table("accounts")
        .select("user_id", "account_number", "balance", "created_at")
        .eq("user_id", user_id)
        .eq("account_number", account_number)
        .single()
        .execute()
    )

    if response.data:
        return AccountInfo(**response.data)

    raise HTTPException(status_code=404, detail="Account not found")


@router.get("/loans/{user_id}/{account_number}", response_model=dict)
async def get_user_loans(user_id: int, account_number: int):
    """Fetch all loans for a specific account"""
    response = (
        supabase.table("loans")
        .select("id", "user_id", "account_number", "amount", "requested_at")
        .eq("user_id", user_id)
        .eq("account_number", account_number)
        .execute()
    )

    if response.data:
        # Convert to LoanInfo models
        loans = [LoanInfo(**loan) for loan in response.data]
        return {
            "user_id": user_id,
            "account_number": account_number,
            "loans": loans,
        }

    raise HTTPException(status_code=404, detail="No loans found for this account")


@router.get("/transactions/{user_id}/{account_number}", response_model=dict)
async def get_transaction_history(user_id: int, account_number: int):
    """Fetch transaction history for a specific account"""
    response = (
        supabase.table("transactions")
        .select("id", "user_id", "account_number", "amount", "category", "created_at")
        .eq("user_id", user_id)
        .eq("account_number", account_number)
        .execute()
    )

    if response.data:
        transactions = [TransactionInfo(**txn) for txn in response.data]
        return {
            "user_id": user_id,
            "account_number": account_number,
            "transactions": transactions,
        }

    raise HTTPException(
        status_code=404, detail="No transactions found for this account"
    )


@router.patch("/update/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate):
    """Update a user's information"""
    update_data = user_update.dict(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    response = (
        supabase.table("users").update(update_data).eq("user_id", user_id).execute()
    )

    if response.data:
        return {"message": "User updated successfully", "updated_fields": response.data}

    raise HTTPException(status_code=404, detail="User not found")
