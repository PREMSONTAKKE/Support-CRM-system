from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=120)
    customer_email: str = Field(..., min_length=3, max_length=200)
    subject: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)


class NoteOut(BaseModel):
    note_text: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketDetail(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: List[NoteOut] = []

    model_config = {"from_attributes": True}


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class CreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime


class UpdateResponse(BaseModel):
    success: bool
    updated_at: datetime
