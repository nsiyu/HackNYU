from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from ..database import supabase
import logging

router = APIRouter()


class BalanceRequest(BaseModel):
    user_id: str = Field(..., description="String of digits representing the user ID")


class TransferRequest(BaseModel):
    from_user: str = Field(..., description="User ID of sender")
    to_user: str = Field(..., description="User ID of recipient")
    amount: float = Field(..., description="Amount to transfer")


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/balance")
async def get_balance(request: Request):
    try:
        body = await request.json()
        logger.info(f"Received request body: {body}")

        # Extract args from the nested call structure
        args = body.get("args", {})
        logger.info(f"Extracted args: {args}")

        # Get user_id from args
        user_id = args.get("user_id")

        data = BalanceRequest(user_id=user_id)

        query = (
            supabase.table("accounts")
            .select("balance")
            .eq("user_id", int(data.user_id))
            .single()
        )

        logger.info(f"Executing query: {query}")

        result = query.execute()
        logger.info(f"Query result: {result}")

        return JSONResponse(
            status_code=200,
            content={"result": {"message": "Balance retrieved", "data": result.data}},
        )

    except ValueError as e:
        return JSONResponse(
            status_code=999,
        )


@router.post("/transfer")
async def transfer_funds(request: Request):
    try:
        body = await request.json()
        logger.info(f"Received request body: {body}")

        args = body.get("args", {})
        logger.info(f"Extracted args: {args}")

        data = TransferRequest(
            from_user=args.get("from_user"),
            to_user=args.get("to_user"),
            amount=float(args.get("amount")),
        )

        # Get sender's balance
        from_user_query = (
            supabase.table("accounts")
            .select("balance")
            .eq("user_id", int(data.from_user))
            .single()
        )

        logger.info(f"Querying sender balance: {from_user_query}")
        from_user_data = from_user_query.execute()

        # Get recipient's balance
        to_user_query = (
            supabase.table("accounts")
            .select("balance")
            .eq("user_id", int(data.to_user))
            .single()
        )

        logger.info(f"Querying recipient balance: {to_user_query}")
        to_user_data = to_user_query.execute()

        if not from_user_data.data or not to_user_data.data:
            return JSONResponse(
                status_code=404,
                content={
                    "result": {
                        "error": "Not found",
                        "message": "One or both users not found",
                    }
                },
            )

        if from_user_data.data["balance"] < data.amount:
            return JSONResponse(
                status_code=400,
                content={
                    "result": {
                        "error": "Insufficient funds",
                        "message": "Sender has insufficient balance",
                    }
                },
            )

        # Perform transfer
        supabase.table("accounts").update(
            {"balance": from_user_data.data["balance"] - data.amount}
        ).eq("user_id", int(data.from_user)).execute()

        supabase.table("accounts").update(
            {"balance": to_user_data.data["balance"] + data.amount}
        ).eq("user_id", int(data.to_user)).execute()

        return JSONResponse(
            status_code=200,
            content={
                "result": {
                    "message": "Transfer successful",
                    "data": {
                        "from_user": data.from_user,
                        "to_user": data.to_user,
                        "amount": data.amount,
                    },
                }
            },
        )

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return JSONResponse(
            status_code=422,
            content={"result": {"error": "Validation error", "message": str(e)}},
        )
