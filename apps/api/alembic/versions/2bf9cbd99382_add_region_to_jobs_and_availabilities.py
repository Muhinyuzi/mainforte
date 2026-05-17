"""add region to jobs and availabilities

Revision ID: 2bf9cbd99382
Revises: c1a35f0d2940
Create Date: 2026-05-17 09:01:19.099061
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2bf9cbd99382"
down_revision: Union[str, Sequence[str], None] = "c1a35f0d2940"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "availabilities",
        sa.Column("region", sa.String(), nullable=True),
    )

    op.add_column(
        "job_posts",
        sa.Column("region", sa.String(), nullable=True),
    )

    op.execute(
        """
        UPDATE availabilities
        SET region = 'Temiscaming'
        WHERE region IS NULL
        """
    )

    op.execute(
        """
        UPDATE job_posts
        SET region = 'Temiscaming'
        WHERE region IS NULL
        """
    )

    op.alter_column(
        "availabilities",
        "region",
        existing_type=sa.String(),
        nullable=False,
    )

    op.alter_column(
        "job_posts",
        "region",
        existing_type=sa.String(),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column("job_posts", "region")
    op.drop_column("availabilities", "region")