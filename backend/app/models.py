import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        # TiDB Cloud requires SSL connection. We add ssl_disabled based on environment
        # Local development usually doesn't need SSL, but TiDB does.
        ssl_ca = os.getenv('DB_SSL_CA')
        
        config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'port': os.getenv('DB_PORT', 3306)
        }

        if ssl_ca:
            config['ssl_ca'] = ssl_ca
            config['ssl_verify_cert'] = True
        
        connection = mysql.connector.connect(**config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def execute_query(query, params=None, fetch=False):
    conn = get_db_connection()
    if conn is None:
        raise Exception("Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        if fetch:
            result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.lastrowid if cursor.lastrowid else cursor.rowcount
        return result
    except Error as e:
        conn.rollback() # Rollback in case of error
        raise Exception(f"Database query error: {e}")
    finally:
        cursor.close()
        conn.close()

def execute_single(query, params=None):
    conn = get_db_connection()
    if conn is None:
        raise Exception("Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        result = cursor.fetchone()
        return result
    except Error as e:
        raise Exception(f"Database query error: {e}")
    finally:
        cursor.close()
        conn.close()
