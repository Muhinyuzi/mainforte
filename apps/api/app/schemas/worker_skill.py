from pydantic import BaseModel


class WorkerSkillCreateSchema(BaseModel):
    category_id: int
    experience_level: str


class WorkerSkillSchema(BaseModel):
    id: int

    worker_id: int

    category_id: int

    experience_level: str

    class Config:
        from_attributes = True