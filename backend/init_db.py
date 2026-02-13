import mysql.connector
import os
import bcrypt
from dotenv import load_dotenv

load_dotenv()

def init_db():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        cursor = conn.cursor()
        
        # Hash passwords
        admin_password = "admin123"
        driver_password = "driver123"
        customer_password = "customer123"
        cashier_password = "cashier123"
        
        hashed_admin = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        hashed_driver = bcrypt.hashpw(driver_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        hashed_customer = bcrypt.hashpw(customer_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        hashed_cashier = bcrypt.hashpw(cashier_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Read schema.sql
        with open('../schema.sql', 'r') as f:
            schema = f.read()
            
        # Execute schema (split by semicolon)
        for statement in schema.split(';'):
            if statement.strip():
                if '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S2' in statement:
                    statement = statement.replace('$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S2', hashed_admin)
                cursor.execute(statement)

        # Add Driver
        cursor.execute("INSERT INTO users (username, password, role, full_name, phone) VALUES (%s, %s, %s, %s, %s)",
                       ('driver', hashed_driver, 'driver', 'Budi Driver', '628123456789'))

        # Add Customer
        cursor.execute("INSERT INTO users (username, password, role, full_name, phone) VALUES (%s, %s, %s, %s, %s)",
                       ('customer', hashed_customer, 'customer', 'Ani Customer', '628987654321'))

        # Add Cashier
        cursor.execute("INSERT INTO users (username, password, role, full_name, phone) VALUES (%s, %s, %s, %s, %s)",
                       ('cashier', hashed_cashier, 'cashier', 'Siti Kasir', '6281122334455'))
        
        conn.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    init_db()
