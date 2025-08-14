#!/usr/bin/env python3
"""
Test file to verify WebSocket cancellation logic
"""

import asyncio

async def test_cancellation_logic():
    """Test the cancellation detection logic"""
    
    # Simulate the cancellation detection
    cancellation_detected = False
    
    async def check_cancellation():
        nonlocal cancellation_detected
        while not cancellation_detected:
            try:
                await asyncio.sleep(0.1)  # Check every 100ms for testing
                # Simulate finding a cancelled status
                if asyncio.get_event_loop().time() > 0.5:  # After 500ms
                    cancellation_detected = True
                    print("✅ Background task detected cancellation, stopping upload")
                    break
            except Exception as e:
                print(f"Error in cancellation check: {e}")
                break
    
    # Start the background cancellation checker
    cancellation_task = asyncio.create_task(check_cancellation())
    
    try:
        # Simulate upload loop
        for i in range(10):
            if cancellation_detected:
                print(f"✅ Cancellation detected at iteration {i}, stopping upload immediately")
                break
            
            print(f"Processing chunk {i}...")
            await asyncio.sleep(0.1)  # Simulate chunk processing
            
        print("Upload loop completed")
        
    finally:
        # Cancel the background task
        cancellation_task.cancel()
        try:
            await cancellation_task
        except asyncio.CancelledError:
            print("✅ Background task cancelled successfully")
        
        print("Test completed")

if __name__ == "__main__":
    print("Testing WebSocket cancellation logic...")
    asyncio.run(test_cancellation_logic())
