from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from ..database import supabase, get_c1_account_info, create_c1_transfer_account
from ..config import logger

router = APIRouter()


class BalanceRequest(BaseModel):
    account_id: str = Field(
        ..., description="String of digits representing the account_id"
    )


class TransferRequest(BaseModel):
    from_account: str = Field(..., description="Account ID of sender")
    to_account: str = Field(..., description="Account ID of recipient")
    amount: float = Field(..., description="Amount to transfer")


@router.post("/balance")
async def get_balance(request: Request):
    try:
        body = await request.json()
        logger.info(f"Received request body: {body}")

        # Extract args from the nested call structure
        args = body.get("args", {})
        logger.info(f"Extracted args: {args}")

        # Get user_id from args
        account_id = args.get("account_id")

        data = BalanceRequest(account_id=account_id)
        result = get_c1_account_info(data.account_id)

        return JSONResponse(
            status_code=200,
            content={
                "result": {"message": "Balance retrieved", "balance": result.balance}
            },
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
            from_account=args.get("from_account"),
            to_account=args.get("to_account"),
            amount=float(args.get("amount")),
        )

        from_account = get_c1_account_info(data.from_account)
        to_account = get_c1_account_info(data.to_account)

        if not from_account or not to_account:
            return JSONResponse(
                status_code=404,
                content={
                    "result": {
                        "error": "Not found",
                        "message": "One or both users not found",
                    }
                },
            )

        if from_account.balance < data.amount:
            return JSONResponse(
                status_code=400,
                content={
                    "result": {
                        "error": "Insufficient funds",
                        "message": "Sender has insufficient balance",
                    }
                },
            )

        create_c1_transfer_account(
            from_account._id,
            medium="balance",
            payee_id=to_account._id,
            amount=data.amount,
            status="completed",
            description="Direct Transfer",
        )

        return JSONResponse(
            status_code=200,
            content={
                "result": {
                    "message": "Transfer successful",
                    "data": {
                        "from_user": data.from_account,
                        "to_user": data.to_account,
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
