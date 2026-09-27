<?php
include_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->price)) {
    try {
        $conn->beginTransaction();

        // Category Check or Insert
        $c_stmt = $conn->prepare("INSERT IGNORE INTO categories (name) VALUES (:name)");
        $c_stmt->execute([':name' => $data->category]);
        $c_id = $conn->query("SELECT id FROM categories WHERE name = '{$data->category}'")->fetchColumn();

        // Supplier Check or Insert
        $s_stmt = $conn->prepare("INSERT IGNORE INTO suppliers (name) VALUES (:name)");
        $s_stmt->execute([':name' => $data->supplier]);
        $s_id = $conn->query("SELECT id FROM suppliers WHERE name = '{$data->supplier}'")->fetchColumn();

        // Product Insert
        $query = "INSERT INTO products (name, category_id, supplier_id, stock, par_level, max_level, price, cost) 
                  VALUES (:name, :c_id, :s_id, :stock, :par, :max, :price, :cost)";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':name' => $data->name, ':c_id' => $c_id, ':s_id' => $s_id,
            ':stock' => (int)$data->stock, ':par' => (int)$data->par, ':max' => (int)$data->max,
            ':price' => (float)$data->price, ':cost' => (float)$data->cost
        ]);

        // Log မတ်တမ်းသွင်းခြင်း
        $l_stmt = $conn->prepare("INSERT INTO system_logs (log_type, message) VALUES ('INVENTORY', :msg)");
        $l_stmt->execute([':msg' => "Registered new product: " . $data->name]);

        $conn->commit();
        echo json_encode(["success" => true]);
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>