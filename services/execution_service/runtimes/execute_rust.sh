#!/bin/bash

# Read code from stdin
code=$(cat)

# Create temporary Rust project
temp_dir="/tmp/rust_project_$(date +%s)"
mkdir -p "$temp_dir/src"
echo "$code" > "$temp_dir/src/main.rs"

# Create Cargo.toml
cat > "$temp_dir/Cargo.toml" << EOF
[package]
name = "temp"
version = "0.1.0"
edition = "2021"

[dependencies]
EOF

# Compile and run with timeout
start_time=$(date +%s%3N)

# Compile
cd "$temp_dir"
cargo build --release 2> compile_error.txt
compile_exit=$?

if [ $compile_exit -ne 0 ]; then
    end_time=$(date +%s%3N)
    execution_time=$((end_time - start_time))
    compile_error=$(cat compile_error.txt)
    echo "{\"success\": false, \"stdout\": \"\", \"stderr\": \"Compilation error: $compile_error\", \"execution_time\": $execution_time}"
    rm -rf "$temp_dir"
    exit 0
fi

# Run with timeout
timeout 30 "./target/release/temp" > output.txt 2> error.txt
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
rm -rf "$temp_dir"