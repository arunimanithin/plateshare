-- ============================================
-- PlateShare Database Schema
-- MySQL Database: plateshare_db
-- ============================================

CREATE DATABASE IF NOT EXISTS railway;
USE railway;

-- ============================================
-- Users Table
-- ============================================
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS food_listings;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    role ENUM('admin', 'donor', 'recipient') NOT NULL DEFAULT 'donor',
    org_name VARCHAR(150) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    latitude DECIMAL(10, 8) DEFAULT NULL,
    longitude DECIMAL(11, 8) DEFAULT NULL,
    is_approved TINYINT(1) DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    profile_pic VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Food Listings Table
-- ============================================
CREATE TABLE food_listings (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    quantity VARCHAR(100) NOT NULL,
    food_type VARCHAR(50) NOT NULL,
    pickup_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    expiry_time DATETIME NOT NULL,
    donor_id INT NOT NULL,
    status ENUM('available', 'requested', 'completed') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Claims Table
-- ============================================
CREATE TABLE claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    recipient_id INT NOT NULL,
    status ENUM('reserved', 'collected') DEFAULT 'reserved',
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_id) REFERENCES food_listings(food_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Seed Users
-- Passwords are all: password123
-- ============================================
INSERT INTO users (user_id, full_name, email, password_hash, phone, role, org_name, address, city, latitude, longitude, is_approved, is_active, profile_pic, created_at, updated_at) VALUES
(2, 'Admin User', 'admin@demo.com', '$2b$10$9mO4G81SC3f85wADVBIL7eZJ2N.NC4dCQTZ5t0WbVxz3RH6s3Bssm', NULL, 'admin', 'PlateShare Admin', NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-03-08 22:02:25', '2026-03-08 22:18:19'),
(3, 'Spice Restaurant', 'donor@demo.com', '$2b$10$neFwZ/Q0UrxE.nTinoozmuKVBx0mAN9EdwIy02u7uJ12sRMXuKQO.', '9068570234', 'donor', 'Spice Restaurant', NULL, 'Kochi', NULL, NULL, 1, 1, NULL, '2026-03-08 22:02:25', '2026-03-08 22:18:50'),
(4, 'Green Hearts', 'ngo@demo.com', '$2b$10$c07Fky9BU3dPwFlVqNKuquG7bqDCdElVQZppVTGusvfJRPduTrRDm', '7012657634', 'recipient', 'Green Hearts', NULL, 'Kochi', NULL, NULL, 1, 1, NULL, '2026-03-08 22:02:25', '2026-03-08 22:19:06');

-- ============================================
-- Seed Food Listings (donor_id = 3)
-- ============================================
INSERT INTO food_listings (title, description, quantity, food_type, pickup_address, city, expiry_time, donor_id, status) VALUES
('Vegetable Biryani', 'Freshly prepared vegetable biryani with aromatic spices and herbs. Serves multiple people.', '20 plates', 'Cooked Meals', 'Spice Restaurant, MG Road', 'Kochi', DATE_ADD(NOW(), INTERVAL 6 HOUR), 3, 'available'),
('Bread Packs', 'Assorted fresh bread packs including whole wheat, multigrain, and white bread.', '30 packs', 'Bakery Items', 'Spice Restaurant, MG Road', 'Kochi', DATE_ADD(NOW(), INTERVAL 12 HOUR), 3, 'available'),
('Rice Meals', 'Complete rice meals with dal, sambar, rasam, and mixed vegetable curry.', '15 meals', 'Cooked Meals', 'Spice Restaurant, Marine Drive', 'Kochi', DATE_ADD(NOW(), INTERVAL 4 HOUR), 3, 'available'),
('Sandwich Boxes', 'Assorted sandwich boxes with fresh vegetables and cheese. Great for quick distribution.', '25 boxes', 'Snacks', 'Spice Restaurant, Broadway', 'Kochi', DATE_ADD(NOW(), INTERVAL 8 HOUR), 3, 'available'),
('Fruit Salad Bowls', 'Fresh seasonal fruit salad bowls with a mix of tropical fruits.', '12 bowls', 'Fruits & Vegetables', 'Spice Restaurant, Fort Kochi', 'Kochi', DATE_ADD(NOW(), INTERVAL 3 HOUR), 3, 'available'),
('Chicken Curry Meals', 'Spicy chicken curry with steamed rice and papad. Freshly cooked.', '18 meals', 'Cooked Meals', 'Spice Restaurant, Edappally', 'Kochi', DATE_ADD(NOW(), INTERVAL 5 HOUR), 3, 'available');
