import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.config import settings


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def save_upload(file: UploadFile, folder: str) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, detail={"code": "INVALID_FILE_TYPE", "message": "Invalid file type"})

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(400, detail={"code": "FILE_TOO_LARGE", "message": "File too large"})

    ext = (file.filename or "").split(".")[-1] or "bin"
    filename = f"{uuid.uuid4()}.{ext}"
    dest = Path(settings.UPLOAD_DIR) / folder / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(contents)
    return f"/uploads/{folder}/{filename}"
