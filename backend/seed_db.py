import sqlite3
import pandas as pd
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventory.db")
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'raw', 'sales_train_evaluation.csv')

def seed_database():
    print("Loading M5 Dataset...")
    df = pd.read_csv(DATA_PATH)
    
    # We want a mix of HOBBIES, FOODS, and HOUSEHOLD from the CA_1 store to match our current setup
    df_ca1 = df[df['store_id'] == 'CA_1']
    
    # Select 5 of each category
    hobbies = df_ca1[df_ca1['cat_id'] == 'HOBBIES'].head(5)
    foods = df_ca1[df_ca1['cat_id'] == 'FOODS'].head(5)
    household = df_ca1[df_ca1['cat_id'] == 'HOUSEHOLD'].head(5)
    
    selected_products = pd.concat([hobbies, foods, household])
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM inventory")
    
    print(f"Inserting {len(selected_products)} curated products into the database...")
    
    for _, row in selected_products.iterrows():
        sku = row['id']
        name = row['item_id'].replace('_', ' ').title()
        
        # Give them slightly different default parameters based on category to make the demo interesting
        if row['cat_id'] == 'FOODS':
            on_hand = 200
            reorder = 100
            qty = 150
            holding = 0.50  # higher holding cost for perishable
            backorder = 15.00 # high backorder cost (customers get angry if food is missing)
        elif row['cat_id'] == 'HOBBIES':
            on_hand = 50
            reorder = 20
            qty = 50
            holding = 0.05
            backorder = 2.00
        else: # HOUSEHOLD
            on_hand = 100
            reorder = 40
            qty = 100
            holding = 0.10
            backorder = 5.00
            
        cursor.execute('''
            INSERT INTO inventory (sku, name, on_hand_stock, reorder_point, order_quantity, holding_cost, backorder_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (sku, name, on_hand, reorder, qty, holding, backorder))
        
    conn.commit()
    conn.close()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed_database()
