import pandas as pd
import numpy as np
import os

def generate_features(df):
    """
    Generates structured features for the demand forecasting model.
    Based on the Structured Feature Set table in the project proposal.
    """
    print("Generating features...")
    
    # Sort data by item and date
    # Convert 'd' to an integer to sort properly
    df['d_num'] = df['d'].str.extract('(\d+)').astype(int)
    df = df.sort_values(by=['store_id', 'item_id', 'd_num'])
    
    # 1. Demand History (Lags)
    print("Creating lag features...")
    lag_days = [1, 7, 14, 28]
    for lag in lag_days:
        df[f'lag_{lag}'] = df.groupby(['store_id', 'item_id'])['sales'].shift(lag)
        
    # 2. Demand Trend (Rolling windows)
    print("Creating rolling window features...")
    windows = [7, 28]
    for win in windows:
        # Rolling mean and std on the lag 1 to avoid data leakage
        rolling = df.groupby(['store_id', 'item_id'])['lag_1'].rolling(window=win)
        df[f'rolling_mean_{win}'] = rolling.mean().reset_index(level=[0,1], drop=True)
        df[f'rolling_std_{win}'] = rolling.std().reset_index(level=[0,1], drop=True)
        
    # 3. Price Features
    print("Creating price features...")
    df['price_change'] = df.groupby(['store_id', 'item_id'])['sell_price'].diff()
    df['price_change_pct'] = df.groupby(['store_id', 'item_id'])['sell_price'].pct_change()
    
    # 4. Calendar & Events (Already merged, just need to ensure correct formats if needed)
    # The M5 calendar file provides wday, month, year, event_name_1, etc.
    # We will encode categorical variables
    print("Encoding categorical variables...")
    cat_cols = ['event_name_1', 'event_type_1', 'event_name_2', 'event_type_2']
    for col in cat_cols:
        df[col] = df[col].fillna('None')
        df[col] = df[col].astype('category').cat.codes
        
    # SNAP columns are already binary, product/store hierarchy are present as categorical IDs
    # Encode IDs
    id_cols = ['item_id', 'dept_id', 'cat_id', 'store_id', 'state_id']
    for col in id_cols:
        df[col] = df[col].astype('category').cat.codes
        
    print(f"Feature generation complete. Final shape: {df.shape}")
    return df

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_file = os.path.join(base_dir, 'data', 'processed', 'sample_sales.csv')
    
    if os.path.exists(input_file):
        df = pd.read_csv(input_file)
        df_features = generate_features(df)
        
        output_file = os.path.join(base_dir, 'data', 'processed', 'features_sales.csv')
        df_features.to_csv(output_file, index=False)
        print(f"Features saved to {output_file}")
    else:
        print(f"Input file {input_file} not found. Run data_prep.py first.")

