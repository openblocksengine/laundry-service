from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import bcrypt
from app.models import execute_query, execute_single

api = Blueprint('api', __name__)

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = execute_single("SELECT * FROM users WHERE username = %s", (username,))
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        access_token = create_access_token(
            identity=str(user['id']), 
            additional_claims={'role': user['role']}
        )
        return jsonify(access_token=access_token, user={'id': user['id'], 'role': user['role'], 'username': user['username'], 'full_name': user['full_name']}), 200
    
    return jsonify({"msg": "Bad username or password"}), 401

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    full_name = data.get('full_name')
    phone = data.get('phone')

    existing_user = execute_single("SELECT id FROM users WHERE username = %s", (username,))
    if existing_user:
        return jsonify({"msg": "Username already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    execute_query("INSERT INTO users (username, password, role, full_name, phone) VALUES (%s, %s, 'customer', %s, %s)",
                  (username, hashed_password, full_name, phone))
    
    return jsonify({"msg": "Customer registered successfully"}), 201

@api.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')

    try:
        if role == 'customer':
            total_orders = execute_single("SELECT COUNT(*) as count FROM orders WHERE customer_id = %s", (user_id,))['count']
            pending_orders = execute_single("SELECT COUNT(*) as count FROM orders WHERE customer_id = %s AND status NOT IN ('completed')", (user_id,))['count']
            total_spent = execute_single("SELECT SUM(total_price) as total FROM orders WHERE customer_id = %s AND payment_status = 'paid'", (user_id,))['total'] or 0
            
            recent_activities_raw = execute_query("""
                SELECT id, status, created_at, 'Me' as customer_name
                FROM orders 
                WHERE customer_id = %s
                ORDER BY created_at DESC
                LIMIT 5
            """, (user_id,), fetch=True)
            
            recent_activities = []
            for activity in recent_activities_raw:
                activity['created_at'] = activity['created_at'].isoformat() if activity['created_at'] else None
                recent_activities.append(activity)

            return jsonify({
                "stats": {
                    "total_orders": total_orders,
                    "pending_orders": pending_orders,
                    "total_spent": float(total_spent),
                    "points": int(total_orders) * 10 
                },
                "recent_activities": recent_activities,
                "role": "customer"
            })

        if role == 'driver':
            assigned_tasks = execute_single("SELECT COUNT(*) as count FROM orders WHERE status = 'ready_for_delivery'")['count']
            active_deliveries = execute_single("SELECT COUNT(*) as count FROM orders WHERE driver_id = %s AND status = 'delivery'", (user_id,))['count']
            completed_deliveries = execute_single("SELECT COUNT(*) as count FROM orders WHERE driver_id = %s AND status = 'completed'", (user_id,))['count']
            
            recent_activities_raw = execute_query("""
                SELECT id, status, updated_at as created_at, 'Delivery' as customer_name
                FROM orders 
                WHERE driver_id = %s OR status = 'ready_for_delivery'
                ORDER BY created_at DESC
                LIMIT 5
            """, (user_id,), fetch=True)
            
            recent_activities = []
            for activity in recent_activities_raw:
                activity['created_at'] = activity['created_at'].isoformat() if activity['created_at'] else None
                recent_activities.append(activity)

            return jsonify({
                "stats": {
                    "assigned_tasks": assigned_tasks,
                    "active_deliveries": active_deliveries,
                    "completed_deliveries": completed_deliveries,
                    "total_points": completed_deliveries * 50
                },
                "recent_activities": recent_activities,
                "role": "driver"
            })

        # Admin/Cashier stats (Global)
        total_orders = execute_single("SELECT COUNT(*) as count FROM orders")['count']
        pending_orders = execute_single("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('completed')")['count']
        total_revenue = execute_single("SELECT SUM(total_price) as total FROM orders WHERE payment_status = 'paid'")['total'] or 0
        total_customers = execute_single("SELECT COUNT(*) as count FROM users WHERE role = 'customer'")['count']
        
        recent_activities_raw = execute_query("""
            SELECT o.id, o.status, o.created_at, u.full_name as customer_name
            FROM orders o
            LEFT JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        """, fetch=True)
        
        recent_activities = []
        for activity in recent_activities_raw:
            activity['created_at'] = activity['created_at'].isoformat() if activity['created_at'] else None
            recent_activities.append(activity)

        # Chart data: orders per day for last 7 days
        chart_data_raw = execute_query("""
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM orders 
            GROUP BY DATE(created_at) 
            ORDER BY date ASC 
            LIMIT 7
        """, fetch=True)
        
        chart_data = [{"date": row['date'].strftime('%Y-%m-%d'), "count": row['count']} for row in chart_data_raw]

        return jsonify({
            "stats": {
                "total_orders": total_orders,
                "pending_orders": pending_orders,
                "total_revenue": float(total_revenue),
                "total_customers": total_customers
            },
            "recent_activities": recent_activities,
            "chart_data": chart_data,
            "role": role
        })
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return jsonify({"msg": "Internal server error getting dashboard stats"}), 500

@api.route('/services', methods=['GET'])
def get_services():
    services = execute_query("SELECT * FROM services", fetch=True)
    return jsonify(services)

@api.route('/services', methods=['POST'])
@jwt_required()
def add_service():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin only"}), 403
    data = request.get_json()
    try:
        execute_query("INSERT INTO services (name, unit, price) VALUES (%s, %s, %s)", 
                    (data['name'], data['unit'], data['price']))
        return jsonify({"msg": "Service added"}), 201
    except Exception as e:
        print(f"Error adding service: {e}")
        return jsonify({"msg": "Internal server error adding service"}), 500

@api.route('/services/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin only"}), 403
    data = request.get_json()
    try:
        execute_query("UPDATE services SET name = %s, unit = %s, price = %s WHERE id = %s", 
                    (data['name'], data['unit'], data['price'], service_id))
        return jsonify({"msg": "Service updated"})
    except Exception as e:
        print(f"Error updating service: {e}")
        return jsonify({"msg": "Internal server error updating service"}), 500

@api.route('/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin only"}), 403
    try:
        execute_query("DELETE FROM services WHERE id = %s", (service_id,))
        return jsonify({"msg": "Service deleted"})
    except Exception as e:
        print(f"Error deleting service: {e}")
        return jsonify({"msg": "Internal server error deleting service. It might be in use."}), 500

@api.route('/customers', methods=['GET'])
@jwt_required()
def get_customers():
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'cashier']:
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        customers = execute_query("SELECT id, username, full_name, phone FROM users WHERE role = 'customer'", fetch=True)
        return jsonify(customers)
    except Exception as e:
        print(f"Error getting customers: {e}")
        return jsonify({"msg": "Internal server error getting customers"}), 500

@api.route('/drivers', methods=['GET'])
@jwt_required()
def get_drivers():
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'cashier']:
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        drivers = execute_query("SELECT id, username, full_name FROM users WHERE role = 'driver'", fetch=True)
        return jsonify(drivers)
    except Exception as e:
        print(f"Error getting drivers: {e}")
        return jsonify({"msg": "Internal server error getting drivers"}), 500

@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin only"}), 403
    try:
        users = execute_query("SELECT id, username, full_name, role, phone FROM users", fetch=True)
        return jsonify(users)
    except Exception as e:
        print(f"Error getting users: {e}")
        return jsonify({"msg": "Internal server error getting users"}), 500

@api.route('/users/<int:id>', methods=['PUT'])
@jwt_required()
def update_user_role(id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin only"}), 403
    
    data = request.get_json()
    new_role = data.get('role')
    
    if new_role not in ['admin', 'cashier', 'driver', 'customer']:
        return jsonify({"msg": "Invalid role"}), 400
        
    try:
        execute_query("UPDATE users SET role = %s WHERE id = %s", (new_role, id))
        return jsonify({"msg": "User role updated successfully"})
    except Exception as e:
        print(f"Error updating user role: {e}")
        return jsonify({"msg": "Internal server error updating user role"}), 500

@api.route('/orders/<int:order_id>/assign-driver', methods=['PUT'])
@jwt_required()
def assign_driver(order_id):
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'cashier']:
        return jsonify({"msg": "Unauthorized"}), 403
    data = request.get_json()
    driver_id = data.get('driver_id')
    try:
        execute_query("UPDATE orders SET driver_id = %s, status = 'ready_for_delivery' WHERE id = %s", (driver_id, order_id))
        execute_query("INSERT INTO tracking_logs (order_id, status, updated_by, description) VALUES (%s, 'ready_for_delivery', %s, %s)", 
                    (order_id, get_jwt_identity(), f"Driver assigned: {driver_id}"))
        return jsonify({"msg": "Driver assigned successfully"})
    except Exception as e:
        print(f"Error assigning driver: {e}")
        return jsonify({"msg": "Internal server error assigning driver"}), 500

@api.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'cashier']:
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        orders = execute_query("""
            SELECT o.*, u.full_name as customer_name 
            FROM orders o 
            LEFT JOIN users u ON o.customer_id = u.id 
            ORDER BY o.created_at DESC
        """, fetch=True)
        # Convert datetime objects to string
        for order in orders:
            if order['created_at']:
                order['created_at'] = order['created_at'].isoformat()
            if order['updated_at']:
                order['updated_at'] = order['updated_at'].isoformat()
        return jsonify(orders)
    except Exception as e:
        print(f"Error getting orders: {e}")
        return jsonify({"msg": "Internal server error getting orders"}), 500

