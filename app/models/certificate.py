from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id            = Column(Integer, primary_key=True, index=True)
    asset_id      = Column(Integer, ForeignKey("assets.id"), index=True)
    common_name   = Column(String)
    subject       = Column(Text)
    issuer        = Column(String)
    serial_number = Column(String)
    sha_fingerprint = Column(String, unique=True)
    valid_from    = Column(DateTime(timezone=True))
    valid_to      = Column(DateTime(timezone=True))
    key_size      = Column(Integer)
    key_type      = Column(String)  # RSA, EC
    is_expired    = Column(Boolean, default=False)
    is_self_signed = Column(Boolean, default=False)
    detected_at   = Column(DateTime(timezone=True), server_default=func.now())
