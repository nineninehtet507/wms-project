<?php
include_once 'db.php';

$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
$type = isset($_GET['type']) ? $_GET['type'] : 'ALL'; // ALL, SALE, RESTOCK

try {
    // အခြေခံ Query ပုံစံဆောက်ခြင်း
    $query = "SELECT id, log_type, message, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as date_time FROM system_logs WHERE 1=1";
    $params = [];

    // Type အလိုက် Filter စစ်ခြင်း
    if ($type !== 'ALL') {
        $query .= " AND log_type = :log_type";
        $params[':log_type'] = $type;
    }

    // ရက်စွဲအလိုက် Filter စစ်ခြင်း (စာရင်းဇရား တိကျစေရန်)
    if ($start_date) {
        $query .= " AND DATE(created_at) >= :start_date";
        $params[':start_date'] = $start_date;
    }
    if ($end_date) {
        $query .= " AND DATE(created_at) <= :end_date";
        $params[':end_date'] = $end_date;
    }

    $query .= " ORDER BY id DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $report_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($report_data);

} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>