from datetime import datetime, timezone

def utcnow() -> datetime:
    """Fecha y hora actual en UTC"""
    return datetime.now(timezone.utc)