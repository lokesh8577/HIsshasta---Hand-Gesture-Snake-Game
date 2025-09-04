# build.py
import os
import json
from dotenv import load_dotenv

def generate_frontend_config():
    """Generate frontend config.js from environment variables"""
    load_dotenv()
    
    config_template = """// Auto-generated config file
window.FIREBASE_API_KEY = "{api_key}";
window.FIREBASE_AUTH_DOMAIN = "{auth_domain}";
window.FIREBASE_DATABASE_URL = "{database_url}";
window.FIREBASE_PROJECT_ID = "{project_id}";
window.FIREBASE_STORAGE_BUCKET = "{storage_bucket}";
window.FIREBASE_MESSAGING_SENDER_ID = "{messaging_sender_id}";
window.FIREBASE_APP_ID = "{app_id}";
"""
    
    config_content = config_template.format(
        api_key=os.getenv('FIREBASE_API_KEY', ''),
        auth_domain=os.getenv('FIREBASE_AUTH_DOMAIN', ''),
        database_url=os.getenv('FIREBASE_DATABASE_URL', ''),
        project_id=os.getenv('FIREBASE_PROJECT_ID', ''),
        storage_bucket=os.getenv('FIREBASE_STORAGE_BUCKET', ''),
        messaging_sender_id=os.getenv('FIREBASE_MESSAGING_SENDER_ID', ''),
        app_id=os.getenv('FIREBASE_APP_ID', '')
    )
    
    with open('static/js/config.js', 'w') as f:
        f.write(config_content)
    
    print("Frontend config file generated")

if __name__ == '__main__':
    generate_frontend_config()