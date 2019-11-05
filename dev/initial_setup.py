import getpass
import logging
import os
import platform
import subprocess as sp
import sys
if platform.system() == "Linux":
    import grp

EULERTOUR_GITHUB_URL = "https://github.com/eulertour/"

logging.basicConfig(
    level=logging.DEBUG,
    stream=sys.stdout,
    format="%(levelname)s: %(message)s",
)

def clone_eulertour_repo(repo):
    if os.path.isdir(repo):
        return
    try:
        sp.run(
            ["git", "clone", EULERTOUR_GITHUB_URL + repo],
            check=True,
            env={"GIT_TERMINAL_PROMPT": "0"},
        )
    except sp.CalledProcessError as e:
        logging.error(f"Encountered a problem cloning {repo}: {e}")
        sys.exit(1)

def verify_command_or_exit(cmd):
    try:
        sp.run(["which", cmd], capture_output=True, check=True)
    except sp.CalledProcessError as e:
        logging.error(f"{cmd} is required, but isn't installed")
        sys.exit(1)

if not (sys.version_info.major == 3 and sys.version_info.minor >= 7):
    logging.error("Python 3.7 or higher is required")
    sys.exit(1)

verify_command_or_exit("git")
verify_command_or_exit("docker")
verify_command_or_exit("yarn")
verify_command_or_exit("node")
if platform.system() == "Linux":
    try:
        sp.run(["yarn", "info"], check=True, capture_output=True)
    except sp.CalledProcessError as e:
        logging.warning("The first 'yarn' in the path is from the cmdtest "
                        "package. You'll have to uninstall this package or "
                        "invoke yarn via its full path.")

    group_list = map(lambda g: g.gr_name, grp.getgrall())
    if "docker" not in group_list:
        logging.warning(f"{getpass.getuser()} is not in the docker group")


script_dir = os.path.dirname(os.path.realpath(__file__))
os.chdir(script_dir)

clone_eulertour_repo("pyodide")
clone_eulertour_repo("manim")

os.chdir("..")
try:
    sp.run(["yarn", "install"], check=True)
except sp.CalledProcessError as e:
    logging.error(f"Error running yarn install: {e}")
    sys.exit(1)
