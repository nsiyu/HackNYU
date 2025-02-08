#working
from fastapi import FastAPI
from api.routes import (
    transactionrouter,
    loanrouter,
    analyticsrouter,
    userrouter,
)


app = FastAPI(title="Banking API", version="1.0")

app.include_router(transactionrouter, prefix="/transactions", tags=["Transactions"])
app.include_router(loanrouter, prefix="/loans", tags=["Loans"])
app.include_router(analyticsrouter, prefix="/analytics", tags=["AI Insights"])
app.include_router(userrouter, prefix="/user", tags=["user info"])
