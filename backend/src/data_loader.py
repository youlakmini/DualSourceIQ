import pandas as pd


def load_m5_product_demand(
    file_path: str,
    row_index: int = 0,
    number_of_days: int = 365,
    sku: str = None
):
    print("Loading M5 dataset...")

    df = pd.read_csv(file_path)

    if sku:
        product_rows = df[df['id'] == sku]
        if len(product_rows) == 0:
            raise ValueError(f"SKU {sku} not found in M5 dataset.")
        product = product_rows.iloc[0]
    else:
        if row_index >= len(df):
            raise ValueError("row_index is larger than dataset size.")
        product = df.iloc[row_index]

    day_columns = [
        column
        for column in df.columns
        if column.startswith("d_")
    ]

    # Sort correctly: d_1, d_2, ..., d_1941
    day_columns = sorted(
        day_columns,
        key=lambda x: int(x.split("_")[1])
    )

    demand = (
        product[day_columns]
        .astype(int)
        .values
    )

    if number_of_days > len(demand):
        number_of_days = len(demand)

    demand = demand[-number_of_days:]

    product_info = {
        "id": product.get("id", "Unknown"),
        "item_id": product.get("item_id", "Unknown"),
        "dept_id": product.get("dept_id", "Unknown"),
        "cat_id": product.get("cat_id", "Unknown"),
        "store_id": product.get("store_id", "Unknown"),
        "state_id": product.get("state_id", "Unknown"),
    }

    return demand, product_info