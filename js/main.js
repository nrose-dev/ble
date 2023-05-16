// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');
var isOnline;

// Helpers.
const defaultDeviceName = 'USBATT';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = '') => {
  terminalContainer.insertAdjacentHTML('beforeend',
      `<div${type && ` class="${type}"`}>${message}</div>`);

  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
};

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function(data) {
  logToTerminal(data, 'in');
};

// Override default log method to output messages to the terminal and console.
terminal._log = function(...messages) {
  // We can't use `super._log()` here.
  messages.forEach((message) => {
    logToTerminal(message);
    console.log(message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outcoming data to the terminal.
const send = (data) => {
  terminal.send(data).
      then(() => logToTerminal(data, 'out')).
      catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
    connect2BLE();
  /*terminal.connect().
      then(() => {
        deviceNameLabel.textContent = terminal.getDeviceName() ?
            terminal.getDeviceName() : defaultDeviceName;
      
      });*/
    //hideElement('device-name');
    //displayElement('com-menu');
});

function connect2BLE(){
    //displayElement('connect');
    terminal.connect().
      then(() => {
        hideElement('co-name');
        deviceNameLabel.textContent = terminal.getDeviceName() ?
            terminal.getDeviceName() : defaultDeviceName;
        
        //catch((error) => logToTerminal(error));
        //deviceNameLabel.textContent = '\<img style="height:30px; width:45px;" src="https://www.usbattery.com/wp-content/uploads/2018/09/header-logo-ret-300x149.png"\>'+deviceNameLabel.textContent;
        hideElement('connect');
        displayElement('com-menu');
        document.getElementById("vitalsButton").style.opacity = 0.3;
        displayElement('vitalsButton');
        displayElement('disconnect');
        displayElement('device-name');
      });
}

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceNameLabel.textContent = defaultDeviceName;
    
  //catch((error) => logToTerminal(error));
  displayElement('co-name');
  hideElement('device-name');
  hideElement('com-menu');
  hideElement('vitalsButton');
  hideElement('disconnect');
  displayElement('connect');
    
  hideElement('vitals');
  displayElement('terminal');
  hideElement('send-form');
});

sendForm.addEventListener('submit', (event) => {
  event.preventDefault();

  send(inputField.value);

  inputField.value = '';
  inputField.focus();
});

// Switch terminal auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
      terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});

function hideElement (ele) {
    
    var e = retEle(ele);
    if (e){
        if (e.style.display=="none" || e.style.display.includes("inline")){
            return (0);
        }
        e.style.display="none";
        return(1);
    }
    else{
        return(0); // element does not exist

        //alert (ele+" No longer valid");
        //showMessage ("Hide "+ele+" No longer valid","red",0);
    }
}
function displayElement (ele,blk) {
    var e = retEle(ele);
    if (!e){
        return(0);
    }
    e.hidden=false; // anything displayed should be unhidden
    if (!blk){
        if (e.style.display.includes("inline")){
            return; //don't clear inline-block
        }
        blk = "";
    }
    isOnline = navigator.onLine;

    if (!isOnline){
        
        e.style.display=blk;

        //disableEle(ele); // if we are offline then this element should be hidden
        return (1); // success

    }else{
        //alert ("displayelement "+ele);
        //document.getElementById(ele).style.display="";
        if (e){
            if (e.style.display==blk){
                return(0); // already displayed
            }
            e.style.display=blk;
            return (1); // success
        }
        else{
            return(0);
            //alert (ele+" No longer valid");
            //showMessage ("Display "+ele+" No longer valid","red",0);

        }
    }
    
}

// check if e is a string or already an html element and convert to or return the element
function retEle (e){
    if (typeof e === 'string' || e instanceof String){
        e = document.getElementById(e);
    } // not string then it must already be an element pointer
    return (e);
}

function isHidden(ele){
    var domele = retEle(ele);
    if (!domele){
        return;
    }
    if (domele.style.display=="none"){
        return (1); // is is hidden
    }
    return (domele.hidden);
}

function loadSend(base){
    var p1;
    
    switch (base){
        case "AT+NAME":
            base += " USBATT";
            // get the Unique Pack ID from the user and add it to the base 
            base += prompt("Enter the Unique Pack ID?");
            
            break;
        case "BlinkLED":
            p1 = prompt("Enter ON time in ms?");
            // check for valid input
            base += " "+p1;
            p1 = prompt("Enter OFF time in ms?");
            // check for valid input
            base += " "+p1;
            break;
        case "AT+POWE":
            // get a value between 0 and 9 to set the power
            p1 = prompt("Enter the new BLE Power Level between 0-9?");
            // check for valid input
            // get the Unique Pack ID from the user and add it to the base 
            base += " "+p1;
            break;
        case "BlinkButton":
            p1 = prompt("Enter ON time in ms?");
            base += " "+p1;
            // check for valid input
            p1 = prompt("Enter OFF time in ms?");
            // check for valid input
            base += " "+p1;
            break;
        case "WriteEvent":
            p1 = prompt("Enter 5 bit Event Code in Hex (0 - 1F)?");
            base += " "+p1;
            // check for valid input
            p1 = prompt("Enter 11 bit Reason Code in Hex (0 - 3FF)?");
            // check for valid input
            base += " "+p1;
            p1 = prompt("Enter 16 bit Parm Code in Hex (0 - FFFF)?");
            // check for valid input
            base += " "+p1;
            break;
        case "ChangeLED":
            p1 = prompt("Enter the 5 bit hex value for the new LED (0-1F)?");
            // check for valid input
            base += " "+p1;
            break;
        case "SetLongPress":
            p1 = prompt("Enter the Long Press time in seconds (0-15)?");
            // check for valid input
            base += " "+p1;
            break;
        case "SetMuteTime":
            p1 = prompt("Enter the LED Mute time in seconds (0-600)?");
            // check for valid input
            base += " "+p1;
            break;
        case "ReadEvent":
            p1 = prompt("Enter the 5 bit hex value for the new LED (0-1F)?");
            // check for valid input
            base += " "+p1;
            break;
        case "SetPISD":
            /*if (typeof wp === "number") {
    // number here
} else if (typeof wp === "string") {
    // string here
}*/
            p1 = prompt("Enter the Pack In Service Date in Unix EPOCH seconds, dd/MM/yyyy hh:mm or blank for current date?");
            if (p1 == ""){
                p1 = new Date();
            } else if (isNaN(p1)){
                p1 = new Date(p1);
            }
            // check for valid input
            base += " "+p1;
            break;
        case "displayvitals":
            if (isHidden("vitals")){
                document.getElementById("vitalsButton").style.opacity = 1;
                hideElement("com-menu");
                displayElement('vitals');
                displayElement('send-form');
                hideElement('terminal');
            }else{
                document.getElementById("vitalsButton").style.opacity = 0.3;
                hideElement('vitals');
                displayElement("com-menu");
                displayElement('terminal');
                hideElement('send-form');
            }
            
            break;
        default:
            break;
    }
    
    //sendStr = document.getElementById("send-form");
    inputField.value =  base; // not sure if loading place holder is necessary
    
    //displayElement("send-form"); // unfortunately I think the user has to actually hit the send button
    
    terminal.send(base).
      then(() => logToTerminal(base, 'out')).
      catch((error) => logToTerminal(error));
    
}
//window.onload = connect2BLE();