CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`user_id`),
  KEY `fk_2` (`order_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

INSERT INTO notifications VALUES (1, 60001, 2, 'Status Pesanan #ORD-2 Diperbarui', 'Pesanan Anda kini berstatus: Delivery.', 0, 2026-02-12 05:48:02);
INSERT INTO notifications VALUES (2, 30003, 1, 'Status Pesanan #ORD-1 Diperbarui', 'Pesanan Anda kini berstatus: Completed.', 0, 2026-02-12 05:50:21);
INSERT INTO notifications VALUES (3, 60001, 3, 'Status Pesanan #ORD-3 Diperbarui', 'Pesanan Anda kini berstatus: Washing.', 0, 2026-02-12 05:56:01);
INSERT INTO notifications VALUES (30001, 30003, 30001, 'Status Pesanan #ORD-30001 Diperbarui', 'Pesanan Anda kini berstatus: Ironing.', 0, 2026-02-12 21:57:03);


CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `service_id` int NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`order_id`),
  KEY `fk_2` (`service_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90001;

INSERT INTO order_items VALUES (1, 1, 5, 1.00, 25000.00);
INSERT INTO order_items VALUES (2, 2, 1, 1.00, 15000.00);
INSERT INTO order_items VALUES (3, 3, 4, 3.00, 165000.00);
INSERT INTO order_items VALUES (30001, 30001, 30002, 2.00, 170000.00);
INSERT INTO order_items VALUES (60001, 60001, 30002, 1.00, 85000.00);
INSERT INTO order_items VALUES (60002, 60001, 5, 1.00, 25000.00);


CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `cashier_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL DEFAULT '0',
  `status` enum('pending','washing','drying','ironing','ready_for_delivery','delivery','completed') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid') DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`customer_id`),
  KEY `fk_2` (`cashier_id`),
  KEY `fk_3` (`driver_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90001;

INSERT INTO orders VALUES (1, 30003, NULL, 30002, 25000.00, 'completed', 'paid', 'cod', 2026-02-12 05:42:49, 2026-02-12 05:50:42);
INSERT INTO orders VALUES (2, 60001, NULL, 30002, 15000.00, 'completed', 'paid', 'cod', 2026-02-12 05:45:16, 2026-02-12 05:54:45);
INSERT INTO orders VALUES (3, 60001, NULL, NULL, 165000.00, 'washing', 'paid', 'bank', 2026-02-12 05:45:54, 2026-02-12 05:56:29);
INSERT INTO orders VALUES (30001, 30003, NULL, 30002, 170000.00, 'ready_for_delivery', 'unpaid', 'cod', 2026-02-12 21:55:36, 2026-02-12 21:57:05);
INSERT INTO orders VALUES (60001, 60001, 30001, NULL, 110000.00, 'pending', 'paid', 'unpaid', 2026-02-12 23:16:12, 2026-02-12 23:17:24);


CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `unit` enum('kg','pcs') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

INSERT INTO services VALUES (1, 'Cuci Komplit (Cuci Kering Setrika)', 'kg', 15000.00, 2026-02-11 13:18:47);
INSERT INTO services VALUES (2, 'Cuci Kering', 'kg', 10000.00, 2026-02-11 13:18:47);
INSERT INTO services VALUES (3, 'Setrika Saja', 'kg', 10000.00, 2026-02-11 13:18:47);
INSERT INTO services VALUES (4, 'Bedcover Besar', 'pcs', 50000.00, 2026-02-11 13:18:47);
INSERT INTO services VALUES (5, 'Bedcover Sedang', 'pcs', 25000.00, 2026-02-11 13:18:47);
INSERT INTO services VALUES (30002, 'PAKET KILAT CEPAT', 'kg', 85000.00, 2026-02-12 21:50:47);


CREATE TABLE `tracking_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`order_id`),
  KEY `fk_2` (`updated_by`),
  CONSTRAINT `fk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

INSERT INTO tracking_logs VALUES (1, 2, 'ready_for_delivery', 'Driver assigned: 30002', 30001, 2026-02-12 05:47:44);
INSERT INTO tracking_logs VALUES (2, 2, 'delivery', NULL, 30001, 2026-02-12 05:48:01);
INSERT INTO tracking_logs VALUES (3, 1, 'ready_for_delivery', 'Driver assigned: 30002', 1, 2026-02-12 05:50:14);
INSERT INTO tracking_logs VALUES (4, 1, 'completed', NULL, 1, 2026-02-12 05:50:19);
INSERT INTO tracking_logs VALUES (5, 2, 'completed', 'Order delivered to customer', 30002, 2026-02-12 05:54:47);
INSERT INTO tracking_logs VALUES (6, 3, 'washing', NULL, 1, 2026-02-12 05:56:00);
INSERT INTO tracking_logs VALUES (30001, 30001, 'ironing', NULL, 1, 2026-02-12 21:57:02);
INSERT INTO tracking_logs VALUES (30002, 30001, 'ready_for_delivery', 'Driver assigned: 30002', 1, 2026-02-12 21:57:06);


CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier','driver','customer') NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=120001;

INSERT INTO users VALUES (1, 'admin', '$2b$12$vWanMlSK2iZuVT5FC/R3ruJkBaaE4Mo5lIrkhn3/PJQMTeBGLjbZy', 'admin', 'Admin Steamline', NULL, 2026-02-11 13:18:45);
INSERT INTO users VALUES (30001, 'kasir1', '$2b$12$vWanMlSK2iZuVT5FC/R3ruJkBaaE4Mo5lIrkhn3/PJQMTeBGLjbZy', 'cashier', 'Siti Kasir', NULL, 2026-02-12 04:19:25);
INSERT INTO users VALUES (30002, 'driver1', '$2b$12$vWanMlSK2iZuVT5FC/R3ruJkBaaE4Mo5lIrkhn3/PJQMTeBGLjbZy', 'driver', 'Budi Driver', NULL, 2026-02-12 04:19:25);
INSERT INTO users VALUES (30003, 'customer1', '$2b$12$vWanMlSK2iZuVT5FC/R3ruJkBaaE4Mo5lIrkhn3/PJQMTeBGLjbZy', 'customer', 'Ani Customer', NULL, 2026-02-12 04:19:25);
INSERT INTO users VALUES (60001, 'andi', '$2b$12$MkBExn2sqoxbU2rweZl8neyc.GsUFIMbmHC70xxuGrprqCWKXPvpG', 'customer', 'andi nugroho', '+685316065960', 2026-02-12 05:43:46);
INSERT INTO users VALUES (90001, 'alex', '$2b$12$7Jl8SiLPpjtokCfSksc5MehEfqb2ohEN1Ny/XAOdbZ8E2yxOvh472', 'driver', 'Alex', '+68987654321', 2026-02-12 21:59:21);


