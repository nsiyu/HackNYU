from pydantic import BaseModel


class AddressInfo(BaseModel):
    street_number: str
    street_name: str
    city: str
    state: str
    zip: str


class CustomerInfo(BaseModel):
    _id: str
    first_name: str
    last_name: str
    address: AddressInfo


class CustomerAdditionalInfo(BaseModel):
    customer_id: str
    income: int
    number_of_dependents: int
    credit_score: int
    age: int