@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')
    
    if role == 'customer':
        customer_id = user_id
        cashier_id = None
    else:
        customer_id = data.get('customer_id') or 1
        cashier_id = user_id
    
    payment_method = data.get('payment_method')
    
    try:
        order_id = execute_query("INSERT INTO orders (customer_id, cashier_id, status, payment_method) VALUES (%s, %s, 'pending', %s)", 
                                (customer_id, cashier_id, payment_method))
        
        if not order_id:
            return jsonify({"msg": "Failed to create order"}), 500

        total_price = 0
        for item in data['items']:
            service = execute_single("SELECT price FROM services WHERE id = %s", (item['service_id'],))
            if not service:
                # Rollback previously inserted order if service not found
                execute_query("DELETE FROM orders WHERE id = %s", (order_id,))
                return jsonify({"msg": f"Service with ID {item['service_id']} not found."}), 400

            subtotal = float(service['price']) * float(item['quantity'])
            execute_query("INSERT INTO order_items (order_id, service_id, quantity, subtotal) VALUES (%s, %s, %s, %s)",
                          (order_id, item['service_id'], item['quantity'], subtotal))
            total_price += subtotal
            
        execute_query("UPDATE orders SET total_price = %s WHERE id = %s", (total_price, order_id))
        
        return jsonify({"msg": "Order created", "order_id": order_id}), 201
    except Exception as e:
        print(f"Error creating order: {e}")
        return jsonify({"msg": "Internal server error during order creation"}), 500

