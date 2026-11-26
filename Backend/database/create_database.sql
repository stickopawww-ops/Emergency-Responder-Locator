-- Run this script in MySQL Workbench as a MySQL administrator.
CREATE DATABASE IF NOT EXISTS emergency_responder_locator
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'responder_app'@'localhost'
    IDENTIFIED BY 'CHANGE_THIS_LOCAL_PASSWORD';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
    ON emergency_responder_locator.* TO 'responder_app'@'localhost';

FLUSH PRIVILEGES;
