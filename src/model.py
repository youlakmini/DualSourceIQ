import pandas as pd
import numpy as np
import os
import xgboost as xgb
from sklearn.metrics import mean_squared_error, mean_absolute_error
from sklearn.model_selection import train_test_split
import pickle

def train_forecasting_model(data_path):
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Drop rows with NaNs (which were created due to lag/rolling window operations)
    df = df.dropna()
    
    # Features and target
    # We predict 'sales'
    features = [
        col for col in df.columns if col not in [
            'id', 'date', 'd', 'sales', 'wm_yr_wk', 'weekday' # ID and unencoded date cols
        ]
    ]
    target = 'sales'
    
    X = df[features]
    y = df[target]
    
    print(f"Training data shape: {X.shape}")
    
    # Time-based split: last 28 days for validation
    # 'd_num' represents the day number. 
    max_day = X['d_num'].max()
    val_days = 28
    
    X_train = X[X['d_num'] <= (max_day - val_days)]
    y_train = y[X['d_num'] <= (max_day - val_days)]
    X_val = X[X['d_num'] > (max_day - val_days)]
    y_val = y[X['d_num'] > (max_day - val_days)]
    
    print(f"Training on {X_train.shape[0]} rows, validating on {X_val.shape[0]} rows.")
    
    model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        random_state=42,
        early_stopping_rounds=10
    )
    
    print("Training XGBoost model...")
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )
    
    print("Evaluating model...")
    preds = model.predict(X_val)
    rmse = np.sqrt(mean_squared_error(y_val, preds))
    mae = mean_absolute_error(y_val, preds)
    print(f"Validation RMSE: {rmse:.4f}")
    print(f"Validation MAE: {mae:.4f}")
    
    # We also need the variance of predictions for our risk modeling.
    # A simple approach for now is to calculate the variance of the residuals on the validation set.
    residuals = y_val - preds
    error_variance = np.var(residuals)
    print(f"Forecast Error Variance: {error_variance:.4f}")
    
    return model, error_variance

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'processed', 'features_sales.csv')
    
    if os.path.exists(data_path):
        model, err_var = train_forecasting_model(data_path)
        
        # Save model
        models_dir = os.path.join(base_dir, 'experiments')
        os.makedirs(models_dir, exist_ok=True)
        model_file = os.path.join(models_dir, 'xgboost_forecast.pkl')
        with open(model_file, 'wb') as f:
            pickle.dump({'model': model, 'error_variance': err_var}, f)
        print(f"Model saved to {model_file}")
    else:
        print(f"File not found: {data_path}. Run feature_engineering.py first.")
