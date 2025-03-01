from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

suggestion_likes = Table(
    "suggestion_likes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("suggestion_id", Integer, ForeignKey("suggestions.id"), primary_key=True)
)

suggestion_dislikes = Table(
    "suggestion_dislikes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("suggestion_id", Integer, ForeignKey("suggestions.id"), primary_key=True)
)

class Suggestion(Base):
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="suggestions")
    liked_by = relationship("User", secondary=suggestion_likes, backref="liked_suggestions")
    disliked_by = relationship("User", secondary=suggestion_dislikes, backref="disliked_suggestions")