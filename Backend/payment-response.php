<?php

$txnref = $_POST['txnref'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Processing Payment</title>
</head>
<body>
  <script>
    const txnref = <?php echo json_encode($txnref); ?>;
    if (txnref) {
      window.location.href = "/payment-status?reference=" + encodeURIComponent(txnref);
    } else {
      document.body.innerHTML = "<h2>Missing transaction reference</h2>";
    }
  </script>
</body>
</html>