<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

function sendResetEmail($toEmail, $toName, $resetLink)
{
    $mail = new PHPMailer(true);

    try {
        // SMTP CONFIG (CHANGE THIS)
        $mail->isSMTP();
        $mail->Host = 'smtp.ezirimkingdom.com.ng';
        $mail->SMTPAuth = true;
        $mail->Username = 'trustbridge@ezirimkingdom.com.ng';
        $mail->Password = 'Ot57405cf';
        $mail->SMTPSecure = 'ssl';
        $mail->Port = 465;

        // Sender
        $mail->setFrom('trustbridge@ezirimkingdom.com.ng', 'TrustBridge');
        $mail->addAddress($toEmail, $toName);

        // HTML Email
        $mail->isHTML(true);
        $mail->Subject = "Reset Your Password";

        $mail->Body = "
        <div style='font-family: Arial; background:#f4f4f4; padding:20px;'>
            <div style='max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden;'>

                <div style='background:#16a34a; padding:20px; text-align:center; color:white;'>
                    <h2>Password Reset</h2>
                </div>

                <div style='padding:30px; color:#333;'>
                    <h3>Hello $toName,</h3>
                    <p>You requested to reset your password.</p>

                    <p>Click the button below to continue:</p>

                    <div style='text-align:center; margin:30px 0;'>
                        <a href='$resetLink' 
                           style='background:#16a34a; color:white; padding:15px 25px; text-decoration:none; border-radius:5px; font-weight:bold;'>
                           Reset Password
                        </a>
                    </div>

                    <p>This link will expire in <b>1 hour</b>.</p>

                    <p>If you didn’t request this, ignore this email.</p>

                    <hr>

                    <p style='font-size:12px; color:#888;'>
                        TrustBridge © " . date('Y') . "
                    </p>
                </div>

            </div>
        </div>
        ";

        $mail->send();
        return true;

    } catch (Exception $e) {
        return false;
    }
}