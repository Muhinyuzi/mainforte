"""add distance_km to matches

Revision ID: 6949358d1e6b
Revises: 5ab52bdccd93
Create Date: 2026-05-14 17:30:20.191835
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6949358d1e6b"
down_revision: Union[str, Sequence[str], None] = "5ab52bdccd93"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "matches",
        sa.Column("distance_km", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("matches", "distance_km")