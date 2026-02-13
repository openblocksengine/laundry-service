DROP DATABASE IF EXISTS laundry_db;
CREATE DATABASE IF NOT EXISTS laundry_db;
USE laundry_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier', 'driver', 'customer') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit ENUM('kg', 'pcs') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    cashier_id INT,
    driver_id INT,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'washing', 'drying', 'ironing', 'ready_for_delivery', 'delivery', 'completed') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS tracking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);


-- Seed initial admin user (password: admin123)
-- In real app, password should be hashed. Using plain for now or I will hash it in the setup script.
INSERT INTO users (username, password, role, full_name) VALUES
('admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S2', 'admin', 'Admin Steamline');

INSERT INTO users (username, password, role, full_name, phone) VALUES
-- Kasir: kasir1 / kasir123
INSERT INTO users (username, password, role, full_name, phone) VALUES
('kasir1', '$2b$12$R.S7HovU.tEosS1/45oJeuH2p7Wp6MOn3YjE8LID.D6X8Y7oD9v9G', 'cashier', 'Budi Kasir', '081122223333');

-- Driver: driver1 / driver123
INSERT INTO users (username, password, role, full_name, phone) VALUES
('driver1', '$2b$12$q7n05Aptn.VjXWvR6C6CxeXW6Y6KzO2U0.Qz5W7V6O8v6O9P2v8vG', 'driver', 'Agus Driver Delivery', '081144445555');

-- Customer: customer1 / customer123
INSERT INTO users (username, password, role, full_name, phone) VALUES
('customer1', '$2b$12$f8N05Aptn.VjXWvR6C6CxeXW6Y6KzO2U0.Qz5W7V6O8v6O9P2v8vG', 'customer', 'Rina Pelanggan', '081166667777');

INSERT INTO services (name, unit, price) VALUES
('Cuci Komplit (Cuci Kering Setrika)', 'kg', 15000),
('Cuci Kering', 'kg', 10000),
('Setrika Saja', 'kg', 5000),
('Bedcover Besar', 'pcs', 55000),
('Bedcover Sedang', 'pcs', 25000);
