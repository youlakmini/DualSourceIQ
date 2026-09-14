import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventory.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create inventory table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        on_hand_stock INTEGER DEFAULT 0,
        reorder_point INTEGER DEFAULT 50,
        order_quantity INTEGER DEFAULT 100,
        holding_cost REAL DEFAULT 0.10,
        backorder_cost REAL DEFAULT 5.00
    )
    ''')
    
    # Insert some seed data if empty
    cursor.execute('SELECT COUNT(*) FROM inventory')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
        INSERT INTO inventory (sku, name, on_hand_stock, reorder_point, order_quantity, holding_cost, backorder_cost)
        VALUES 
        ('HOBBIES_1_001_CA_1', 'Hobbies Item 1', 100, 50, 100, 0.10, 5.00),
        ('FOODS_3_827_CA_1', 'Foods Item 827', 250, 100, 200, 0.05, 10.00)
        ''')
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
