from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.job_post import JobPost

from app.core.security import (
    get_current_user
)

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


@router.get("/me")
def get_my_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    conversations = db.query(
        Conversation
    ).filter(
        (Conversation.client_id ==
         current_user.id)
        |
        (Conversation.worker_id ==
         current_user.id)
    ).all()

    results = []

    for conversation in conversations:

        last_message = db.query(
            Message
        ).filter(
            Message.conversation_id ==
            conversation.id
        ).order_by(
            Message.created_at.desc()
        ).first()

        job = db.query(JobPost).filter(
            JobPost.id ==
            conversation.job_id
        ).first()

        results.append({
            "id": conversation.id,
            "job_id": conversation.job_id,
            "job_title":
                job.title if job else None,
            "last_message":
                last_message.content
                if last_message else None,
            "last_message_at":
                last_message.created_at
                if last_message else None,
        })

    return results


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    conversation = db.query(
        Conversation
    ).filter(
        Conversation.id ==
        conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    if (
        conversation.client_id !=
        current_user.id
        and
        conversation.worker_id !=
        current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not allowed"
        )

    messages = db.query(Message).filter(
        Message.conversation_id ==
        conversation.id
    ).order_by(
        Message.created_at.asc()
    ).all()

    return messages


@router.post("/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    conversation = db.query(
        Conversation
    ).filter(
        Conversation.id ==
        conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    if (
        conversation.client_id !=
        current_user.id
        and
        conversation.worker_id !=
        current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not allowed"
        )

    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        content=payload.get("content"),
    )

    db.add(message)

    db.commit()
    db.refresh(message)

    return message