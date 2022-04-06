<?php

    class SchemaDBManager {
    
        private function connect() {
            $serverName = "localhost:9999"; // change to your server
            $username = "skapoor"; // change to your username
            $password = "COSMIC2022*"; // change to your password


            $conn = new mysqli($serverName, $username, $password);
            if ($conn->connect_error) {
                die("Connection failed: " . $conn->connect_error);
            } 
            return $conn;
        }

        private function closeDB($conn) {
            $conn->close();
        }

        private function createDB($conn) {
            $sql = "CREATE DATABASE IF NOT EXISTS schema_datastore";
            if ($conn->query($sql) === TRUE) 
                return true;
            return false;
        }

        private function createDataTable($conn) {
            mysqli_select_db($conn,"schema_datastore");

            $sql = "CREATE TABLE data (
                data_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                study_id VARCHAR(30) NOT NULL,
                user_id VARCHAR(30) NOT NULL,
                module_index INT(11) NOT NULL,
                module_name VARCHAR(500) NOT NULL,
                responses VARCHAR(10000) NOT NULL,
                response_time VARCHAR(1000) NOT NULL,
                alert_time VARCHAR(1000) NOT NULL,
                platform VARCHAR(50) NOT NULL
            )";
            
            if ($conn->query($sql) === TRUE) 
                return true;
            return false;
        }
        
        private function createLogTable($conn) {
            mysqli_select_db($conn,"schema_datastore");

            $sql = "CREATE TABLE logs (
                log_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                study_id VARCHAR(30) NOT NULL,
                user_id VARCHAR(30) NOT NULL,
                module_index INT(11) NOT NULL,
                page VARCHAR(100) NOT NULL,
                timestamp VARCHAR(500) NOT NULL,
                platform VARCHAR(50) NOT NULL
            )";
            
            if ($conn->query($sql) === TRUE) 
                return true;
            return false;
        }
        
        private function writeToDataTable($conn) {
            mysqli_select_db($conn, "schema_datastore");
            
            $study = $_POST['study_id'];
            $user = $_POST['user_id'];
            $ind = $_POST['module_index'];
            $platform = $_POST['platform'];
            
            $sql = "INSERT INTO data (study_id, user_id, module_index, platform) 
            VALUES ('$study', '$user', '$ind', '$platform')";
            if ($conn->query($sql) === TRUE) 
                return true;
            return false;
            
        }
        function setupDB($conn) {
            $conn = $this->connect();

            $db = $this->createDB($conn);
            
            if ($db) {
                echo "Database created successfully";
                $dataTableCreated = $this->createDataTable($conn);
                $logsTableCreated = $this->createLogTable($conn);
                $insertData = $this->writeToDataTable($conn);
            } else {
                echo "There was an error creating the database";
            }

            if ($dataTableCreated)
                echo "Data table created successfully";
            else
                echo "Error creating data table";

            if ($logsTableCreated) 
                echo "Logs table created successfully";
            else 
                echo "Error creating logs table";
            if ($insertData)
            	echo "Data has been inserted to the table";
            else
                echo "Error inserting data into the table"; 

            $this->closeDB($conn);
        }
    }

    $dbManager = new SchemaDBManager();
    $dbManager->setupDB();
    

?>
