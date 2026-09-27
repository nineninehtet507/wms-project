<?php
include_once 'db.php';

try {
    // Products ဆွဲထုတ်ခြင်း
    $p_stmt = $conn->prepare("SELECT p.*, c.name as category, s.name as supplier FROM products p 
                              LEFT JOIN categories c ON p.category_id = c.id 
                              LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.id DESC");
    $p_stmt->execute();
    $products = $p_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Logs ဆွဲထုတ်ခြင်း
    $l_stmt = $conn->prepare("SELECT id, log_type as type, message, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as time FROM system_logs ORDER BY id DESC LIMIT 15");
    $l_stmt->execute();
    $logs = $l_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Sales History ဆွဲထုတ်ခြင်း (Chart အတွက်)
    $s_stmt = $conn->prepare("SELECT DATE(transaction_date) as date, SUM(total_amount) as amount FROM sales_transactions GROUP BY DATE(transaction_date) ORDER BY date ASC LIMIT 10");
    $s_stmt->execute();
    $sales = $s_stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "inventory" => $products,
        "logs" => $logs,
        "sales" => $sales
    ]);
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>