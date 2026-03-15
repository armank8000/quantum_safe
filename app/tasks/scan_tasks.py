from app.celery_app import celery_app

@celery_app.task(bind=True, name="tasks.ping_asset")
def ping_asset(self, asset_id: int, url: str):
    """
    Placeholder task — just does a HEAD request.
    Day 4: replace with real sslyze TLS scan.
    """
    import httpx
    try:
        r = httpx.head(url, timeout=10, follow_redirects=True)
        return {
            "asset_id": asset_id,
            "url": url,
            "status_code": r.status_code,
            "ok": True
        }
    except Exception as e:
        return {
            "asset_id": asset_id,
            "url": url,
            "error": str(e),
            "ok": False
        }
