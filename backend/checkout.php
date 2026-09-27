<?php
include_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->cart)) {
    try {
        $conn->beginTransaction();

        $total = 0;
        foreach($data->cart as $item) { $total += ($item->qty * $item->price); }

        $t_stmt = $conn->prepare("INSERT INTO sales_transactions (total_amount) VALUES (:total)");
        $t_stmt->execute([':total' => $total]);
        $t_id = $conn->lastInsertId();

        foreach($data->cart as $item) {
            $i_stmt = $conn->prepare("INSERT INTO sales_items (transaction_id, product_id, quantity, price_per_unit) VALUES (:t_id, :p_id, :qty, :price)");
            $i_stmt->execute([':t_id' => $t_id, ':p_id' => $item->id, ':qty' => $item->qty, ':price' => $item->price]);

            $u_stmt = $conn->prepare("UPDATE products SET stock = stock - :qty, sales_count = sales_count + :qty WHERE id = :id");
            $u_stmt->execute([':qty' => $item->qty, ':id' => $item->id]);
        }

        $l_stmt = $conn->prepare("INSERT INTO system_logs (log_type, message) VALUES ('SALE', :msg)");
        $l_stmt->execute([':msg' => "Order completed: $" . number_format($total, 2)]);

        $conn->commit();
        echo json_encode(["success" => true, "total" => $total]);
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>