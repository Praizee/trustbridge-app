<?php

$reference = $_GET['txn_ref'] ?? '';
$amount = $_GET['amount'] ?? '';

header("Content-Type: text/html");

?>

<!DOCTYPE html>
<html>
<head>
  <title>Processing Payment...</title>
</head>
<body>
  <p>Processing payment...</p>

 <script>
    const txnRef = "<?php echo htmlspecialchars($reference); ?>";
    const amount = "<?php echo htmlspecialchars($amount); ?>";

    // ✅ DO NOT VERIFY HERE
    // Just go to frontend WITHOUT verified
    window.location.href = `https://trustbridgeapp.netlify.app/payment/callback?txn_ref=${txnRef}&amount=${amount}`;
</script>
</body>
</html>