# working
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import (
    transactionrouter,
    loanrouter,
    analyticsrouter,
    userrouter,
)


app = FastAPI(title="Banking API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific frontend URLs for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(transactionrouter, prefix="/transactions", tags=["Transactions"])
app.include_router(loanrouter, prefix="/loans", tags=["Loans"])
app.include_router(analyticsrouter, prefix="/analytics", tags=["AI Insights"])
app.include_router(userrouter, prefix="/user", tags=["user info"])
