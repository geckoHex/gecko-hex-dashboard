import subprocess

def run_command(command: str) -> str:
    result = subprocess.run(
        command,
        shell=True,           # run through a shell
        capture_output=True,  # capture stdout and stderr
        text=True             # decode bytes to string
    )
    return str(result.stdout)

def get_date() -> str:
    return run_command("date")

def get_cal() -> str:
    return run_command("cal")

def do_add(a, b) -> str:
    c = a + b
    return str(c)