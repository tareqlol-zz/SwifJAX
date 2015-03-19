var SwifJAX = function(){
	
	function ajaxCaller(Adata){
		// Ajax Caller Function
		
	}

	function swifJAXBootstrapper(BTpayload){

		if(getActionType(BTpayload) && getActionData(BTpayload)){
			console.log('up')
		}

		// Handle if there are a before submit action in the type 
		typeof callBacks[actionType]['beforeSubmit'] == "function" ? callBacks[actionType]['beforeSubmit'](payloadObj): "";
		// Call the Request Via Ajax 
		ajaxCaller(ajaxData);
	}

	// Helper funtions:
	function getActionType(obj){
		// check the data is from a literal object or the object is a Dom
		var actionType = obj.bttype || obj.dataset.bttype;

		return isThisThingOk(actionType) ?
				 actionType :
				 throwSwift();
	}
	function getActionData(obj){
		// check the data is from a literal object or the object is a Dom
		var actionData = obj.btdata || obj.dataset.btdata;

		// Check wither the passed Data is a string so we can parse it || the passed data is already parsed.
		actionData = getType(actionData) == 'string' ? parseStringToData(actionData) : actionData;

		return isThisThingOk(actionData) ?
				 actionData :
				 throwSwift();
	}
	function parseStringToData(data){
		// Better check with IE Issues.
		return JSON.parse(data);
	}
	function isThisThingOk(theThing){
		return (theThing == undefined || theThing == "") ?  false :  true;
	}
	function throwSwift(){
		throw {
				name:'SwifJAX',
				message:'Opps, the data is missing. Destroying the object!'
			};
		return false;
	}
	function getType(thing){
		return typeof thing;
	}


	return {
		execute : function(BTpayload){
			new swifJAXBootstrapper(BTpayload);
		},
		getQue : function(BTpayload){
			return "Que";
		}
	}
}