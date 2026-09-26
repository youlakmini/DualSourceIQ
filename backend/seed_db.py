import sqlite3
import pandas as pd
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventory.db")
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'raw', 'sales_train_evaluation.csv')

def seed_database():
    print("Loading M5 Dataset...")
    df = pd.read_csv(DATA_PATH)
    
    df_ca1 = df[df['store_id'] == 'CA_1']
    
    hobbies = df_ca1[df_ca1['cat_id'] == 'HOBBIES'].head(5)
    foods = df_ca1[df_ca1['cat_id'] == 'FOODS'].head(5)
    household = df_ca1[df_ca1['cat_id'] == 'HOUSEHOLD'].head(5)
    
    selected_products = pd.concat([hobbies, foods, household])
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop and recreate table to add safety_stock
    cursor.execute("DROP TABLE IF EXISTS inventory")
    cursor.execute('''
    CREATE TABLE inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        on_hand_stock INTEGER DEFAULT 0,
        reorder_point INTEGER DEFAULT 50,
        safety_stock INTEGER DEFAULT 20,
        order_quantity INTEGER DEFAULT 100,
        holding_cost REAL DEFAULT 0.10,
        backorder_cost REAL DEFAULT 5.00
    )
    ''')
    
    print(f"Inserting {len(selected_products)} curated products into the database...")
    
    realistic_names = {
        'FOODS': ["Organic Fuji Apples", "Whole Wheat Bread", "Aged Cheddar Cheese", "Unsweetened Almond Milk", "Frozen Margherita Pizza"],
        'HOBBIES': ["Acrylic Paint Set (24 Colors)", "Chunky Knitting Yarn", "Model Airplane Kit", "Professional Watercolor Brushes", "Scrapbooking Paper Pack"],
        'HOUSEHOLD': ["Liquid Laundry Detergent", "Ultra-Absorbent Paper Towels", "Lemon Scented Dish Soap", "Heavy Duty Trash Bags", "Streak-Free Glass Cleaner"]
    }
    
    name_counters = {'FOODS': 0, 'HOBBIES': 0, 'HOUSEHOLD': 0}
    
    for _, row in selected_products.iterrows():
        sku = row['id']
        cat = row['cat_id']
        
        # Get a realistic name from the list
        name = realistic_names[cat][name_counters[cat]]
        name_counters[cat] += 1
        
        if cat == 'FOODS':
            on_hand = 180
            reorder = 300
            safety = 150
            qty = 150
            holding = 0.50 
            backorder = 15.00 
        elif cat == 'HOBBIES':
            on_hand = 520
            reorder = 300
            safety = 150
            qty = 50
            holding = 0.05
            backorder = 2.00
        else: # HOUSEHOLD
            on_hand = 250
            reorder = 500
            safety = 250
            qty = 100
            holding = 0.10
            backorder = 5.00
            
        cursor.execute('''
            INSERT INTO inventory (sku, name, category, on_hand_stock, reorder_point, safety_stock, order_quantity, holding_cost, backorder_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (sku, name, cat, on_hand, reorder, safety, qty, holding, backorder))
        
    conn.commit()
    conn.close()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed_database()
