-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 27, 2026 at 05:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `warehouse_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`) VALUES
(1, 'Stationery', '2026-06-18 08:01:10'),
(2, 'Electronics', '2026-06-18 08:01:10'),
(3, 'Pantry', '2026-06-18 08:01:10'),
(4, 'General', '2026-06-18 08:19:36');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `par_level` int(11) DEFAULT 5,
  `max_level` int(11) DEFAULT 50,
  `price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `sales_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `supplier_id`, `stock`, `par_level`, `max_level`, `price`, `cost`, `sales_count`, `created_at`) VALUES
(1, 'A4 Paper Bundle', 1, 1, 11, 10, 50, 15.00, 10.00, 24, '2026-06-18 08:01:10'),
(2, 'HP Ink Cartridge', 2, 2, 10, 5, 50, 45.00, 30.00, 33, '2026-06-18 08:01:10'),
(3, 'Coffee Beans 1kg', 3, 3, 9, 8, 50, 25.00, 15.00, 29, '2026-06-18 08:01:10'),
(4, 'Premier', 4, 4, 11, 5, 50, 0.14, 0.09, 33, '2026-06-18 08:19:36'),
(5, 'coffee', 4, 5, 0, 5, 50, 2.00, 2.50, 55, '2026-06-18 08:20:46'),
(6, 'sunday', 4, 6, 52, 25, 50, 5.00, 5.99, 4, '2026-06-19 08:06:52');

-- --------------------------------------------------------

--
-- Table structure for table `sales_items`
--

