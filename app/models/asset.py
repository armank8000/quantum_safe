from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.sql import func
from app.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, index=True)
    url          = Column(String, nullable=False)
    ipv4         = Column(String)
    ipv6         = Column(String)
    asset_type   = Column(String, default="WebApp")  # WebApp, API, Server, VPN
    owner        = Column(String, default="IT")
    risk_level   = Column(String, default="Medium")  # Critical, High, Medium, Low
    pqc_status   = Column(String, default="Unknown")  # Elite, Standard, Legacy, Critical
    pqc_score    = Column(Float, default=0.0)
    is_shadow_it = Column(Boolean, default=False)
    is_false_positive = Column(Boolean, default=False)
    last_scanned = Column(DateTime(timezone=True))
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    notes        = Column(Text)

    def __repr__(self):
        return f""
