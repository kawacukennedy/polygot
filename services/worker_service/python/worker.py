from celery import Celery
import time
import os
import tempfile
import docker

app = Celery('worker', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

client = docker.from_env()

@app.task
def debug_task(x, y):
    time.sleep(5)
    print(f'Debug task executed: {x} + {y} = {x + y}')
    return x + y

@app.task
def execute_code_task(language: str, code: str, input_data: str = '', timeout_ms: int = 5000):
    with tempfile.TemporaryDirectory() as temp_dir:
        file_extension = get_file_extension(language)
        file_name = f'main.{file_extension}'
        file_path_in_host = os.path.join(temp_dir, file_name)

        with open(file_path_in_host, 'w') as f:
            f.write(code)

        container_name = f'polyglot-executor-{app.request.id}'
        image_name = f'polyglot-{language}-runner' # Assuming images like polyglot-python-runner exist

        command = []
        if language == 'python':
            command = ['python', file_name]
        elif language == 'javascript':
            command = ['node', file_name]
        elif language == 'cpp':
            executable_name = 'main'
            compile_command = ['g++', file_name, '-o', executable_name]
            # Execute compile command in container
            try:
                compile_result = client.containers.run(
                    image_name,
                    command=compile_command,
                    volumes={temp_dir: {'bind': '/usr/src/app', 'mode': 'rw'}},
                    working_dir='/usr/src/app',
                    remove=True,
                    detach=False,
                    stdout=True,
                    stderr=True,
                    network_disabled=True,
                    mem_limit='128m',
                    cpu_period=100000,
                    cpu_quota=50000, # 0.5 CPU
                )
                if compile_result.exit_status != 0:
                    return {'status': 'error', 'message': 'Compilation failed', 'stderr': compile_result.stderr.decode('utf-8')}
            except docker.errors.ContainerError as e:
                return {'status': 'error', 'message': 'Compilation failed', 'stderr': e.stderr.decode('utf-8')}
            except Exception as e:
                return {'status': 'error', 'message': f'Docker error during compilation: {str(e)}'}
            command = [f'./{executable_name}']
        elif language == 'java':
            class_name = 'Main'
            compile_command = ['javac', file_name]
            try:
                compile_result = client.containers.run(
                    image_name,
                    command=compile_command,
                    volumes={temp_dir: {'bind': '/usr/src/app', 'mode': 'rw'}},
                    working_dir='/usr/src/app',
                    remove=True,
                    detach=False,
                    stdout=True,
                    stderr=True,
                    network_disabled=True,
                    mem_limit='128m',
                    cpu_period=100000,
                    cpu_quota=50000,
                )
                if compile_result.exit_status != 0:
                    return {'status': 'error', 'message': 'Compilation failed', 'stderr': compile_result.stderr.decode('utf-8')}
            except docker.errors.ContainerError as e:
                return {'status': 'error', 'message': 'Compilation failed', 'stderr': e.stderr.decode('utf-8')}
            except Exception as e:
                return {'status': 'error', 'message': f'Docker error during compilation: {str(e)}'}
            command = ['java', class_name]
        elif language == 'go':
            executable_name = 'main'
            compile_command = ['go', 'build', '-o', executable_name, file_name]
            try:
                compile_result = client.containers.run(
                    image_name,
                    command=compile_command,
                    volumes={temp_dir: {'bind': '/usr/src/app', 'mode': 'rw'}},
                    working_dir='/usr/src/app',
                    remove=True,
                    detach=False,
                    stdout=True,
                    stderr=True,
                    network_disabled=True,
                    mem_limit='128m',
                    cpu_period=100000,
                    cpu_quota=50000,
                )
                if compile_result.exit_status != 0:
                    return {'status': 'error', 'message': 'Compilation failed', 'stderr': compile_result.stderr.decode('utf-8')}
            except docker.errors.ContainerError as e:
                return {'status': 'error', 'message': 'Compilation failed', 'stderr': e.stderr.decode('utf-8')}
            except Exception as e:
                return {'status': 'error', 'message': f'Docker error during compilation: {str(e)}'}
            command = [f'./{executable_name}']
        elif language == 'php':
            command = ['php', file_name]
        elif language == 'rust':
            executable_name = 'main'
            compile_command = ['rustc', file_name, '-o', executable_name]
            try:
                compile_result = client.containers.run(
                    image_name,
                    command=compile_command,
                    volumes={temp_dir: {'bind': '/usr/src/app', 'mode': 'rw'}},
                    working_dir='/usr/src/app',
                    remove=True,
                    detach=False,
                    stdout=True,
                    stderr=True,
                    network_disabled=True,
                    mem_limit='128m',
                    cpu_period=100000,
                    cpu_quota=50000,
                )
                if compile_result.exit_status != 0:
                    return {'status': 'error', 'message': 'Compilation failed', 'stderr': compile_result.stderr.decode('utf-8')}
            except docker.errors.ContainerError as e:
                return {'status': 'error', 'message': 'Compilation failed', 'stderr': e.stderr.decode('utf-8')}
            except Exception as e:
                return {'status': 'error', 'message': f'Docker error during compilation: {str(e)}'}
            command = [f'./{executable_name}']
        elif language == 'ruby':
            command = ['ruby', file_name]
        else:
            return {'status': 'error', 'message': f'Unsupported language: {language}'}

        try:
            start_time = time.time()
            container_output = client.containers.run(
                image_name,
                command=command,
                volumes={temp_dir: {'bind': '/usr/src/app', 'mode': 'rw'}},
                working_dir='/usr/src/app',
                remove=True,
                detach=False,
                stdout=True,
                stderr=True,
                network_disabled=True, # Disable network for security
                mem_limit='128m', # Limit memory
                cpu_period=100000,
                cpu_quota=50000, # 0.5 CPU
                input=input_data.encode('utf-8'), # Pass input to stdin
                stream=False, # Capture all output at once
                # timeout=timeout_ms / 1000, # Docker SDK timeout is for API call, not container execution
            )
            end_time = time.time()
            duration = (end_time - start_time) * 1000  # Convert to ms

            # Docker SDK run method returns stdout/stderr combined if stream=False
            # Need to parse it out if both are expected
            # For simplicity, assuming stdout is main output and stderr is error output
            stdout_output = container_output.decode('utf-8')
            stderr_output = ""
            exit_code = 0 # Docker SDK doesn't directly return exit code for run, need to inspect container

            return {
                'status': 'success',
                'stdout': stdout_output,
                'stderr': stderr_output,
                'duration_ms': duration,
                'exit_code': exit_code,
            }
        except docker.errors.ContainerError as e:
            return {
                'status': 'error',
                'message': 'Execution failed',
                'stdout': e.stdout.decode('utf-8'),
                'stderr': e.stderr.decode('utf-8'),
                'exit_code': e.exit_status,
                'duration_ms': (time.time() - start_time) * 1000,
            }
        except docker.errors.ImageNotFound:
            return {'status': 'error', 'message': f'Docker image for {language} not found. Please build it.'}
        except Exception as e:
            return {'status': 'error', 'message': f'Docker error during execution: {str(e)}'}

def get_file_extension(language: str) -> str:
    if language == 'python':
        return 'py'
    elif language == 'javascript':
        return 'js'
    elif language == 'cpp':
        return 'cpp'
    elif language == 'java':
        return 'java'
    elif language == 'go':
        return 'go'
    elif language == 'php':
        return 'php'
    elif language == 'rust':
        return 'rs'
    elif language == 'ruby':
        return 'rb'
    else:
        return 'txt'

# This is a worker, it doesn't expose HTTP endpoints directly.
# Health checks would typically involve monitoring the Redis queue or Celery's own monitoring tools.
