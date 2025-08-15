import logging
import os
from datetime import datetime

def setup_parallel_upload_logger():
    """Setup dedicated logger for parallel upload system"""
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
    os.makedirs(log_dir, exist_ok=True)
    
    # Create logger
    logger = logging.getLogger("parallel_upload")
    logger.setLevel(logging.DEBUG)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # Create file handler
    log_file = os.path.join(log_dir, "parallel_upload.log")
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    
    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(formatter)
    
    # Add handler to logger
    logger.addHandler(file_handler)
    
    return logger

# Global logger instance
parallel_upload_logger = setup_parallel_upload_logger()
