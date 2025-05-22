# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import json, os, datetime

app = Flask(__name__)
CORS(app)

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
ORDERS_FILE = os.path.join(DATA_DIR, "orders.json")

def load(f, fallback):
    if os.path.exists(f):
        with open(f, encoding="utf-8") as fh:
            return json.load(fh)
    return fallback

def save(f, data):
    with open(f, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

#продукти
@app.route("/products", methods=["GET"])
def get_products():
    return jsonify(load(PRODUCTS_FILE, []))

@app.route("/products", methods=["POST"])
def add_product():
    user_role = request.headers.get("X-Role")
    if user_role != "admin":
        return jsonify({"msg": "Forbidden"}), 403

    products = load(PRODUCTS_FILE, [])
    new_product = request.get_json()
    new_product["id"] = (max([p["id"] for p in products]) + 1) if products else 1
    new_product.setdefault("popularity", 0)
    products.append(new_product)
    save(PRODUCTS_FILE, products)
    return jsonify(new_product), 201

@app.route("/products/<int:pid>", methods=["PUT", "DELETE"])
def modify_product(pid):
    user_role = request.headers.get("X-Role")
    if user_role != "admin":
        return jsonify({"msg": "Forbidden"}), 403

    products = load(PRODUCTS_FILE, [])
    idx = next((i for i, p in enumerate(products) if p["id"] == pid), -1)
    if idx == -1:
        return jsonify({"msg": "Not found"}), 404

    if request.method == "DELETE":
        products.pop(idx)
        save(PRODUCTS_FILE, products)
        return "", 204

    # PUT
    products[idx] = request.get_json()
    save(PRODUCTS_FILE, products)
    return jsonify(products[idx])

# реєстрація
@app.route("/register", methods=["POST"])
def register():
    users = load(USERS_FILE, [])
    data = request.get_json()
    if any(u["email"] == data["email"] for u in users):
        return jsonify({"msg": "email exists"}), 400
    users.append({**data, "role": "user"})
    save(USERS_FILE, users)
    return jsonify({"msg": "ok"}), 201

#авторизація
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    users = load(USERS_FILE, [])
    user = next((u for u in users if u["email"] == data["email"] and
                  u["password"] == data["password"]), None)
    if not user:
        return jsonify({"msg": "Такий коистувач не зареєстрований"}), 401
    return jsonify({"email": user["email"], "role": user["role"]})


if not os.path.exists(USERS_FILE):
    save(USERS_FILE, [{"email": "admin@shop.com", "password": "admin", "role": "admin"}])

#оформлення замовлення
@app.route("/cart", methods=["POST"])
def checkout():
    order_data = request.get_json()
    user_email = order_data.get("user_email")
    items = order_data.get("items", [])

    products = load(PRODUCTS_FILE, [])
    orders = load(ORDERS_FILE, [])

    enriched_items = []
    total = 0

    for item in items:
        # Знаходимо повну інформацію про товар
        product = next((p for p in products if p["id"] == item["id"]), None)
        if product:
            enriched_item = dict(product)  # копія
            enriched_item["quantity"] = item["quantity"]
            enriched_items.append(enriched_item)

            # Видаляємо " грн." перед підрахунком
            try:
                price_num = float(str(product["price"]).replace(" грн.", "").strip())
                total += price_num * item["quantity"]
            except ValueError:
                pass

    new_order = {
        "user_email": user_email,
        "items": enriched_items,
        "total": total,
        "order_id": len(orders) + 1,
        "date": datetime.datetime.utcnow().isoformat()
    }

    orders.append(new_order)
    save(ORDERS_FILE, orders)

    return jsonify({"msg": "saved", "order_id": new_order["order_id"]})


@app.route("/my-orders", methods=["GET"])
def get_user_orders():
    email = request.args.get("email")
    if not email:
        return jsonify({"msg": "Email is required"}), 400

    orders = load(ORDERS_FILE, [])
    user_orders = [o for o in orders if o["user_email"] == email]
    return jsonify(user_orders)



@app.route("/orders/<email>", methods=["GET"])
def get_orders_by_email(email):
    orders = load(ORDERS_FILE, [])
    user_orders = [o for o in orders if o["user_email"] == email]
    return jsonify(user_orders)

if __name__ == "__main__":
    app.run(debug=True)