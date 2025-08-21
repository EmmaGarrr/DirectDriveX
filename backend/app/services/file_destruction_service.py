from datetime import datetime
from typing import Optional

from app.core.config import settings
from app.db.mongodb import db


class FileDestructionService:
    """Centralized service to destroy file records and underlying storage objects.

    This is used for automated cleanups such as memory_limit_exceeded.
    """

    async def destroy_file(self, file_id: str, reason: str = "memory_limit_exceeded") -> None:
        """Mark file as deleted and attempt to remove storage objects if present.

        Always marks the file record as deleted. Attempts remote deletion only if
        identifiers are present (e.g., Google Drive file id and account id).
        """
        try:
            file_doc: Optional[dict] = db.files.find_one({"_id": file_id})
            if not file_doc:
                return

            # If already deleted, skip
            if file_doc.get("deleted_at") or file_doc.get("status") == "deleted":
                return

            deletion_errors: list[str] = []

            # Attempt Google Drive deletion if we have identifiers
            gdrive_id = file_doc.get("gdrive_id")
            gdrive_account_id = file_doc.get("gdrive_account_id")
            if gdrive_id and gdrive_account_id:
                try:
                    from app.services.google_drive_account_service import GoogleDriveAccountService
                    from app.services.google_drive_service import delete_gdrive_file

                    account = await GoogleDriveAccountService.get_account_by_id(gdrive_account_id)
                    if account:
                        await delete_gdrive_file(gdrive_id, account.to_config())
                        # Optionally refresh account stats (best-effort)
                        try:
                            await GoogleDriveAccountService._update_account_quota(account)
                        except Exception:
                            pass
                except Exception as e:  # best-effort
                    deletion_errors.append(f"gdrive_delete_failed: {e}")

            # Mark as deleted in DB regardless of storage deletion outcome
            update_doc = {
                "status": "deleted",
                "deleted_at": datetime.utcnow(),
                "deletion_reason": reason,
            }
            if deletion_errors:
                update_doc["deletion_errors"] = deletion_errors

            db.files.update_one({"_id": file_id}, {"$set": update_doc})
        except Exception:
            # Do not raise to callers; deletion is best-effort in failure paths
            pass


# Global instance
file_destruction_service = FileDestructionService()


