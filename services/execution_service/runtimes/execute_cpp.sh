#!/bin/bash

# Read code from stdin
code=$(cat)

# Create temporary C++ file
temp_file="/tmp/main_$(date +%s).cpp"
echo "$code" > "$temp_file"

# Compile and run with timeout
start_time=$(date +%s%3N)

# Compile
g++ "$temp_file" -o "/tmp/main_executable" 2> compile_error.txt
compile_exit=$?

if [ $compile_exit -ne 0 ]; then
    end_time=$(date +%s%3N)
    execution_time=$((end_time - start_time))
    compile_error=$(cat compile_error.txt)
    echo "{\"success\": false, \"stdout\": \"\", \"stderr\": \"Compilation error: $compile_error\", \"execution_time\": $execution_time}"
    rm -f "$temp_file" compile_error.txt
    exit 0
fi

# Run with timeout
timeout 30 "/tmp/main_executable" > output.txt 2> error.txt
run_exit=$?

end_time=$(date +%s%3N)
execution_time=$((end_time - start_time))

stdout=$(cat output.txt 2>/dev/null || echo "")
stderr=$(cat error.txt 2>/dev/null || echo "")

if [ $run_exit -eq 124 ]; then
    echo "{\"success\": false, \"stdout\": \"$stdout\", \"stderr\": \"Execution timed out after 30 seconds\", \"execution_time\": 30000}"
elif [ $run_exit -ne 0 ]; then
    echo "{\"success\": false, \"stdout\": \"$stdout\", \"stderr\": \"$stderr\", \"execution_time\": $execution_time}"
else
    echo "{\"success\": true, \"stdout\": \"$stdout\", \"stderr\": \"$stderr\", \"execution_time\": $execution_time}"
fi

# Clean up
rm -f "$temp_file" "/tmp/main_executable" output.txt error.txt compile_error.txt