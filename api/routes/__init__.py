from .analytics import router as analyticsrouter
from .loan import router as loanrouter
from .transactions import router as transactionrouter
from .user import router as userrouter

__all__ = [
    "analyticsrouter",
    "loanrouter",
    "transactionrouter",
    "userrouter",
]
