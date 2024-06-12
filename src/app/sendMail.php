<?php

switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"): //Allow preflighting to take place.
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;
    case("POST"): //Send the email;
        header("Access-Control-Allow-Origin: *");
        // Payload is not send to $_POST Variable,
        // is send to php:input as a text
        $json = file_get_contents('php://input');
        //parse the Payload from text format to Object
        $params = json_decode($json);
    
        $email = $params->email;
        $name = $params->name;
        $message = $params->message;
    
        $recipient = $email;  
        $subject = $name;
        $message = $message;
    
        $headers   = array();
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = "From: da-bubble.vitalij-schwab.com/landing-page/login";

        // Loggen Sie die E-Mail-Daten zur Fehlerbehebung
        error_log("Empfänger: " . $recipient);
        error_log("Betreff: " . $subject);
        error_log("Nachricht: " . $message);

        mail($recipient, $subject, $message, implode("\r\n", $headers));
        break;
    default: //Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
} 
?>
