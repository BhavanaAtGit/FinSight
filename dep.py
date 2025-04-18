import subprocess
import sys

def install_dependencies():
    """Install required dependencies"""
    dependencies = [
        'lxml', 
        'openpyxl', 
        'html5lib'
    ]  # Additional parser for better compatibility
    
    for package in dependencies:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError:
            print(f"Warning: Failed to install {package}. Continuing...")
    
# Install dependencies
install_dependencies()
