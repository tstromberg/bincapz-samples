
# disable firewall
ufw disable

# clear the rules of iptables
iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -F

# clear the content ld.so.preload
chattr -ia /etc/ld.so.preload
cat /dev/null > /etc/ld.so.preload
