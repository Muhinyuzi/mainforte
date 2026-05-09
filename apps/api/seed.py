from datetime import datetime, timedelta

from app.db import SessionLocal

from app.models.user import User
from app.models.category import Category
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.models.availability import Availability
from app.models.job_post import JobPost

from app.core.security import hash_password

db = SessionLocal()

print("Seeding MainForte...")

# =========================
# Categories
# =========================

categories = [
    ("Déménagement", "demenagement"),
    ("Ménage", "menage"),
    ("Jardinage", "jardinage"),
    ("Peinture", "peinture"),
]

created_categories = []

for name, slug in categories:

    existing = db.query(Category).filter(
        Category.slug == slug
    ).first()

    if existing:
        created_categories.append(existing)
        continue

    category = Category(
        name=name,
        slug=slug,
        description=f"Catégorie {name}",
        is_active=True,
    )

    db.add(category)

    db.commit()
    db.refresh(category)

    created_categories.append(category)

# =========================
# Workers
# =========================

workers = []

for i in range(1, 6):

    email = f"worker{i}@test.com"

    existing = db.query(User).filter(
        User.email == email
    ).first()

    if existing:
        workers.append(existing)
        continue

    user = User(
        email=email,
        hashed_password=hash_password("123456"),
        full_name=f"Worker {i}",
        role="worker",
    )

    db.add(user)

    db.commit()
    db.refresh(user)

    workers.append(user)

# =========================
# Worker Profiles
# =========================

for i, worker in enumerate(workers):

    existing_profile = db.query(
        WorkerProfile
    ).filter(
        WorkerProfile.user_id == worker.id
    ).first()

    if existing_profile:
        continue

    profile = WorkerProfile(
        user_id=worker.id,
        bio="Travailleur disponible",
        city="Ville-Marie",
        region="Temiscaming",
        transport_available=True,
        hourly_rate=20 + i * 5,
        is_verified=True,
    )

    db.add(profile)

    db.commit()
    db.refresh(profile)

    # =====================
    # Skill
    # =====================

    skill = WorkerSkill(
        worker_id=profile.id,
        category_id=created_categories[
            i % len(created_categories)
        ].id,
        experience_level="experienced",
    )

    db.add(skill)

    # =====================
    # Availability
    # =====================

    availability = Availability(
        worker_id=profile.id,
        city="Ville-Marie",
        availability_type="full_day",
        start_datetime=datetime.now(),
        end_datetime=datetime.now()
        + timedelta(days=7),
        status="available",
    )

    db.add(availability)

    db.commit()

# =========================
# Client
# =========================

client = db.query(User).filter(
    User.email == "client@test.com"
).first()

if not client:

    client = User(
        email="client@test.com",
        hashed_password=hash_password(
            "123456"
        ),
        full_name="Main Client",
        role="client",
    )

    db.add(client)

    db.commit()
    db.refresh(client)

# =========================
# Jobs
# =========================

job_titles = [
    "Besoin aide déménagement",
    "Nettoyage maison",
    "Tondre pelouse",
    "Peinture garage",
]

for i in range(8):

    title = (
        f"{job_titles[i % 4]} #{i}"
    )

    existing_job = db.query(JobPost).filter(
        JobPost.title == title
    ).first()

    if existing_job:
        continue

    job = JobPost(
        client_id=client.id,

        category_id=created_categories[
            i % len(created_categories)
        ].id,

        title=title,

        description="Besoin urgent aujourd'hui",

        city="Ville-Marie",

        address_optional="Rue principale",

        needed_at=datetime.now()
        + timedelta(hours=i),

        duration_estimate_hours=4,

        urgency="today",

        budget_type="hourly",

        budget_amount=25 + i * 5,

        status="open",
    )

    db.add(job)

db.commit()

print("Seed complete!")