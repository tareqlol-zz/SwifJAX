var SwifJAX = function(Mapper){
    'use strict';
    var ActionMapper = Mapper,
        SwifJAXEventsArray = [
            'swClick',
            'swChange',
            'swSubmit'
        ];
    initSwifJAX();
    /**
     ** xhrCaller **
     * Creates a XHR Object loaded by the data
     * @param {object} swifJAXObject -> Instance
     * @execute related Call back
     */
    function xhrCaller(swifJAXObject){

        var xhr = getType(XMLHttpRequest) != 'undefined'
            ? new XMLHttpRequest()
            : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.onreadystatechange = function() {
            var status;
            if (xhr.readyState == 4) { // done ?
                status = xhr.status;
                if (status == 200) { // status code ok ?
                    var callBack
                    if(isThisUndefined(swifJAXObject.Functionality['success'])){
                    }
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
        return 'up';
    }
    /**
     ** swifJAXBootstrapper **
     * Gets the Data from the Action Mapper
     * @param {object} SWpayload
     * @execute {object} related Data object
     */
    function swifJAXBootstrapper(SWpayload){
        var SWXHRObject,
            currentAction = getActionType(SWpayload),
            currentActionData = getActionData(SWpayload),
            currentFunctionality = getActionRelatedData(currentAction);

        SWXHRObject = {
            // Setting the action name to the Instance.
            Action : currentAction,
            // Setting the action Data to the Instance.
            ActionData : currentActionData,
            // Setting the action functionality from the Action Mapper to the Instance.
            Functionality : currentFunctionality
        };

        // check if the object is a dom object to pass it to the Instance.
        if(SWpayload.tagName){
            SWXHRObject.Functionality.triggerer = SWpayload;
        }
        // check if there is a before send ?
        checkBeforeSendCall(SWXHRObject.Functionality['beforeSend']);

        return xhrCaller(SWXHRObject);

    }
    /**
     ** initSwifJAX **
     * Initiate the SwifJAX by adding a class of 'SwifJAX' , calling after that the event delegation.
     * */
    function initSwifJAX(){
        // getting the html element.
        var html = document.getElementsByTagName('html')[0],
        // getting the current classes.
            currentClasses = html.className;
        // setting the plugin's class to the html.
        html.className =  'SwifJAX ' + currentClasses;

        // delegate the html elements
        delegateEvents(html)
    }
    /**
    ** delegateEvents **
    * delegates the predefined events of SwifJAX
     * @param : obj {object}
    * */
    function delegateEvents(obj){
        var eventsLength = SwifJAXEventsArray.length - 1;
        // Self-Invoked Function to loop through the events
        (function eventsBindingLoop(){
            // Caching the current event
            var currentEvent = SwifJAXEventsArray[eventsLength];
            // Delegating the events on the html page, getting the current event by replacing the sw of the name of the event
            // swClick -> click
            crossAddEventHandler(obj,currentEvent.replace('sw','').toLowerCase(),function(e){
                var target = e ? e.target : window.event.srcElement;
                if(target.className.search(currentEvent) != -1){
                    swifJAXBootstrapper(target);
                }
            });
            if(eventsLength == 0){
                return;
            }
            eventsLength--;
            eventsBindingLoop();
        })(SwifJAXEventsArray,eventsLength,obj)
    }
    /**
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

    /**
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
    /**
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
    /**
     ** parseStringToData **
     * Parse String to Object
     * @param {string} data -> stringified JSON
     * @return {object} Parsed Object
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
    /**
     ** isThisThingOk **
     * Checks the availability of an object
     * @param {string || number || object} theThing
     * @return {boolean} true || false
     */
    function isThisThingOk(theThing){
        return (!(theThing == undefined || theThing == ""));
    }
    /**
     ** isThisUndefined **
     * Checks the availability of an object
     * @param {string || number || object} theThing
     * @return {boolean} true || false
     */
    function isThisUndefined(theThing){
        return (theThing == undefined);
    }
    /**
     ** throwSwif **
     * Throw Swif Exception provided by :
     * @param {string} type -> type of the exception
     * @param {string} paramsToPass -> desired param
     * @return {boolean} false ->  SwifJAX : Missing data Attribute -> { SWData }
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
    }
    /** getType **
     * Get type of a thing
     * @param {string || number || object} theThing -> type of the exception
     * @return {string} ->  type of the thing
     */
    function getType(theThing){
        return typeof theThing;
    }
    /**
     ** crossAddEventHandler **
     * helper function to support multi browser event handler
     * @param obj {object}
     * @param evt {string}
     * @param handler {function}
     * */
    function crossAddEventHandler(obj, evt, handler) {
        if(obj.addEventListener) {
            // W3C method
            obj.addEventListener(evt, handler, false);
        } else if(obj.attachEvent) {
            // IE method.
            obj.attachEvent('on'+evt, handler);
        } else {
            // Old school method.
            obj['on'+evt] = handler;
        }
    }
    /**
     ** Revealing the SwifJAX methods **
     */
    return {
        execute : function(SWpayload){
            if(getActionType(SWpayload) && getActionData(SWpayload)){
                return swifJAXBootstrapper(SWpayload);

            }
        },
        getQue : function(SWpayload){
            return "Que";
        }
    }
};