CREATE TABLE `sales_items` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_items`
--

INSERT INTO `sales_items` (`id`, `transaction_id`, `product_id`, `quantity`, `price_per_unit`) VALUES
(1, 1, 3, 2, 25.00),
(2, 1, 2, 1, 45.00),
(3, 1, 1, 1, 15.00),
(4, 2, 1, 14, 15.00),
(5, 3, 2, 12, 45.00),
(6, 4, 5, 25, 2.00),
(7, 5, 5, 4, 2.00),
(8, 5, 4, 13, 0.14),
(9, 5, 3, 5, 25.00),
(10, 5, 2, 8, 45.00),
(11, 5, 1, 9, 15.00),
(12, 6, 5, 6, 2.00),
(13, 6, 4, 10, 0.14),
(14, 6, 3, 15, 25.00),
(15, 6, 2, 12, 45.00),
(16, 7, 5, 5, 2.00),
(17, 7, 3, 3, 25.00),
(18, 8, 6, 2, 5.00),
(19, 8, 4, 2, 0.14),
(20, 9, 4, 8, 0.14),
(21, 10, 5, 15, 2.00),
(22, 10, 6, 1, 5.00),
(23, 10, 3, 4, 25.00),
(24, 11, 6, 1, 5.00);

-- --------------------------------------------------------

--
-- Table structure for table `sales_transactions`
--

CREATE TABLE `sales_transactions` (
  `id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_transactions`
--

INSERT INTO `sales_transactions` (`id`, `total_amount`, `transaction_date`) VALUES
(1, 110.00, '2026-06-18 08:02:06'),
(2, 210.00, '2026-06-18 08:03:15'),
(3, 540.00, '2026-06-18 08:21:04'),
(4, 50.00, '2026-06-18 08:21:16'),
(5, 629.82, '2026-06-19 06:10:01'),
(6, 928.40, '2026-06-19 06:23:10'),
(7, 85.00, '2026-07-22 06:38:07'),
(8, 10.28, '2026-07-22 06:39:38'),
(9, 1.12, '2026-07-27 03:47:48'),
(10, 135.00, '2026-07-27 04:28:40'),
(11, 5.00, '2026-07-27 04:47:19');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `created_at`) VALUES
(1, 'Global Office Supplies', '2026-06-18 08:01:10'),
(2, 'Tech Hub Co.', '2026-06-18 08:01:10'),
(3, 'Brew Masters', '2026-06-18 08:01:10'),
(4, '', '2026-06-18 08:19:36'),
(5, 'mm', '2026-06-18 08:20:46'),
(6, 'may', '2026-06-19 08:06:52');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `log_type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `log_type`, `message`, `created_at`) VALUES
(1, 'RESTOCK', 'Added 16 units to Coffee Beans 1kg', '2026-06-18 08:01:43'),
(2, 'RESTOCK', 'Added 10 units to HP Ink Cartridge', '2026-06-18 08:01:45'),
(3, 'SALE', 'Order completed: $110.00', '2026-06-18 08:02:06'),
(4, 'SALE', 'Order completed: $210.00', '2026-06-18 08:03:15'),
(5, 'RESTOCK', 'Added 1 units to Coffee Beans 1kg', '2026-06-18 08:06:06'),
(6, 'RESTOCK', 'Added 1 units to HP Ink Cartridge', '2026-06-18 08:06:09'),
(7, 'RESTOCK', 'Added 20 units to A4 Paper Bundle', '2026-06-18 08:09:13'),
(8, 'INVENTORY', 'Registered new product: jidfoijfd', '2026-06-18 08:19:36'),
(9, 'INVENTORY', 'Registered new product: coffee', '2026-06-18 08:20:46'),
(10, 'SALE', 'Order completed: $540.00', '2026-06-18 08:21:04'),
(11, 'SALE', 'Order completed: $50.00', '2026-06-18 08:21:16'),
(12, 'RESTOCK', 'Added 10 units to coffee', '2026-06-18 08:52:16'),
(13, 'RESTOCK', 'Added 10 units to HP Ink Cartridge', '2026-06-18 08:52:18'),
(14, 'SALE', 'Order completed: $629.82', '2026-06-19 06:10:01'),
(15, 'RESTOCK', 'Added 10 units to jidfoijfd', '2026-06-19 06:12:18'),
(16, 'RESTOCK', 'Added 10 units to HP Ink Cartridge', '2026-06-19 06:12:21'),
(17, 'SALE', 'Order completed: $928.40', '2026-06-19 06:23:10'),
(18, 'RESTOCK', 'Added 10 units to coffee', '2026-06-19 08:05:16'),
(19, 'RESTOCK', 'Added 16 units to Coffee Beans 1kg', '2026-06-19 08:05:18'),
(20, 'RESTOCK', 'Added 10 units to jidfoijfd', '2026-06-19 08:05:20'),
(21, 'RESTOCK', 'Added 10 units to HP Ink Cartridge', '2026-06-19 08:05:23'),
(22, 'INVENTORY', 'Registered new product: sunday', '2026-06-19 08:06:52'),
(23, 'RESTOCK', 'Added 6 units to sunday', '2026-06-19 08:07:26'),
(24, 'SALE', 'Order completed: $85.00', '2026-07-22 06:38:07'),
(25, 'RESTOCK', 'Added 10 units to coffee', '2026-07-22 06:38:37'),
(26, 'SALE', 'Order completed: $10.28', '2026-07-22 06:39:38'),
(27, 'SALE', 'Order completed: $1.12', '2026-07-27 03:47:48'),
(28, 'RESTOCK', 'Added 1 units to jidfoijfd', '2026-07-27 03:52:05'),
(29, 'RESTOCK', 'Added 10 units to Premier', '2026-07-27 04:11:56'),
(30, 'SALE', 'Order completed: $135.00', '2026-07-27 04:28:40'),
(31, 'SALE', 'Order completed: $5.00', '2026-07-27 04:47:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sales_items_transaction` (`transaction_id`),
  ADD KEY `fk_sales_items_product` (`product_id`);

--
-- Indexes for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sales_items`
--
ALTER TABLE `sales_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD CONSTRAINT `fk_sales_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sales_items_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `sales_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `sales_transactions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
