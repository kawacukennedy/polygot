#!/usr/bin/env ruby

require 'json'
require 'timeout'
require 'tempfile'

def execute_code(code)
  begin
    Timeout::timeout(30) do
      start_time = Time.now.to_f * 1000

      # Create temporary file
      temp_file = Tempfile.new(['code', '.rb'])
      temp_file.write(code)
      temp_file.close

      # Execute the code
      result = `ruby #{temp_file.path} 2>&1`
      exit_code = $?.exitstatus

      end_time = Time.now.to_f * 1000
      execution_time = (end_time - start_time).to_i

      # Clean up
      temp_file.unlink

      {
        success: exit_code == 0,
        stdout: exit_code == 0 ? result : '',
        stderr: exit_code != 0 ? result : '',
        execution_time: execution_time
      }
    end
  rescue Timeout::Error
    {
      success: false,
      stdout: '',
      stderr: 'Execution timed out after 30 seconds',
      execution_time: 30000
    }
  rescue => e
    {
      success: false,
      stdout: '',
      stderr: e.message,
      execution_time: 0
    }
  end
end

# Read code from stdin
code = STDIN.read
result = execute_code(code)

# Output result as JSON
puts JSON.generate(result)