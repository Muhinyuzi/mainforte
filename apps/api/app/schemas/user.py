from pydantic import BaseModel, EmailStr


class UserMeSchema(BaseModel):
    id: int

    email: EmailStr

    full_name: str

    phone: str | None = None

    role: str

    can_work: bool

    can_hire: bool

    is_active: bool

    # PROFILE

    bio: str | None = None

    city: str | None = None

    skills: str | None = None

    hourly_rate: float | None = None

    profile_picture_url: str | None = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):

    bio: str | None = None

    city: str | None = None

    skills: str | None = None

    hourly_rate: float | None = None

    profile_picture_url: str | None = None