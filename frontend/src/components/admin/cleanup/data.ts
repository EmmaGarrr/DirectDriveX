import { CleanupResult } from "@/types/cleanup";

export const mockCleanupResult: CleanupResult = {
  message: "Storage cleanup successful",
  mode: "soft",
  files_marked_deleted: 5678,
  files_hard_deleted: 0,
  batches_deleted: 23,
  gdrive: {
    summary: {
      deleted: 1234,
      errors: 2,
    },
    per_account: {
      "account1@gmail.com": {
        deleted: 456,
        errors: 1,
        message: "OK",
      },
      "account2@gmail.com": {
        deleted: 789,
        errors: 0,
        message: "OK",
      },
      "account3@gmail.com": {
        deleted: 0,
        errors: 1,
        message: "API connection failed",
      },
    },
  },
};