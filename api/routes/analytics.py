from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import openai
import json
from pydantic import BaseModel

from ..database import supabase, get_user_transactions, get_user_info
from ..config import settings, logger


router = APIRouter()
openai.api_key = settings.OPENAI_KEY

open_ai_client = openai.OpenAI()


class UserSpendingHabitsRequest(BaseModel):
    user_id: int


@router.post("/spending_habits")
async def get_spending_habits(request: Request):
    # TODO
    """Generate spending habits report using GPT"""
    logger.debug(f"/analytics/spending_habits request")

    body = await request.json()
    args = body.get("args", {})
    logger.debug(f"Args: {args}")

    user_data = UserSpendingHabitsRequest(user_id=args.get("user_id"))
    logger.debug(f"user id: {user_data.user_id}")

    user_info = get_user_info(user_data.user_id)
    if user_info is None:
        return JSONResponse(
            status_code=403,
            content={
                "result": {
                    "error": "Not Found",
                    "message": f"No user with ID: {user_data.user_id}",
                }
            },
        )
    transactions = get_user_transactions(user_data.user_id)

    if transactions is None:
        return JSONResponse(
            status_code=200,
            content={
                "result": {
                    "error": "No Transactions",
                    "message": f"No transactions found for user with ID: {user_data.user_id}",
                }
            },
        )

    transaction_str = ""
    for idx, transaction in enumerate(transactions):
        transaction_str += f"transaction {idx}: amount: {transaction.amount}, category: {transaction.category}\n"

    user_info_str = f"USER - dependents: {user_info.dependents}, credit_score: {user_info.credit_score}, income: {user_info.income}, age: {user_info.age}"
    report_prompt = f"Analyze the following transactions and user info and summerize spending habits in 2 sentences:\n USER {user_info_str} \n TRANSACTIONS {transaction_str}"

    response = open_ai_client.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": report_prompt}]
    )
    return JSONResponse(
        status_code=200,
        content={"result": {"summary": response["choices"][0]["message"]["content"]}},
    )


@router.post("/spending_plan")
async def get_spending_plan(request: Request):
    """Generate spending habits report using GPT"""
    logger.debug(f"/analytics/spending_plan request")

    body = await request.json()
    args = body.get("args", {})
    logger.debug(f"Args: {args}")

    user_data = UserSpendingHabitsRequest(user_id=args.get("user_id"))
    logger.debug(f"user id: {user_data.user_id}")

    user_info = get_user_info(user_data.user_id)
    if user_info is None:
        return JSONResponse(
            status_code=403,
            content={
                "result": {
                    "error": "Not Found",
                    "message": f"No user with ID: {user_data.user_id}",
                }
            },
        )

    user_info_str = f"USER - dependents: {user_info.dependents}, credit_score: {user_info.credit_score}, income: {user_info.income}, age: {user_info.age}"
    plan_prompt = f"""Based on the user info and standard good spending habits, generate a 
    spending amount for each category per month and a summary. Your response must be a JSON 
    object with keys: spending_plan_summary, housing_amount, food_amount, shopping_amount, entertainment_amount, saving_amount.\n
    USER {user_info_str}"""

    response = open_ai_client.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": plan_prompt}]
    )

    try:
        plan_json = response.choices[0].message.content
        plan_data = json.loads(plan_json)  # Ensure it's valid JSON
    except (KeyError, json.JSONDecodeError) as e:
        logger.error(f"Invalid response from OpenAI: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Invalid response format from AI"},
        )

    return JSONResponse(content={"plan": plan_data})
