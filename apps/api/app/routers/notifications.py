from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.job_post import JobPost
from app.models.application import JobApplication
from app.models.worker_profile import WorkerProfile
from app.models.review import Review


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get("/me")
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversations = db.query(Conversation).filter(
        (Conversation.client_id == current_user.id)
        |
        (Conversation.worker_id == current_user.id)
    ).all()

    conversation_ids = [
        conversation.id
        for conversation in conversations
    ]

    unread_messages_count = 0

    if conversation_ids:
        unread_messages_count = db.query(Message).filter(
            Message.conversation_id.in_(conversation_ids),
            Message.sender_id != current_user.id,
            Message.is_read == False,
        ).count()

    pending_applications_count = 0
    unread_job_activities_count = 0

    if current_user.can_hire:
        unread_job_activities_count = db.query(JobPost).filter(
            JobPost.client_id == current_user.id,
            JobPost.has_unread_activity == True,
        ).count()

        my_open_jobs = db.query(JobPost).filter(
            JobPost.client_id == current_user.id,
            JobPost.status == "open",
        ).all()

        job_ids = [
            job.id
            for job in my_open_jobs
        ]

        if job_ids:
            pending_applications_count = db.query(JobApplication).filter(
                JobApplication.job_id.in_(job_ids),
                JobApplication.status == "pending",
            ).count()

    accepted_jobs_count = 0
    completed_jobs_count = 0

    if current_user.can_work:
        worker_profile = db.query(WorkerProfile).filter(
            WorkerProfile.user_id == current_user.id
        ).first()

        if worker_profile:
            accepted_applications = db.query(JobApplication).filter(
                JobApplication.worker_profile_id == worker_profile.id,
                JobApplication.status == "accepted",
            ).all()

            accepted_job_ids = [
                application.job_id
                for application in accepted_applications
            ]

            if accepted_job_ids:
                accepted_jobs_count = db.query(JobPost).filter(
                    JobPost.id.in_(accepted_job_ids),
                    JobPost.status == "matched",
                ).count()

                completed_jobs_count = db.query(JobPost).filter(
                    JobPost.id.in_(accepted_job_ids),
                    JobPost.status == "completed",
                ).count()

    reviews_received_count = db.query(Review).filter(
        Review.target_user_id == current_user.id
    ).count()

    total = (
        unread_messages_count
        + unread_job_activities_count
        + accepted_jobs_count
        + completed_jobs_count
        + reviews_received_count
    )

    return {
        "total": total,
        "messages": unread_messages_count,
        "pending_applications": pending_applications_count,
        "accepted_jobs": accepted_jobs_count,
        "completed_jobs": completed_jobs_count,
        "reviews_received": reviews_received_count,
        "unread_job_activities": unread_job_activities_count,
    }