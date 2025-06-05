-- db/schema.sql
CREATE TABLE IF NOT EXISTS part_model_hardware (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_model_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_model_id) REFERENCES parts_models(id)
);

CREATE TABLE IF NOT EXISTS parts_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- Add other columns as needed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);