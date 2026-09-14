import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

url = "postgresql+psycopg://postgres.ervqulqcyhggknrtrijq:%2A222%2A2%23Arpit@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

try:
    engine = create_engine(url)
    connection = engine.connect()
    print("Connection successful!")
    connection.close()
except Exception as e:
    print(f"Error: {e}")
