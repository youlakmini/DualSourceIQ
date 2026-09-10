import pandas as pd
import numpy as np
import os

def load_and_preprocess_m5_data(data_dir, sample=True):
    """
    Loads and preprocesses the M5 Forecasting Accuracy dataset.
    """
    print("Loading datasets...")
    calendar = pd.read_csv(os.path.join(data_dir, 'calendar.csv'))
    sell_prices = pd.read_csv(os.path.join(data_dir, 'sell_prices.csv'))
    sales = pd.read_csv(os.path.join(data_dir, 'sales_train_validation.csv'))
    
    if sample:
        print("Sampling data (Store: CA_1, Category: HOBBIES)...")
        sales = sales[(sales['store_id'] == 'CA_1') & (sales['cat_id'] == 'HOBBIES')]
        sales = sales.head(100) # Further limit to 100 items for rapid prototyping
        
    print(f"Sales data shape after sampling: {sales.shape}")
    
    print("Melting sales data to time-series format...")
    id_vars = ['id', 'item_id', 'dept_id', 'cat_id', 'store_id', 'state_id']
    sales_melted = pd.melt(sales, id_vars=id_vars, var_name='d', value_name='sales')
    
    print("Merging calendar and price data...")
    sales_merged = pd.merge(sales_melted, calendar, on='d', how='left')
    sales_merged = pd.merge(sales_merged, sell_prices, on=['store_id', 'item_id', 'wm_yr_wk'], how='left')
    
    print(f"Merged dataset shape: {sales_merged.shape}")
    return sales_merged

if __name__ == "__main__":
    # Ensure correct path whether run from root or src directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'data', 'raw')
    
    df = load_and_preprocess_m5_data(data_dir, sample=True)
    
    # Save the sample for easier access later
    out_dir = os.path.join(base_dir, 'data', 'processed')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'sample_sales.csv')
    df.to_csv(out_file, index=False)
    print(f"Sample data saved to {out_file}")


