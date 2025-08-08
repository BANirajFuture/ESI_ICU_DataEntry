import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = "https://xtfomokiryxzpziwndkv.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Zm9tb2tpcnl4enB6aXduZGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODI5MDcsImV4cCI6MjA2OTQ1ODkwN30.9oFI_a_drnsNlWlJwIpe1SVOuIwwj0HSeA0SxuSjq_Q"
    
    # For production, use environment variables:
    # SUPABASE_URL = os.getenv('SUPABASE_URL')
    # SUPABASE_KEY = os.getenv('SUPABASE_KEY')
