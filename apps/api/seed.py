from datetime import datetime, timedelta

from app.db import SessionLocal

from app.models.user import User
from app.models.category import Category
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.models.availability import Availability
from app.models.job_post import JobPost
from app.models.application import JobApplication
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.review import Review

from app.core.security import hash_password
from app.services.matching_service import generate_and_store_matches


db = SessionLocal()

print("Seeding MainForte...")


def get_or_create_user(
    email,
    full_name,
    role,
    can_work,
    can_hire,
    city,
    bio=None,
    skills=None,
    hourly_rate=None,
):
    user = db.query(User).filter(User.email == email).first()

    if user:
        user.full_name = full_name
        user.role = role
        user.can_work = can_work
        user.can_hire = can_hire
        user.city = city
        user.bio = bio
        user.skills = skills
        user.hourly_rate = hourly_rate

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    user = User(
        email=email,
        hashed_password=hash_password("123456"),
        full_name=full_name,
        role=role,
        can_work=can_work,
        can_hire=can_hire,
        city=city,
        bio=bio,
        skills=skills,
        hourly_rate=hourly_rate,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_or_create_worker_profile(user):
    profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == user.id
    ).first()

    if profile:
        profile.bio = user.bio
        profile.city = user.city
        profile.region = "Temiscaming"
        profile.transport_available = True
        profile.hourly_rate = user.hourly_rate or 25
        profile.is_verified = True

        db.add(profile)
        db.commit()
        db.refresh(profile)

        return profile

    profile = WorkerProfile(
        user_id=user.id,
        bio=user.bio,
        city=user.city,
        region="Temiscaming",
        transport_available=True,
        hourly_rate=user.hourly_rate or 25,
        is_verified=True,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def add_skill(profile, category, level="experienced"):
    existing = db.query(WorkerSkill).filter(
        WorkerSkill.worker_id == profile.id,
        WorkerSkill.category_id == category.id,
    ).first()

    if existing:
        existing.experience_level = level
        db.add(existing)
        db.commit()
        return existing

    skill = WorkerSkill(
        worker_id=profile.id,
        category_id=category.id,
        experience_level=level,
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill


def add_availability(profile, city, availability_type="full_day"):
    existing = db.query(Availability).filter(
        Availability.worker_id == profile.id,
        Availability.status == "available",
    ).first()

    if existing:
        existing.city = city
        existing.availability_type = availability_type
        existing.start_datetime = datetime.now() - timedelta(hours=1)
        existing.end_datetime = datetime.now() + timedelta(days=7)
        existing.status = "available"

        db.add(existing)
        db.commit()
        db.refresh(existing)

        return existing

    availability = Availability(
        worker_id=profile.id,
        city=city,
        availability_type=availability_type,
        start_datetime=datetime.now() - timedelta(hours=1),
        end_datetime=datetime.now() + timedelta(days=7),
        status="available",
    )

    db.add(availability)
    db.commit()
    db.refresh(availability)

    return availability


def get_or_create_job(
    client,
    category,
    title,
    city,
    status="open",
    hours_from_now=2,
    budget=30,
    has_unread_activity=False,
):
    job = db.query(JobPost).filter(
        JobPost.title == title
    ).first()

    if job:
        job.client_id = client.id
        job.category_id = category.id
        job.city = city
        job.status = status
        job.needed_at = datetime.now() + timedelta(hours=hours_from_now)
        job.budget_amount = budget
        job.has_unread_activity = has_unread_activity

        db.add(job)
        db.commit()
        db.refresh(job)

        return job

    job = JobPost(
        client_id=client.id,
        category_id=category.id,
        title=title,
        description="Besoin d’une personne fiable et disponible dans la région.",
        city=city,
        address_optional="Rue principale",
        needed_at=datetime.now() + timedelta(hours=hours_from_now),
        duration_estimate_hours=2,
        urgency="today",
        budget_type="hourly",
        budget_amount=budget,
        status=status,
        has_unread_activity=has_unread_activity,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def get_or_create_application(job, profile, status="pending"):
    application = db.query(JobApplication).filter(
        JobApplication.job_id == job.id,
        JobApplication.worker_profile_id == profile.id,
    ).first()

    if application:
        application.status = status

        db.add(application)
        db.commit()
        db.refresh(application)

        return application

    application = JobApplication(
        job_id=job.id,
        worker_profile_id=profile.id,
        message="Disponible pour ce travail.",
        proposed_rate=job.budget_amount,
        status=status,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


def get_or_create_conversation(job, client, worker_user):
    conversation = db.query(Conversation).filter(
        Conversation.job_id == job.id,
        Conversation.client_id == client.id,
        Conversation.worker_id == worker_user.id,
    ).first()

    if conversation:
        return conversation

    conversation = Conversation(
        job_id=job.id,
        client_id=client.id,
        worker_id=worker_user.id,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def add_message(
    conversation,
    sender,
    content,
    is_read=False,
):
    existing = db.query(Message).filter(
        Message.conversation_id == conversation.id,
        Message.sender_id == sender.id,
        Message.content == content,
    ).first()

    if existing:
        if existing.created_at is None:
            existing.created_at = datetime.now()

        existing.is_read = is_read

        db.add(existing)
        db.commit()
        db.refresh(existing)

        return existing

    message = Message(
        conversation_id=conversation.id,
        sender_id=sender.id,
        content=content,
        is_read=is_read,
        created_at=datetime.now(),
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def add_review(job, reviewer, target, rating, comment):
    existing = db.query(Review).filter(
        Review.job_id == job.id,
        Review.reviewer_user_id == reviewer.id,
        Review.target_user_id == target.id,
    ).first()

    if existing:
        return existing

    review = Review(
        job_id=job.id,
        reviewer_user_id=reviewer.id,
        target_user_id=target.id,
        rating=rating,
        comment=comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


categories_data = [
    ("Déménagement", "demenagement"),
    ("Ménage", "menage"),
    ("Jardinage", "jardinage"),
    ("Peinture", "peinture"),
    ("Transport", "transport"),
    ("Gardiennage", "gardiennage"),
    ("Aide ponctuelle", "aide-ponctuelle"),
]

categories = {}

for name, slug in categories_data:
    category = db.query(Category).filter(
        Category.slug == slug
    ).first()

    if not category:
        category = Category(
            name=name,
            slug=slug,
            description=f"Catégorie {name}",
            is_active=True,
        )

        db.add(category)
        db.commit()
        db.refresh(category)

    categories[slug] = category


client = get_or_create_user(
    email="client@test.com",
    full_name="Main Client",
    role="client",
    can_work=False,
    can_hire=True,
    city="Ville-Marie",
    bio="Client local qui publie des besoins dans la région.",
)

client2 = get_or_create_user(
    email="client2@test.com",
    full_name="Client Rouyn",
    role="client",
    can_work=False,
    can_hire=True,
    city="Rouyn-Noranda",
    bio="Client actif qui cherche souvent de l’aide ponctuelle.",
)

worker1 = get_or_create_user(
    email="worker1@test.com",
    full_name="Worker Ville-Marie",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Ville-Marie",
    bio="Disponible pour déménagement, transport et aide ponctuelle.",
    skills="Déménagement, Transport, Aide ponctuelle",
    hourly_rate=30,
)

worker2 = get_or_create_user(
    email="worker2@test.com",
    full_name="Worker Duhamel-Ouest",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Duhamel-Ouest",
    bio="Fiable, ponctuel et disponible pour petits travaux.",
    skills="Ménage, Jardinage, Peinture",
    hourly_rate=25,
)

worker3 = get_or_create_user(
    email="worker3@test.com",
    full_name="Worker Notre-Dame-du-Nord",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Notre-Dame-du-Nord",
    bio="Disponible les soirs et fins de semaine.",
    skills="Transport, Gardiennage, Aide ponctuelle",
    hourly_rate=28,
)

both = get_or_create_user(
    email="both@test.com",
    full_name="Client et Travailleur",
    role="worker",
    can_work=True,
    can_hire=True,
    city="Duhamel-Ouest",
    bio="Peut publier des besoins et aussi aider les autres.",
    skills="Déménagement, Ménage, Transport",
    hourly_rate=32,
)


worker1_profile = get_or_create_worker_profile(worker1)
worker2_profile = get_or_create_worker_profile(worker2)
worker3_profile = get_or_create_worker_profile(worker3)
both_profile = get_or_create_worker_profile(both)

add_skill(worker1_profile, categories["demenagement"])
add_skill(worker1_profile, categories["transport"])
add_skill(worker1_profile, categories["aide-ponctuelle"])

add_skill(worker2_profile, categories["menage"])
add_skill(worker2_profile, categories["jardinage"])
add_skill(worker2_profile, categories["peinture"])

add_skill(worker3_profile, categories["transport"])
add_skill(worker3_profile, categories["gardiennage"])
add_skill(worker3_profile, categories["aide-ponctuelle"])

add_skill(both_profile, categories["demenagement"])
add_skill(both_profile, categories["menage"])
add_skill(both_profile, categories["transport"])

add_availability(worker1_profile, "Ville-Marie")
add_availability(worker2_profile, "Duhamel-Ouest")
add_availability(worker3_profile, "Notre-Dame-du-Nord", "evening")
add_availability(both_profile, "Duhamel-Ouest", "evening")


open_job = get_or_create_job(
    client=client,
    category=categories["demenagement"],
    title="Besoin d’aide pour déménagement - ouvert",
    city="Ville-Marie",
    status="open",
    hours_from_now=2,
    budget=30,
    has_unread_activity=False,
)

pending_job = get_or_create_job(
    client=client,
    category=categories["menage"],
    title="Nettoyage de maison - candidature en attente",
    city="Duhamel-Ouest",
    status="open",
    hours_from_now=4,
    budget=25,
    has_unread_activity=True,
)

matched_job = get_or_create_job(
    client=client,
    category=categories["transport"],
    title="Transport d’un meuble - accepté",
    city="Ville-Marie",
    status="matched",
    hours_from_now=5,
    budget=35,
    has_unread_activity=True,
)

in_progress_job = get_or_create_job(
    client=client2,
    category=categories["jardinage"],
    title="Aide jardinage - en cours",
    city="Duhamel-Ouest",
    status="in_progress",
    hours_from_now=1,
    budget=28,
    has_unread_activity=True,
)

completed_job = get_or_create_job(
    client=client,
    category=categories["demenagement"],
    title="Déménagement terminé - prêt pour avis",
    city="Ville-Marie",
    status="completed",
    hours_from_now=-3,
    budget=35,
    has_unread_activity=True,
)

reviewed_job = get_or_create_job(
    client=client2,
    category=categories["transport"],
    title="Transport terminé - déjà évalué",
    city="Notre-Dame-du-Nord",
    status="completed",
    hours_from_now=-10,
    budget=30,
    has_unread_activity=False,
)


get_or_create_application(
    pending_job,
    worker2_profile,
    status="pending",
)

get_or_create_application(
    matched_job,
    worker1_profile,
    status="accepted",
)

get_or_create_application(
    in_progress_job,
    worker2_profile,
    status="accepted",
)

get_or_create_application(
    completed_job,
    worker1_profile,
    status="accepted",
)

get_or_create_application(
    reviewed_job,
    worker3_profile,
    status="accepted",
)


for job in db.query(JobPost).filter(
    JobPost.status == "open"
).all():
    generate_and_store_matches(
        db=db,
        job=job,
    )


conv_matched = get_or_create_conversation(
    matched_job,
    client,
    worker1,
)

add_message(
    conv_matched,
    client,
    "Bonjour, merci d’avoir postulé. Es-tu disponible aujourd’hui ?",
    is_read=False,
)

add_message(
    conv_matched,
    worker1,
    "Oui, je suis disponible cet après-midi.",
    is_read=False,
)

conv_progress = get_or_create_conversation(
    in_progress_job,
    client2,
    worker2,
)

add_message(
    conv_progress,
    client2,
    "Le travail peut commencer dès que tu arrives.",
    is_read=False,
)

add_message(
    conv_progress,
    worker2,
    "Parfait, je suis en route.",
    is_read=False,
)

conv_completed = get_or_create_conversation(
    completed_job,
    client,
    worker1,
)

add_message(
    conv_completed,
    worker1,
    "Le déménagement est terminé.",
    is_read=False,
)

add_message(
    conv_completed,
    client,
    "Merci beaucoup, tout s’est bien passé.",
    is_read=False,
)


add_review(
    reviewed_job,
    client2,
    worker3,
    5,
    "Très fiable, ponctuel et efficace.",
)

add_review(
    reviewed_job,
    worker3,
    client2,
    5,
    "Client très clair et respectueux.",
)


db.close()

print("Seed complete!")
print("")
print("Test accounts:")
print("client@test.com / 123456")
print("client2@test.com / 123456")
print("worker1@test.com / 123456")
print("worker2@test.com / 123456")
print("worker3@test.com / 123456")
print("both@test.com / 123456")