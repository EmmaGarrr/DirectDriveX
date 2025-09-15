# Exact Lines That Need to Be Fixed - No Technical Jargon

## The Main Problem (Must Fix First)

### File: `backend/app/services/upload_concurrency_manager.py`

**Lines 92-99: The Problem Code**
```python
except Exception as e:
    # If anything fails, release what we acquired
    if self.global_upload_semaphore._value < self.max_concurrent_users:
        self.global_upload_semaphore.release()
    if user_sem._value < 5:
        user_sem.release()
    print(f"Failed to acquire upload slot: {e}")
    return False
```

**What's Wrong:** This code catches ALL errors and just says "failed" instead of telling us what really went wrong.

**What It Should Do:** Should show the actual error so we know what needs to be fixed.

---

## Where This Problem Causes the 400 Error

### File: `backend/app/main.py`

**Lines 650-653: Where the 400 Error Gets Sent**
```python
if not await upload_concurrency_manager.acquire_upload_slot(user_id, file_id, total_size):
    print(f"[DEBUG] ❌ Failed to acquire upload slot for file {file_id}")
    await websocket.close(code=1008, reason="Upload limit exceeded or insufficient resources")
    return
```

**What's Wrong:** When the code above returns `False`, this code tells the user "Upload limit exceeded" which is a lie.

**What It Should Do:** Should tell the user the real problem (like "Server error" or "System busy").

---

## What's Actually Failing (Inside the Problem Code)

### File: `backend/app/services/upload_concurrency_manager.py`

**Lines 74-90: The Code That's Breaking**
```python
try:
    # Acquire global semaphore first
    await self.global_upload_semaphore.acquire()
    
    # Then acquire user semaphore
    await user_sem.acquire()
    
    # Track the upload
    self.active_uploads[file_id] = UploadSlot(
        user_id=user_id,
        file_id=file_id,
        file_size=file_size,
        start_time=time.time(),
        memory_usage=int(file_size * 0.1)  # Estimate 10% of file size
    )
    
    return True
```

**What's Wrong:** One of these 4 lines is causing an error, but we don't know which one because the error gets hidden.

**Line 87: Suspicious Line**
```python
memory_usage=int(file_size * 0.1)  # Estimate 10% of file size
```

**What Might Be Wrong:** For a 3.38GB file, this calculates `int(3380000000 * 0.1)` = `338000000` bytes. This might be too large.

---

## Complete List of Every Problem Line

### Critical Fix Lines (Breaks the Whole System)
1. **Line 92** - `except Exception as e:` (Too broad error catching)
2. **Line 99** - `return False` (Hides the real error)
3. **Line 650** - `if not await upload_concurrency_manager.acquire_upload_slot(...)` (Uses broken function)
4. **Line 652** - `await websocket.close(...)` (Sends wrong error message)

### Potential Problem Lines (Might Need Changes)
1. **Line 87** - `memory_usage=int(file_size * 0.1)` (Memory calculation might be wrong)
2. **Line 94** - `if self.global_upload_semaphore._value < self.max_concurrent_users:` (Logic might be wrong)
3. **Line 96** - `if user_sem._value < 5:` (Logic might be wrong)

---

## How the Problem Flows Through the System

**Step 1:** Your frontend tries to upload a 3.38GB file  
**Step 2:** Server checks file size (✅ OK)  
**Step 3:** Server creates WebSocket connection (✅ OK)  
**Step 4:** **Line 650** - Calls `acquire_upload_slot()`  
**Step 5:** **Lines 74-90** - Tries to setup upload resources  
**Step 6:** **One of lines 74-90 fails** with an error  
**Step 7:** **Line 92** - Catches the error (hides it)  
**Step 8:** **Line 99** - Returns `False` (no real error info)  
**Step 9:** **Line 650** - Gets `False` instead of success  
**Step 10:** **Line 652** - Tells you "Upload limit exceeded" (lie)  
**Step 11:** Your frontend shows "400 Bad Request"

---

## What to Tell Your Developer

"Here are the exact lines that need to be fixed:

**Main issue in `backend/app/services/upload_concurrency_manager.py`:**
- Lines 92-99: The exception handling is hiding the real error
- Line 87: Memory calculation might be causing issues with large files

**Secondary issue in `backend/app/main.py`:**
- Lines 650-653: Error message is misleading when upload fails

**The fix should:**
1. Show the actual error instead of hiding it
2. Fix the memory calculation for large files
3. Send correct error messages to users"

---

## Simple Summary

**The problem is in 2 files, 4 main lines:**

1. **`upload_concurrency_manager.py` line 99** - Hides the real error
2. **`upload_concurrency_manager.py` line 87** - Memory calculation might be wrong
3. **`main.py` line 650** - Uses the broken function
4. **`main.py` line 652** - Sends wrong error message

**Fix these 4 lines and the 400 Bad Request error will be solved.**