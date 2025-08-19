import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class GDPlayerService:
    """Service for integrating with gdplayer.vip streaming API"""
    
    BASE_URL = "https://gdplayer.vip/api/video"
    
    @staticmethod
    async def get_streaming_url(gdrive_id: str) -> str:
        """Get streaming URL from gdplayer.vip for a Google Drive file"""
        try:
            # Prepare request payload
            payload = {
                "file_id": gdrive_id,
                # Optional: Add domain restrictions for security
                "domains": "mfcnextgen.com,api.mfcnextgen.com"
            }
            
            logger.info(f"Calling gdplayer.vip API for file {gdrive_id}")
            
            # Make POST request to gdplayer.vip
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    GDPlayerService.BASE_URL,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    streaming_url = data.get("stream_url") or data.get("url")
                    
                    if streaming_url:
                        logger.info(f"Successfully got streaming URL from gdplayer.vip for {gdrive_id}: {streaming_url}")
                        return streaming_url
                    else:
                        logger.error(f"No streaming URL in gdplayer.vip response: {data}")
                        raise ValueError("No streaming URL in gdplayer.vip response")
                else:
                    logger.error(f"gdplayer.vip API error: {response.status_code} - {response.text}")
                    raise ValueError(f"gdplayer.vip API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Error calling gdplayer.vip API for {gdrive_id}: {str(e)}")
            raise
    
    @staticmethod
    async def get_streaming_url_with_fallback(gdrive_id: str) -> str:
        """Get streaming URL with fallback to direct Google Drive URL"""
        try:
            # Primary: Try gdplayer.vip
            return await GDPlayerService.get_streaming_url(gdrive_id)
        except Exception as e:
            logger.warning(f"gdplayer.vip failed for {gdrive_id}: {e}")
            
            # Fallback: Direct Google Drive URL (for debugging)
            fallback_url = f"https://drive.google.com/file/d/{gdrive_id}/preview"
            logger.info(f"Using fallback URL: {fallback_url}")
            return fallback_url