@api.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('status')
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')
    
    if role not in ['admin', 'cashier', 'driver']:
        return jsonify({"msg": "Unauthorized"}), 403
    
    if role == 'driver' and new_status not in ['delivery', 'completed']:
        return jsonify({"msg": "Drivers can only set status to 'delivery' or 'completed' status"}), 403
    
    try:
        # Get customer_id for notification
        order_customer = execute_single("SELECT customer_id FROM orders WHERE id = %s", (order_id,))
        if not order_customer:
            return jsonify({"msg": "Order not found"}), 404
        customer_id = order_customer['customer_id']
        
        execute_query("UPDATE orders SET status = %s WHERE id = %s", (new_status, order_id))
        execute_query("INSERT INTO tracking_logs (order_id, status, updated_by) VALUES (%s, %s, %s)",
                    (order_id, new_status, user_id))

        # Create notification for the customer
        if customer_id:
            notification_title = f"Status Pesanan #ORD-{order_id} Diperbarui"
            notification_message = f"Pesanan Anda kini berstatus: {new_status.replace('_', ' ').capitalize()}."
            execute_query(
                "INSERT INTO notifications (user_id, order_id, title, message) VALUES (%s, %s, %s, %s)",
                (customer_id, order_id, notification_title, notification_message)
            )
        
        return jsonify({"msg": "Status updated"})
    except Exception as e:
        print(f"Error updating order status: {e}")
        return jsonify({"msg": "Internal server error during status update"}), 500

