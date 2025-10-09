<?php

function executeCode($code) {
    $startTime = microtime(true) * 1000;

    // Create temporary file
    $tempFile = tempnam(sys_get_temp_dir(), 'code_') . '.php';
    file_put_contents($tempFile, $code);

    // Execute with timeout
    $descriptors = [
        0 => ['pipe', 'r'], // stdin
        1 => ['pipe', 'w'], // stdout
        2 => ['pipe', 'w']  // stderr
    ];

    $process = proc_open("php $tempFile", $descriptors, $pipes);

    if (is_resource($process)) {
        // Close stdin
        fclose($pipes[0]);

        // Read output
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);

        // Close pipes
        fclose($pipes[1]);
        fclose($pipes[2]);

        // Wait for process with timeout
        $timeout = 30;
        $start = time();
        do {
            $status = proc_get_status($process);
            if (!$status['running']) {
                break;
            }
            usleep(100000); // 0.1 seconds
        } while (time() - $start < $timeout);

        if ($status['running']) {
            // Timeout - kill process
            proc_terminate($process);
            $result = [
                'success' => false,
                'stdout' => $stdout,
                'stderr' => 'Execution timed out after 30 seconds',
                'execution_time' => 30000
            ];
        } else {
            $exitCode = $status['exitcode'];
            $endTime = microtime(true) * 1000;
            $executionTime = (int)($endTime - $startTime);

            $result = [
                'success' => $exitCode === 0,
                'stdout' => $exitCode === 0 ? $stdout : '',
                'stderr' => $exitCode !== 0 ? $stderr : '',
                'execution_time' => $executionTime
            ];
        }

        proc_close($process);
    } else {
        $result = [
            'success' => false,
            'stdout' => '',
            'stderr' => 'Failed to start process',
            'execution_time' => 0
        ];
    }

    // Clean up
    unlink($tempFile);

    return $result;
}

// Read code from stdin
$code = file_get_contents('php://stdin');
$result = executeCode($code);
echo json_encode($result) . "\n";
?>