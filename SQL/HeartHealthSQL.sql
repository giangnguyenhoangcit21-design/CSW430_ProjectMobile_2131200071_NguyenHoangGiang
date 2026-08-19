-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: hearthealth
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '927ec87e-cc67-11f0-bb17-0a002700000e:1-2675';

--
-- Table structure for table `daily_metrics`
--

DROP TABLE IF EXISTS `daily_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_metrics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `blood_pressure` varchar(255) DEFAULT NULL,
  `blood_sugar` double DEFAULT NULL,
  `cholesterol` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `dia_bp` int DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `spo2` int DEFAULT NULL,
  `sys_bp` int DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKifjrwl7nsqn4af7kje2mdi70g` (`user_id`),
  CONSTRAINT `FKifjrwl7nsqn4af7kje2mdi70g` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_metrics`
--

LOCK TABLES `daily_metrics` WRITE;
/*!40000 ALTER TABLE `daily_metrics` DISABLE KEYS */;
INSERT INTO `daily_metrics` VALUES (1,'125/120',NULL,65,'2026-08-17 08:28:25.688062',120,65,'SCREENING',NULL,125,65,1),(7,'125/99',NULL,77,'2026-08-17 17:27:17.405572',99,44,'SCREENING',NULL,125,66,2),(8,'120/80',NULL,NULL,'2026-08-18 08:19:45.930571',80,72,'DAILY_UPDATE',98,120,NULL,2),(9,NULL,110,180,'2026-08-18 08:19:51.643785',NULL,NULL,'DAILY_UPDATE',NULL,NULL,70.5,2),(10,'120/80',NULL,NULL,'2026-08-18 20:38:31.014250',80,72,'DAILY_UPDATE',98,120,NULL,2),(11,NULL,110,180,'2026-08-18 20:38:34.151988',NULL,NULL,'DAILY_UPDATE',NULL,NULL,70.5,2),(12,'120/80',NULL,NULL,'2026-08-18 20:45:08.874720',80,72,'DAILY_UPDATE',98,120,NULL,1),(13,NULL,110,180,'2026-08-18 20:45:12.177888',NULL,NULL,'DAILY_UPDATE',NULL,NULL,70.5,1),(14,'120/80',NULL,NULL,'2026-08-18 20:45:21.408080',80,72,'DAILY_UPDATE',98,120,NULL,1),(15,NULL,110,180,'2026-08-18 20:48:18.792176',NULL,NULL,'DAILY_UPDATE',NULL,NULL,70.5,1),(16,'120/80',NULL,NULL,'2026-08-18 20:48:23.266735',80,72,'DAILY_UPDATE',98,120,NULL,1),(17,NULL,110,180,'2026-08-18 20:49:09.697815',NULL,NULL,'DAILY_UPDATE',NULL,NULL,99,1),(18,'135/94',NULL,NULL,'2026-08-18 20:49:35.293060',94,86,'DAILY_UPDATE',100,135,NULL,1),(19,NULL,99,150,'2026-08-18 20:49:45.151755',NULL,NULL,'DAILY_UPDATE',NULL,NULL,55,1),(20,'113/71',NULL,NULL,'2026-08-18 20:50:31.496601',71,84,'DAILY_UPDATE',100,113,NULL,1),(21,'132/83',92,175,'2026-08-18 20:50:52.609563',83,87,'DAILY_UPDATE',100,132,56,1),(22,'120/80',92,115,'2026-08-19 05:52:09.708764',80,72,'SCREENING',100,120,60,4);
/*!40000 ALTER TABLE `daily_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_appointments`
--

DROP TABLE IF EXISTS `doctor_appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_appointments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` varchar(255) DEFAULT NULL,
  `appointment_type` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKsno3yf3du15ayxsbp0rbykhow` (`user_id`),
  CONSTRAINT `FKsno3yf3du15ayxsbp0rbykhow` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_appointments`
--

LOCK TABLES `doctor_appointments` WRITE;
/*!40000 ALTER TABLE `doctor_appointments` DISABLE KEYS */;
INSERT INTO `doctor_appointments` VALUES (2,'2026-08-19','16:00','Tong Quat','2026-08-18 21:00:58.271088','Nguyen Nhat Tan','EIU','SCHEDULED',1),(3,'2026-08-19','16:00','Follow-up visit','2026-08-19 06:11:19.709144','Nguyen Nhat Tan','EIU','SCHEDULED',4);
/*!40000 ALTER TABLE `doctor_appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_goals`
--

DROP TABLE IF EXISTS `health_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_goals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active_mins` int DEFAULT NULL,
  `bp_target` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `end_date` date DEFAULT NULL,
  `fat_target` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `sugar_target` varchar(255) DEFAULT NULL,
  `week_range` varchar(255) DEFAULT NULL,
  `weight_target` double DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKlamrakw2djla7iq1t0mqk83yp` (`user_id`),
  CONSTRAINT `FKlamrakw2djla7iq1t0mqk83yp` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_goals`
--

LOCK TABLES `health_goals` WRITE;
/*!40000 ALTER TABLE `health_goals` DISABLE KEYS */;
INSERT INTO `health_goals` VALUES (2,45,'127/69','2026-08-18 20:57:34.243538','2026-08-23','90','2026-08-17','100','17/08 - 23/08',60,1),(3,30,'120/80','2026-08-19 06:08:53.288472','2026-08-23','100','2026-08-17','100','17/08 - 23/08',60,4);
/*!40000 ALTER TABLE `health_goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_records`
--

DROP TABLE IF EXISTS `health_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `age` int DEFAULT NULL,
  `assessment_color` varchar(255) DEFAULT NULL,
  `assessment_title` varchar(255) DEFAULT NULL,
  `blood_pressure` varchar(255) DEFAULT NULL,
  `breathlessness` varchar(255) DEFAULT NULL,
  `chest_pain` varchar(255) DEFAULT NULL,
  `cholesterol` int DEFAULT NULL,
  `comorbidities` text,
  `created_at` datetime(6) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `medications` text,
  `weight` double DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnm8qm5054prog8qul6v2jce1d` (`user_id`),
  CONSTRAINT `FKnm8qm5054prog8qul6v2jce1d` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
INSERT INTO `health_records` VALUES (1,65,'#EA580C','NGUY CƠ CAO','125/120','none','mild',65,'hypertension,diabetes,dyslipidemia,stomach,Dau Bung','2026-08-17 08:28:25.678301','male',65,NULL,65,1),(5,46,'#D97706','NGUY CƠ TRUNG BÌNH','125/99','none','none',77,'stomach,Cancer','2026-08-17 17:27:17.400464','male',44,NULL,66,2),(6,40,'#EA580C','HIGH RISK','120/80','none','none',50,'hypertension,diabetes,dyslipidemia,stomach,Cancer','2026-08-19 05:52:09.699824','male',70,NULL,60,4);
/*!40000 ALTER TABLE `health_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medication_schedules`
--

DROP TABLE IF EXISTS `medication_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medication_schedules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `last_taken_date` date DEFAULT NULL,
  `medication_name` varchar(255) NOT NULL,
  `taken` bit(1) DEFAULT NULL,
  `time_of_day` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKxwns5kd7ou7apoiif6o6vec0` (`user_id`),
  CONSTRAINT `FKxwns5kd7ou7apoiif6o6vec0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medication_schedules`
--

LOCK TABLES `medication_schedules` WRITE;
/*!40000 ALTER TABLE `medication_schedules` DISABLE KEYS */;
INSERT INTO `medication_schedules` VALUES (3,'2026-08-18 21:01:56.276488','Uong truoc khi an','2026-08-19',' Calcium Corbiere, 1 vien',_binary '','Sáng',1),(4,'2026-08-19 06:12:41.302556','Dring before meal',NULL,'Vitamin A, 100mg',_binary '\0','Morning',4);
/*!40000 ALTER TABLE `medication_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_tokens`
--

DROP TABLE IF EXISTS `otp_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `expiration_time` datetime(6) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_tokens`
--

LOCK TABLES `otp_tokens` WRITE;
/*!40000 ALTER TABLE `otp_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `screening_completed` bit(1) NOT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'2026-08-17 08:27:20.670601','Nguyen Hoang Giang','1234567','USER','ACTIVE','2026-08-17 16:39:06.924548',65,'male',_binary '','nhg3112003@gmail.com'),(2,NULL,'2026-08-17 17:26:49.107413','Giang','123456','USER','ACTIVE','2026-08-18 21:02:56.953380',46,'male',_binary '','giangphuc789@gmail.com'),(4,NULL,'2026-08-19 05:46:25.116521','Nguyen Giang','GmailUser@2026','USER','ACTIVE','2026-08-19 05:52:09.712904',40,'male',_binary '','riven03012003@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-19 21:07:56