@api.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_detail(order_id):
    try:
        order = execute_single("""
            SELECT o.*, u.full_name as customer_name, u.phone as customer_phone
            FROM orders o 
            LEFT JOIN users u ON o.customer_id = u.id 
            WHERE o.id = %s
        """, (order_id,))
        
        if not order:
            return jsonify({"msg": "Order not found"}), 404
            
        items = execute_query("""
            SELECT oi.*, s.name as service_name, s.unit, s.price as unit_price
            FROM order_items oi
            JOIN services s ON oi.service_id = s.id
            WHERE oi.order_id = %s
        """, (order_id,), fetch=True)

        # Convert datetime objects to string
        if order['created_at']:
            order['created_at'] = order['created_at'].isoformat()
        if order['updated_at']:
            order['updated_at'] = order['updated_at'].isoformat()
        
        return jsonify({"order": order, "items": items})
    except Exception as e:
        print(f"Error getting order detail: {e}")
        return jsonify({"msg": "Internal server error getting order details"}), 500

@api.route('/orders/<int:order_id>/pay', methods=['POST'])
@jwt_required()
def process_payment(order_id):
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'cashier']:
        return jsonify({"msg": "Unauthorized"}), 403
        
    data = request.get_json()
    amount_paid = data.get('amount_paid')
    
    try:
        order = execute_single("SELECT total_price FROM orders WHERE id = %s", (order_id,))
        if not order:
            return jsonify({"msg": "Order not found"}), 404
            
        change = float(amount_paid) - float(order['total_price'])
        if change < 0:
            return jsonify({"msg": "Insufficient payment amount"}), 400
            
        execute_query("UPDATE orders SET payment_status = 'paid' WHERE id = %s", (order_id,))
        
        return jsonify({
            "msg": "Payment successful",
            "total": float(order['total_price']),
            "paid": float(amount_paid),
            "change": change
        })
    except Exception as e:
        print(f"Error processing payment: {e}")
        return jsonify({"msg": "Internal server error processing payment"}), 500

@api.route('/driver/tasks', methods=['GET'])
@jwt_required()
def get_driver_tasks():
    claims = get_jwt()
    if claims.get('role') not in ['driver', 'admin']:
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        tasks = execute_query("""
            SELECT o.*, u.full_name as customer_name, u.phone as customer_phone
            FROM orders o 
            LEFT JOIN users u ON o.customer_id = u.id 
            WHERE o.status IN ('ready_for_delivery', 'delivery')
            ORDER BY o.created_at DESC
        """, fetch=True)
        # Convert datetime objects to string
        for task in tasks:
            if task['created_at']:
                task['created_at'] = task['created_at'].isoformat()
            if task['updated_at']:
                task['updated_at'] = task['updated_at'].isoformat()
        return jsonify(tasks)
    except Exception as e:
        print(f"Error getting driver tasks: {e}")
        return jsonify({"msg": "Internal server error getting driver tasks"}), 500

