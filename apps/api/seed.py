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
from app.models.match import Match

from app.core.security import hash_password
from app.services.matching_service import generate_and_store_matches

from app.constants.regions import TEMISCAMING_REGION


db = SessionLocal()

print("Seeding MainForte...")

# =========================
# CLEAN DATABASE
# =========================

print("Cleaning old data...")

db.query(Message).delete()
db.query(Conversation).delete()

db.query(Review).delete()

db.query(Match).delete()

db.query(JobApplication).delete()

db.query(Availability).delete()
db.query(WorkerSkill).delete()

db.query(WorkerProfile).delete()

db.query(JobPost).delete()

db.query(Category).delete()

db.query(User).delete()

db.commit()

print("Old data removed.")


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
    user = db.query(User).filter(
        User.email == email
    ).first()

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


def get_or_create_worker_profile(
    user,
    transport_available=True,
    is_verified=True,
):
    profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == user.id
    ).first()

    if profile:
        profile.bio = user.bio
        profile.city = user.city
        profile.region = TEMISCAMING_REGION
        profile.transport_available = transport_available
        profile.hourly_rate = user.hourly_rate or 25
        profile.is_verified = is_verified

        db.add(profile)
        db.commit()
        db.refresh(profile)

        return profile

    profile = WorkerProfile(
        user_id=user.id,
        bio=user.bio,
        city=user.city,
        region=TEMISCAMING_REGION,
        transport_available=transport_available,
        hourly_rate=user.hourly_rate or 25,
        is_verified=is_verified,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def add_skill(
    profile,
    category,
    level="experienced",
):
    existing = db.query(WorkerSkill).filter(
        WorkerSkill.worker_id == profile.id,
        WorkerSkill.category_id == category.id,
    ).first()

    if existing:
        existing.experience_level = level
        db.add(existing)
        db.commit()
        db.refresh(existing)
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


def add_availability(
    profile,
    city,
    availability_type="full_day",
    starts_in_hours=-1,
    duration_days=7,
    status="available",
    note=None,
):
    existing = db.query(Availability).filter(
        Availability.worker_id == profile.id,
        Availability.city == city,
        Availability.availability_type == availability_type,
    ).first()

    start_datetime = datetime.now() + timedelta(
        hours=starts_in_hours
    )

    end_datetime = start_datetime + timedelta(
        days=duration_days
    )

    if existing:
        existing.city = city
        existing.region = TEMISCAMING_REGION
        existing.availability_type = availability_type
        existing.start_datetime = start_datetime
        existing.end_datetime = end_datetime
        existing.status = status
        existing.note = note

        db.add(existing)
        db.commit()
        db.refresh(existing)

        return existing

    availability = Availability(
        worker_id=profile.id,
        city=city,
        region=TEMISCAMING_REGION,
        availability_type=availability_type,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        status=status,
        note=note,
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
    description,
    address_optional,
    status="open",
    hours_from_now=2,
    duration_hours=2,
    urgency="today",
    budget=30,
    has_unread_activity=False,
):
    job = db.query(JobPost).filter(
        JobPost.title == title
    ).first()

    needed_at = datetime.now() + timedelta(
        hours=hours_from_now
    )

    if job:
        job.client_id = client.id
        job.category_id = category.id
        job.title = title
        job.description = description
        job.city = city
        job.region = TEMISCAMING_REGION
        job.address_optional = address_optional
        job.status = status
        job.needed_at = needed_at
        job.duration_estimate_hours = duration_hours
        job.urgency = urgency
        job.budget_type = "hourly"
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
        description=description,
        city=city,
        region=TEMISCAMING_REGION,
        address_optional=address_optional,
        needed_at=needed_at,
        duration_estimate_hours=duration_hours,
        urgency=urgency,
        budget_type="hourly",
        budget_amount=budget,
        status=status,
        has_unread_activity=has_unread_activity,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def get_or_create_application(
    job,
    profile,
    status="pending",
    message="Disponible pour ce travail.",
):
    application = db.query(JobApplication).filter(
        JobApplication.job_id == job.id,
        JobApplication.worker_profile_id == profile.id,
    ).first()

    if application:
        application.status = status
        application.message = message
        application.proposed_rate = job.budget_amount

        db.add(application)
        db.commit()
        db.refresh(application)

        return application

    application = JobApplication(
        job_id=job.id,
        worker_profile_id=profile.id,
        message=message,
        proposed_rate=job.budget_amount,
        status=status,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


def get_or_create_conversation(
    job,
    client,
    worker_user,
):
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
        existing.is_read = is_read

        if existing.created_at is None:
            existing.created_at = datetime.now()

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


def add_review(
    job,
    reviewer,
    target,
    rating,
    comment,
):
    existing = db.query(Review).filter(
        Review.job_id == job.id,
        Review.reviewer_user_id == reviewer.id,
        Review.target_user_id == target.id,
    ).first()

    if existing:
        existing.rating = rating
        existing.comment = comment

        db.add(existing)
        db.commit()
        db.refresh(existing)

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


# =========================
# Categories
# =========================

categories_data = [
    ("Déménagement", "demenagement"),
    ("Ménage", "menage"),
    ("Jardinage", "jardinage"),
    ("Peinture", "peinture"),
    ("Transport", "transport"),
    ("Livraison", "livraison"),
    ("Gardiennage", "gardiennage"),
    ("Aide ponctuelle", "aide-ponctuelle"),
    ("Déneigement", "deneigement"),
    ("Bois de chauffage", "bois-chauffage"),
    ("Petites réparations", "petites-reparations"),
    ("Assemblage de meubles", "assemblage-meubles"),
    ("Entretien extérieur", "entretien-exterieur"),
    ("Aide aux personnes âgées", "aide-personnes-agees"),
    ("Informatique", "informatique"),
    ("Électricité", "electricite"),
    ("Plomberie", "plomberie"),
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
            description=f"Services de type {name}",
            is_active=True,
        )

        db.add(category)
        db.commit()
        db.refresh(category)

    categories[slug] = category


# =========================
# Clients
# =========================

client1 = get_or_create_user(
    email="julie.gauthier@test.com",
    full_name="Julie Gauthier",
    role="client",
    can_work=False,
    can_hire=True,
    city="Ville-Marie",
    bio="Résidente de Ville-Marie. J’utilise MainForte pour trouver de l’aide ponctuelle à la maison.",
)

client2 = get_or_create_user(
    email="martin.roy@test.com",
    full_name="Martin Roy",
    role="client",
    can_work=False,
    can_hire=True,
    city="Lorrainville",
    bio="Besoin occasionnel d’aide pour transport, petits travaux et entretien extérieur.",
)

client3 = get_or_create_user(
    email="chantal.moreau@test.com",
    full_name="Chantal Moreau",
    role="client",
    can_work=False,
    can_hire=True,
    city="Notre-Dame-du-Nord",
    bio="Cherche parfois de l’aide fiable pour des tâches simples et rapides.",
)

client4 = get_or_create_user(
    email="luc.larouche@test.com",
    full_name="Luc Larouche",
    role="client",
    can_work=False,
    can_hire=True,
    city="Témiscaming",
    bio="Client local qui publie surtout des besoins de transport et d’aide ponctuelle.",
)


# =========================
# Workers
# =========================

worker1 = get_or_create_user(
    email="mathieu.berube@test.com",
    full_name="Mathieu Bérubé",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Ville-Marie",
    bio="Disponible pour déménagement, transport et aide générale. J’ai un véhicule et je peux aider rapidement.",
    skills="Déménagement, transport, manutention, aide générale",
    hourly_rate=32,
)

worker2 = get_or_create_user(
    email="samuel.tremblay@test.com",
    full_name="Samuel Tremblay",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Duhamel-Ouest",
    bio="Disponible les soirs et fins de semaine pour jardinage, peinture et petits travaux.",
    skills="Jardinage, peinture, entretien extérieur",
    hourly_rate=27,
)

worker3 = get_or_create_user(
    email="alexandre.cote@test.com",
    full_name="Alexandre Côté",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Notre-Dame-du-Nord",
    bio="Fiable et ponctuel. Disponible pour transport, gardiennage et aide ponctuelle.",
    skills="Transport, gardiennage, aide ponctuelle",
    hourly_rate=28,
)

worker4 = get_or_create_user(
    email="nathalie.lavoie@test.com",
    full_name="Nathalie Lavoie",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Lorrainville",
    bio="Disponible pour ménage, aide à domicile légère et préparation avant visite.",
    skills="Ménage, aide à domicile, organisation",
    hourly_rate=24,
)

worker5 = get_or_create_user(
    email="eric.morin@test.com",
    full_name="Éric Morin",
    role="worker",
    can_work=True,
    can_hire=False,
    city="Béarn",
    bio="Bon avec les travaux manuels, bois de chauffage, transport et aide extérieure.",
    skills="Aide ponctuelle, transport, entretien extérieur",
    hourly_rate=30,
)

both = get_or_create_user(
    email="caroline.dube@test.com",
    full_name="Caroline Dubé",
    role="worker",
    can_work=True,
    can_hire=True,
    city="Saint-Bruno-de-Guigues",
    bio="Je peux publier des besoins et aussi aider pour ménage, transport léger et aide ponctuelle.",
    skills="Ménage, transport léger, aide ponctuelle",
    hourly_rate=26,
)


# =========================
# Worker profiles
# =========================

worker1_profile = get_or_create_worker_profile(
    worker1,
    transport_available=True,
    is_verified=True,
)

worker2_profile = get_or_create_worker_profile(
    worker2,
    transport_available=True,
    is_verified=True,
)

worker3_profile = get_or_create_worker_profile(
    worker3,
    transport_available=True,
    is_verified=True,
)

worker4_profile = get_or_create_worker_profile(
    worker4,
    transport_available=False,
    is_verified=True,
)

worker5_profile = get_or_create_worker_profile(
    worker5,
    transport_available=True,
    is_verified=True,
)

both_profile = get_or_create_worker_profile(
    both,
    transport_available=True,
    is_verified=True,
)


# =========================
# Skills
# =========================

add_skill(worker1_profile, categories["demenagement"])
add_skill(worker1_profile, categories["transport"])
add_skill(worker1_profile, categories["aide-ponctuelle"])

add_skill(worker2_profile, categories["jardinage"])
add_skill(worker2_profile, categories["peinture"])
add_skill(worker2_profile, categories["aide-ponctuelle"])

add_skill(worker3_profile, categories["transport"])
add_skill(worker3_profile, categories["gardiennage"])
add_skill(worker3_profile, categories["aide-ponctuelle"])

add_skill(worker4_profile, categories["menage"])
add_skill(worker4_profile, categories["gardiennage"])

add_skill(worker5_profile, categories["transport"])
add_skill(worker5_profile, categories["jardinage"])
add_skill(worker5_profile, categories["aide-ponctuelle"])

add_skill(both_profile, categories["menage"])
add_skill(both_profile, categories["transport"])
add_skill(both_profile, categories["aide-ponctuelle"])


# =========================
# Availabilities
# =========================

add_availability(
    worker1_profile,
    "Ville-Marie",
    "full_day",
    note="Disponible avec véhicule pour aide et transport.",
)

add_availability(
    worker2_profile,
    "Duhamel-Ouest",
    "evening",
    note="Disponible après 17h.",
)

add_availability(
    worker3_profile,
    "Notre-Dame-du-Nord",
    "weekend",
    note="Disponible surtout les fins de semaine.",
)

add_availability(
    worker4_profile,
    "Lorrainville",
    "morning",
    note="Disponible les matins pour ménage et aide légère.",
)

add_availability(
    worker5_profile,
    "Béarn",
    "full_day",
    note="Disponible pour travaux extérieurs et transport.",
)

add_availability(
    both_profile,
    "Saint-Bruno-de-Guigues",
    "evening",
    note="Disponible certains soirs.",
)


# =========================
# Jobs
# =========================

open_job = get_or_create_job(
    client=client1,
    category=categories["demenagement"],
    title="Aide pour déménager un sofa",
    description="J’ai besoin d’une personne pour aider à sortir un sofa et le transporter dans une autre maison à Ville-Marie.",
    city="Ville-Marie",
    address_optional="Près du centre-ville",
    status="open",
    hours_from_now=3,
    duration_hours=2,
    urgency="today",
    budget=30,
    has_unread_activity=False,
)

pending_job = get_or_create_job(
    client=client1,
    category=categories["menage"],
    title="Ménage rapide avant une visite",
    description="Besoin d’aide pour faire un ménage rapide avant l’arrivée de visiteurs ce soir.",
    city="Ville-Marie",
    address_optional="Quartier résidentiel",
    status="open",
    hours_from_now=5,
    duration_hours=3,
    urgency="today",
    budget=25,
    has_unread_activity=True,
)

matched_job = get_or_create_job(
    client=client2,
    category=categories["transport"],
    title="Transport d’un électroménager",
    description="Je cherche quelqu’un avec un véhicule pour transporter une sécheuse de Lorrainville vers Ville-Marie.",
    city="Lorrainville",
    address_optional="Rue principale",
    status="matched",
    hours_from_now=6,
    duration_hours=2,
    urgency="today",
    budget=35,
    has_unread_activity=True,
)

in_progress_job = get_or_create_job(
    client=client2,
    category=categories["jardinage"],
    title="Aide pour nettoyage de terrain",
    description="Besoin d’aide pour ramasser des branches et nettoyer une partie du terrain.",
    city="Duhamel-Ouest",
    address_optional="Chemin rural",
    status="in_progress",
    hours_from_now=1,
    duration_hours=3,
    urgency="today",
    budget=28,
    has_unread_activity=True,
)

completed_job = get_or_create_job(
    client=client3,
    category=categories["demenagement"],
    title="Déménagement terminé - aide pour boîtes",
    description="Aide demandée pour déplacer plusieurs boîtes et petits meubles dans la maison.",
    city="Notre-Dame-du-Nord",
    address_optional="Près du quai",
    status="completed",
    hours_from_now=-4,
    duration_hours=2,
    urgency="today",
    budget=32,
    has_unread_activity=True,
)

reviewed_job = get_or_create_job(
    client=client4,
    category=categories["transport"],
    title="Transport terminé - meuble à Témiscaming",
    description="Transport d’un meuble entre deux adresses à Témiscaming.",
    city="Témiscaming",
    address_optional="Secteur centre",
    status="completed",
    hours_from_now=-24,
    duration_hours=2,
    urgency="this_week",
    budget=30,
    has_unread_activity=False,
)

painting_job = get_or_create_job(
    client=both,
    category=categories["peinture"],
    title="Petit travail de peinture intérieur",
    description="Besoin d’une personne pour aider à peinturer une petite pièce.",
    city="Saint-Bruno-de-Guigues",
    address_optional="Maison privée",
    status="open",
    hours_from_now=30,
    duration_hours=4,
    urgency="this_week",
    budget=27,
    has_unread_activity=False,
)

wood_job = get_or_create_job(
    client=client3,
    category=categories["aide-ponctuelle"],
    title="Aide pour empiler du bois de chauffage",
    description="Cherche quelqu’un pour aider à empiler du bois de chauffage avant la fin de semaine.",
    city="Béarn",
    address_optional="Rang de campagne",
    status="open",
    hours_from_now=26,
    duration_hours=3,
    urgency="this_week",
    budget=30,
    has_unread_activity=False,
)


# =========================
# Applications
# =========================

get_or_create_application(
    pending_job,
    worker4_profile,
    status="pending",
    message="Bonjour, je suis disponible en fin d’après-midi pour vous aider avec le ménage.",
)

get_or_create_application(
    pending_job,
    both_profile,
    status="pending",
    message="Je peux passer ce soir si vous avez encore besoin d’aide.",
)

get_or_create_application(
    matched_job,
    worker1_profile,
    status="accepted",
    message="J’ai un véhicule et je peux transporter l’électroménager.",
)

get_or_create_application(
    in_progress_job,
    worker2_profile,
    status="accepted",
    message="Je peux commencer après le travail et apporter mes gants.",
)

get_or_create_application(
    completed_job,
    worker3_profile,
    status="accepted",
    message="Disponible pour déplacer les boîtes et aider au rangement.",
)

get_or_create_application(
    reviewed_job,
    worker1_profile,
    status="accepted",
    message="Je peux faire le transport aujourd’hui.",
)

get_or_create_application(
    painting_job,
    worker2_profile,
    status="pending",
    message="J’ai déjà fait plusieurs petits travaux de peinture.",
)

get_or_create_application(
    wood_job,
    worker5_profile,
    status="pending",
    message="Je suis disponible avec mes gants et je peux aider rapidement.",
)


# =========================
# Generate matches for open jobs
# =========================

for job in db.query(JobPost).filter(
    JobPost.status == "open",
    JobPost.region == TEMISCAMING_REGION,
).all():
    generate_and_store_matches(
        db=db,
        job=job,
    )


# =========================
# Conversations + Messages
# =========================

conv_matched = get_or_create_conversation(
    matched_job,
    client2,
    worker1,
)

add_message(
    conv_matched,
    client2,
    "Bonjour Mathieu, est-ce que tu peux vraiment transporter une sécheuse aujourd’hui ?",
    is_read=False,
)

add_message(
    conv_matched,
    worker1,
    "Oui, je peux être là vers 16h30. J’ai des sangles aussi.",
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
    "Le terrain est accessible par l’entrée de côté.",
    is_read=False,
)

add_message(
    conv_progress,
    worker2,
    "Parfait, je suis en route. Je devrais arriver dans 20 minutes.",
    is_read=False,
)

conv_completed = get_or_create_conversation(
    completed_job,
    client3,
    worker3,
)

add_message(
    conv_completed,
    worker3,
    "Les boîtes sont toutes déplacées. J’ai laissé les plus fragiles dans le salon.",
    is_read=False,
)

add_message(
    conv_completed,
    client3,
    "Merci beaucoup, c’était vraiment apprécié.",
    is_read=False,
)

conv_reviewed = get_or_create_conversation(
    reviewed_job,
    client4,
    worker1,
)

add_message(
    conv_reviewed,
    client4,
    "Merci pour le transport, tout est arrivé en bon état.",
    is_read=True,
)

add_message(
    conv_reviewed,
    worker1,
    "Avec plaisir, merci pour la confiance.",
    is_read=True,
)


# =========================
# Reviews
# =========================

add_review(
    reviewed_job,
    client4,
    worker1,
    5,
    "Très fiable, ponctuel et bien équipé pour le transport.",
)

add_review(
    reviewed_job,
    worker1,
    client4,
    5,
    "Client clair, respectueux et facile à rejoindre.",
)

add_review(
    completed_job,
    client3,
    worker3,
    5,
    "Très bon service. Il est arrivé à l’heure et a travaillé rapidement.",
)

add_review(
    completed_job,
    worker3,
    client3,
    5,
    "Très bonne communication et instructions claires.",
)


db.close()

print("Seed complete!")
print("")
print("Test accounts:")
print("julie.gauthier@test.com / 123456")
print("martin.roy@test.com / 123456")
print("chantal.moreau@test.com / 123456")
print("luc.larouche@test.com / 123456")
print("mathieu.berube@test.com / 123456")
print("samuel.tremblay@test.com / 123456")
print("alexandre.cote@test.com / 123456")
print("nathalie.lavoie@test.com / 123456")
print("eric.morin@test.com / 123456")
print("caroline.dube@test.com / 123456")