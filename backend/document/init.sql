-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 30 mai 2025 à 20:59
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `boardhub`
--

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `address`, `registration_date`) VALUES
(2, 'Ali Ben Salah', 'ali.ben@example.com', '22222222', 'Tunis, Tunisia', '2025-05-30 18:47:11'),
(3, 'Mouna Jaziri', 'mouna.jz@example.com', '23334444', 'Sfax, Tunisia', '2025-05-30 18:47:11');

-- --------------------------------------------------------

--
-- Structure de la table `parts`
--

CREATE TABLE `parts` (
  `id` int(11) NOT NULL,
  `number` varchar(50) NOT NULL,
  `model_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `added_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `parts`
--

INSERT INTO `parts` (`id`, `number`, `model_id`, `client_id`, `added_date`) VALUES
(1, 'PART-0001', 3, 3, '2025-05-30 18:50:57'),
(2, 'PART-0002', 4, 2, '2025-05-30 18:51:21');

-- --------------------------------------------------------

--
-- Structure de la table `parts_models`
--

CREATE TABLE `parts_models` (
  `id` int(11) NOT NULL,
  `type` enum('EPS','ABS','ECU') NOT NULL,
  `reference` varchar(50) NOT NULL,
  `manufacturer` varchar(255) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `parts_models`
--

INSERT INTO `parts_models` (`id`, `type`, `reference`, `manufacturer`, `brand`, `model`, `created_at`) VALUES
(3, 'EPS', 'EPS-123456', 'Bosch', 'Volkswagen', 'Golf 7', '2025-05-30 18:47:44'),
(4, 'ABS', 'ABS-654321', 'Continental', 'Peugeot', '208', '2025-05-30 18:47:44');

-- --------------------------------------------------------

--
-- Structure de la table `part_model_firmware`
--

CREATE TABLE `part_model_firmware` (
  `id` int(11) NOT NULL,
  `part_model_id` int(11) NOT NULL,
  `version` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `part_model_firmware`
--

INSERT INTO `part_model_firmware` (`id`, `part_model_id`, `version`, `description`, `file_path`, `uploaded_at`) VALUES
(2, 3, 'v1.0.0', 'Initial firmware release', '/uploads/1748631359594-964105022-210713M-Yaris-Tech-Spec.pdf', '2025-05-30 18:56:01'),
(3, 4, 'v2.0.0', 'Improved stability and bug fixes', '/uploads/1748631390162-481894743-210713M-Yaris-Tech-Spec.pdf', '2025-05-30 18:56:31');

-- --------------------------------------------------------

--
-- Structure de la table `part_model_hardware`
--

CREATE TABLE `part_model_hardware` (
  `id` int(11) NOT NULL,
  `part_model_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` enum('Photo','Drawing','Other') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `part_model_hardware`
--

INSERT INTO `part_model_hardware` (`id`, `part_model_id`, `file_name`, `file_type`, `file_path`, `uploaded_at`) VALUES
(2, 3, 'eps_photo', 'Photo', '/uploads/1748631122684-447583787.webp', '2025-05-30 18:52:06'),
(3, 4, 'eps_diagram', 'Drawing', '/uploads/1748631216757-133786104.png', '2025-05-30 18:53:46');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `PASSWORD` varchar(255) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `PASSWORD`, `registration_date`) VALUES
(1, 'admin', '123', '2025-04-16 07:57:23'),
(3, 'ghofrane', '1234', '2025-05-25 16:54:26');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `parts`
--
ALTER TABLE `parts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number` (`number`),
  ADD KEY `model_id` (`model_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Index pour la table `parts_models`
--
ALTER TABLE `parts_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`);

--
-- Index pour la table `part_model_firmware`
--
ALTER TABLE `part_model_firmware`
  ADD PRIMARY KEY (`id`),
  ADD KEY `part_model_id` (`part_model_id`);

--
-- Index pour la table `part_model_hardware`
--
ALTER TABLE `part_model_hardware`
  ADD PRIMARY KEY (`id`),
  ADD KEY `part_model_id` (`part_model_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PASSWORD` (`PASSWORD`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `parts`
--
ALTER TABLE `parts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `parts_models`
--
ALTER TABLE `parts_models`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `part_model_firmware`
--
ALTER TABLE `part_model_firmware`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `part_model_hardware`
--
ALTER TABLE `part_model_hardware`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `parts`
--
ALTER TABLE `parts`
  ADD CONSTRAINT `parts_ibfk_1` FOREIGN KEY (`model_id`) REFERENCES `parts_models` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `parts_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `part_model_firmware`
--
ALTER TABLE `part_model_firmware`
  ADD CONSTRAINT `part_model_firmware_ibfk_1` FOREIGN KEY (`part_model_id`) REFERENCES `parts_models` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `part_model_hardware`
--
ALTER TABLE `part_model_hardware`
  ADD CONSTRAINT `part_model_hardware_ibfk_1` FOREIGN KEY (`part_model_id`) REFERENCES `parts_models` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
