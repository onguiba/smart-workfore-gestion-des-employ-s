<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDBConnection();
    
    switch($method) {
        case 'GET':
            // Récupérer tous les employés
            $stmt = $db->query("SELECT * FROM employees ORDER BY id DESC");
            $employees = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $employees
            ]);
            break;
            
        case 'POST':
            // Créer un nouvel employé (inscription)
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Générer un email si non fourni
            if (empty($data['email'])) {
                $nameParts = explode(' ', strtolower($data['fullName']));
                $firstName = $nameParts[0] ?? 'employe';
                $lastName = end($nameParts);
                $randomNum = rand(1000, 9999);
                $data['email'] = "{$firstName}.{$lastName}{$randomNum}@smartworkforce.ai";
            }
            
            // Générer un matricule
            $matricule = 'SWA-' . rand(1000, 9999);
            
            $stmt = $db->prepare("
                INSERT INTO employees 
                (name, email, phone, position, role, department, salary, photo, matricule, userType, joinDate, registrationTime, location_latitude, location_longitude, status, checkInTime)
                VALUES 
                (:name, :email, :phone, :position, :position, :department, :salary, :photo, :matricule, 'employee', CURDATE(), :time, :lat, :lng, 'present', :time)
            ");
            
            $stmt->execute([
                ':name' => $data['fullName'],
                ':email' => $data['email'],
                ':phone' => $data['phone'] ?? null,
                ':position' => $data['position'] ?? 'Collaborateur',
                ':department' => $data['department'] ?? 'Operations',
                ':salary' => $data['salary'] ?? 0,
                ':photo' => $data['photo'] ?? null,
                ':matricule' => $matricule,
                ':time' => $data['registrationHour'] ?? date('H:i'),
                ':lat' => $data['location']['latitude'] ?? null,
                ':lng' => $data['location']['longitude'] ?? null
            ]);
            
            $newId = $db->lastInsertId();
            $stmt = $db->prepare("SELECT * FROM employees WHERE id = ?");
            $stmt->execute([$newId]);
            $employee = $stmt->fetch();
            
            echo json_encode([
                'success' => true,
                'message' => 'Inscription réussie',
                'data' => $employee
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
