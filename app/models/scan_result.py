from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database import Base

class ScanResult(Base):
    __tablename__ = "scan_results"

    id             = Column(Integer, primary_key=True, index=True)
    asset_id       = Column(Integer, ForeignKey("assets.id"), index=True)
    scan_type      = Column(String)  # tls, nmap, pqc, ct_log
    tls_version    = Column(String)   # TLS 1.3, TLS 1.2, etc.
    cipher_suite   = Column(String)
    key_length     = Column(Integer)
    cert_authority = Column(String)
    cert_expiry    = Column(DateTime(timezone=True))
    is_pqc_ready   = Column(Boolean, default=False)
    hndl_score     = Column(Float, default=0.0)
    quantum_expiry_year = Column(Integer)
    raw_data       = Column(JSON)     # full sslyze/nmap output
    scan_status    = Column(String, default="pending")  # pending, running, done, failed
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
