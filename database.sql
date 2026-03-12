-- Database: project_pembukuan

-- CREATE DATABASE IF NOT EXISTS `project_pembukuan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `project_pembukuan`;

-- Table for Pemasukan (Incomes)
CREATE TABLE IF NOT EXISTS `incomes` (
  `id` VARCHAR(50) PRIMARY KEY,
  `date` DATE NOT NULL,
  `reseller_name` VARCHAR(100) NOT NULL,
  `kg` DECIMAL(10,2) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `payung_meja` DECIMAL(15,2) DEFAULT NULL,
  `piutang_lunas` DECIMAL(15,2) DEFAULT NULL,
  `uang` DECIMAL(15,2) DEFAULT NULL,
  `payment_method` ENUM('cash', 'transfer') NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Pengeluaran (Expenses)
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `category` ENUM('gas_tabung', 'makan_siang', 'operasional', 'transport', 'kasbon', 'ongkir', 'perlengkapan', 'lainnya') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Transfers
CREATE TABLE IF NOT EXISTS `transfers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `date` DATE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `payung_meja` DECIMAL(15,2) DEFAULT NULL,
  `piutang_lunas` DECIMAL(15,2) DEFAULT NULL,
  `uang` DECIMAL(15,2) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Receivables (Piutang)
CREATE TABLE IF NOT EXISTS `receivables` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(100) NOT NULL,
  `type` ENUM('payung_meja', 'piutang') NOT NULL,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `paid_amount` DECIMAL(15,2) DEFAULT 0,
  `status` ENUM('active', 'paid') NOT NULL DEFAULT 'active',
  `app_created_at` DATE NOT NULL,
  `db_created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Kasbon (Employee advances)
CREATE TABLE IF NOT EXISTS `kasbons` (
  `id` VARCHAR(50) PRIMARY KEY,
  `employee_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `remaining_amount` DECIMAL(15,2) NOT NULL,
  `status` ENUM('active', 'paid') NOT NULL DEFAULT 'active',
  `app_created_at` DATE NOT NULL,
  `db_created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Payments (Cicilan untuk Piutang dan Kasbon)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(50) PRIMARY KEY,
  `reference_id` VARCHAR(50) NOT NULL, -- points to receivables.id or kasbons.id
  `payment_type` ENUM('receivable', 'kasbon') NOT NULL,
  `date` DATE NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Stock (Stok)
CREATE TABLE IF NOT EXISTS `stocks` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('mentah', 'terpakai', 'baru') NOT NULL,
  `karung` DECIMAL(10,2) NOT NULL,
  `kg` DECIMAL(10,2) NOT NULL,
  `date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
