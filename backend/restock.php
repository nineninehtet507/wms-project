<?php
include_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->product_id) && !empty($data->quantity)) {
    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("UPDATE products SET stock = stock + :qty WHERE id = :id");
        $stmt->execute([':qty' => $data->quantity, ':id' => $data->product_id]);

        $p_stmt = $conn->prepare("SELECT name FROM products WHERE id = :id");
        $p_stmt->execute([':id' => $data->product_id]);
        $name = $p_stmt->fetchColumn();

        $l_stmt = $conn->prepare("INSERT INTO system_logs (log_type, message) VALUES ('RESTOCK', :msg)");
        $l_stmt->execute([':msg' => "Added " . $data->quantity . " units to " . $name]);

        $conn->commit();
        echo json_encode(["success" => true]);
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>