@api.route('/orders/<int:order_id>/pickup', methods=['PUT'])
@jwt_required()
def pickup_order(order_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') not in ['driver', 'admin']:
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        execute_query("UPDATE orders SET status = 'delivery', driver_id = %s WHERE id = %s", (user_id, order_id))
        execute_query("INSERT INTO tracking_logs (order_id, status, updated_by, description) VALUES (%s, 'delivery', %s, 'Order picked up by driver')", 
                    (order_id, user_id))
        return jsonify({"msg": "Order picked up"})
    except Exception as e:
        print(f"Error picking up order: {e}")
        return jsonify({"msg": "Internal server error picking up order"}), 500

@api.route('/orders/<int:order_id>/deliver', methods=['PUT'])
@jwt_required()
def deliver_order(order_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') not in ['driver', 'admin']:
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        execute_query("UPDATE orders SET status = 'completed' WHERE id = %s", (order_id,))
        execute_query("INSERT INTO tracking_logs (order_id, status, updated_by, description) VALUES (%s, 'completed', %s, 'Order delivered to customer')", 
                    (order_id, user_id))
        return jsonify({"msg": "Order delivered"})
    except Exception as e:
        print(f"Error delivering order: {e}")
        return jsonify({"msg": "Internal server error delivering order"}), 500

@api.route('/customer/notifications', methods=['GET'])
@jwt_required()
def get_customer_notifications():
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        notifications = execute_query(
            "SELECT id, order_id, title, message, is_read, created_at FROM notifications WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,), fetch=True
        )
        
        # Convert datetime objects to string
        for notification in notifications:
            if notification['created_at']:
                notification['created_at'] = notification['created_at'].isoformat()
                
        return jsonify(notifications)
    except Exception as e:
        print(f"Error getting customer notifications: {e}")
        return jsonify({"msg": "Internal server error getting customer notifications"}), 500

@api.route('/customer/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    try:
        # Ensure the notification belongs to the user
        notification_check = execute_single("SELECT id FROM notifications WHERE id = %s AND user_id = %s", (notification_id, user_id))
        if not notification_check:
            return jsonify({"msg": "Notification not found or unauthorized"}), 404
            
        execute_query("UPDATE notifications SET is_read = TRUE WHERE id = %s", (notification_id,))
        return jsonify({"msg": "Notification marked as read"})
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return jsonify({"msg": "Internal server error marking notification as read"}), 500

@api.route('/customer/notifications/unread_count', methods=['GET'])
@jwt_required()
def get_unread_notification_count():
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        count = execute_single("SELECT COUNT(*) as count FROM notifications WHERE user_id = %s AND is_read = FALSE", (user_id,))['count']
        return jsonify({"count": count})
    except Exception as e:
        print(f"Error getting unread notification count: {e}")
        return jsonify({"msg": "Internal server error getting unread notification count"}), 500

@api.route('/customer/orders', methods=['GET'])
@jwt_required()
def get_customer_orders():
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({"msg": "Unauthorized"}), 403
    try:
        orders = execute_query("""
            SELECT o.*, 
                   (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o 
            WHERE o.customer_id = %s
            ORDER BY o.created_at DESC
        """, (user_id,), fetch=True)
        # Convert datetime objects to string
        for order in orders:
            if order['created_at']:
                order['created_at'] = order['created_at'].isoformat()
            if order['updated_at']:
                order['updated_at'] = order['updated_at'].isoformat()
        return jsonify(orders)
    except Exception as e:
        print(f"Error getting customer orders: {e}")
        return jsonify({"msg": "Internal server error getting customer orders"}), 500

@api.route('/tracking/<int:order_id>', methods=['GET'])
def track_order(order_id):
    try:
        order = execute_single("SELECT o.*, u.full_name as customer_name FROM orders o JOIN users u ON o.customer_id = u.id WHERE o.id = %s", (order_id,))
        if not order:
            return jsonify({"msg": "Order not found"}), 404
        
        logs = execute_query("SELECT * FROM tracking_logs WHERE order_id = %s ORDER BY created_at DESC", (order_id,), fetch=True)
        # Convert datetime objects to string
        for log in logs:
            if log['created_at']:
                log['created_at'] = log['created_at'].isoformat()
        return jsonify({"order": order, "logs": logs})
    except Exception as e:
        print(f"Error tracking order: {e}")
        return jsonify({"msg": "Internal server error tracking order"}), 500
