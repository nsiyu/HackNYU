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
