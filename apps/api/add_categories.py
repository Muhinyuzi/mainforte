from app.db import SessionLocal
from app.models.category import Category

db = SessionLocal()

new_categories = [
    ("Mécanique automobile", "mecanique-automobile"),
    ("Changement de pneus", "changement-pneus"),
    ("Soudure", "soudure"),
    ("Menuiserie", "menuiserie"),
    ("Homme à tout faire", "homme-a-tout-faire"),
    ("Aide à domicile", "aide-domicile"),
]

for name, slug in new_categories:
    existing = db.query(Category).filter(Category.slug == slug).first()

    if not existing:
        db.add(Category(
            name=name,
            slug=slug,
            description=f"Services de type {name}",
            is_active=True,
        ))

db.commit()
db.close()

print("Nouvelles catégories ajoutées sans écraser les profils.")