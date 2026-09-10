import pandas as pd


def load_m5_product_demand(
    file_path: str,
    row_index: int = 0,
    number_of_days: int = 365
):
    """
    Load one item-store demand series from M5.

    Parameters
    ----------
    file_path:
        Path to sales_train_evaluation.csv

    row_index:
        Which product/store row to select.

    number_of_days:
        Number of demand days to return.
    """

    print("Loading M5 dataset...")

    df = pd.read_csv(file_path)

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