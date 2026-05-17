"""add has_unread_activity to job_post

Revision ID: c1a35f0d2940
Revises: ad0ca57201e7
Create Date: 2026-05-17 08:02:56.665140

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c1a35f0d2940"
down_revision: Union[str, Sequence[str], None] = "ad0ca57201e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "job_posts",
        sa.Column(
            "has_unread_activity",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.alter_column(
        "job_posts",
        "has_unread_activity",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column(
        "job_posts",
        "has_unread_activity",
    )