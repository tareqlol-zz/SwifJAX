var SwifJAX = function(Mapper){
	var ActionMapper = Mapper;

	function xhrCaller(swifJAXObject){
		
		var xhr = typeof XMLHttpRequest != 'undefined'
            ? new XMLHttpRequest()
            : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.onreadystatechange = function() { 
            var status;
            if (xhr.readyState == 4) { // done ?
                status = xhr.status;
                if (status == 200) { // status code ok ?
                	// Call the passed Success function passed by params , and the related object
                    swifJAXObject.Functionality['success'](this.responseText,swifJAXObject.Functionality.triggerer);
                } else {
                	// Call the passed error function passed by params , and the related object
                    swifJAXObject.Functionality['error'](this.statusText,swifJAXObject.Functionality.triggerer);
                }
            }
        };
        xhr.open(
        	swifJAXObject.Functionality.method,
        	swifJAXObject.Functionality.url
    	);
        xhr.send(swifJAXObject.ActionData);

	}
	/*
	 ** swifJAXBootstrapper **
		* Gets the Data from the Action Mapper
		* @param {string} actionName 
		* @excute {object} related Data object
	*/
	function swifJAXBootstrapper(SWpayload){
		// Setting the action name to the instence.
		this.Action = getActionType(SWpayload);
		// Setting the action Data to the instence.
		this.ActionData = getActionData(SWpayload);
		// Setting the action functionallty from the Action Mapper  to the instence.
		this.Functionality = getActionRelatedData(this.Action);
		// check if the object is a dom object to pass it to the instence.
		if(SWpayload.tagName){
			this.Functionality.triggerer = SWpayload;
		}
		// check if there is a before send ?
		checkBeforeSendCall(this.Functionality['beforeSend']);
		
		xhrCaller(this);
	}
	/*
	 ** getActionRelatedData **
		* Gets the Data from the Action Mapper
		* @param {string} actionName 
		* @return {object} related Data object
	*/
	function getActionRelatedData (actionName) {
		if(getType(ActionMapper[actionName]) == 'undefined'){
			throwSwif('actionNotFound',actionName);
			return;
		}
		return ActionMapper[actionName];
	}
	function checkBeforeSendCall (fun) {
		if(getType(fun) == 'function')
			fun();
	}
	// Helper functions:

	/*
	 ** getActionType **
		* Gets the Type from Object
		* @param {object} obj 
		* @return {string} actionType
	*/
	function getActionType(obj){
		// check the data is from a literal object or the object is a Dom
		var actionType = obj.swaction || obj.dataset.swaction;

		return isThisThingOk(actionType) ?
				 actionType :
				 throwSwif('missingData','SWAction');
	}
	/*
	 ** getActionData **
		* Gets the Data from Object
		* @param {object} obj 
		* @return {string} actionData
	*/
	function getActionData(obj){
		// check the data is from a literal object or the object is a Dom
		var actionData = obj.swdata || obj.dataset.swdata;

		// Check wither the passed Data is a string so we can parse it || the passed data is already parsed.
		actionData = getType(actionData) == 'string' ? parseStringToData(actionData) : actionData;

		return isThisThingOk(actionData) ?
				 actionData :
				 throwSwif('missingData','SWData');
	}
	/*
	 ** parseStringToData **
		* Parse String to Object
		* @param {string} data -> stringified JSON
		* @return {obj} Parsed Object
	*/
	function parseStringToData(data){
		// Better check with IE Issues.
		var parsedData = "";
		try{
			parsedData = JSON.parse(data)
		}
		catch(e){
			parsedData = data;
		}
		return parsedData;
	}
	/*
	 ** isThisThingOk **
		* Checks the availabilty of an object
		* @param {string || number || object} theThing 
		* @return {bool} true || false
	*/
	function isThisThingOk(theThing){
		return (theThing == undefined || theThing == "") ?  false :  true;
	}
	/*
	 ** throwSwif **
		* Throw Swif Exception provided by :
		* @param {string} type -> type of the exception
		* @param {string} paramsToPass -> desired param
		* @return {bool} false ->  SwifJAX : Missing data Attribute -> { SWData }
	*/
	function throwSwif(type,paramsToPass){
		var messageText;

		switch(type) {
		    case "actionNotFound":
		        messageText = "Selected Action is missing!";
		        break;
		    case "missingData":
		        messageText = "Missing data Attribute";
		        break;
		}

		throw "SwifJAX : "+ messageText + " -> { " +paramsToPass + " }";
		return false;
	}
	/** getType **
		* Get type of a thing
		* @param {string} theThing -> type of the exception
		* @return {string} ->  type of the thing
	*/
	function getType(theThing){
		return typeof theThing;
	}


	return {
		execute : function(SWpayload){
			if(getActionType(SWpayload) && getActionData(SWpayload)){
				new swifJAXBootstrapper(SWpayload);
			}
		},
		getQue : function(BTpayload){
			return "Que";
		}
	}
}