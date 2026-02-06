<?php
echo "<h1>CI/CD Deployment Successful</h1>";
echo "<p><strong>Version:</strong> " . getenv('WP_VERSION') . "</p>";
echo "<p><strong>Server Time:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<hr>";
phpinfo();
?>
