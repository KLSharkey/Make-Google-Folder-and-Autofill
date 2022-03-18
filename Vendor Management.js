function myFunction() {
  
  var vendorSheet = SpreadsheetApp.getActiveSheet();  //get current sheet
  
  var cell = vendorSheet.getRange('H2');
  var rule = cell.getDataValidation();
  var criteria = rule.getCriteriaType();
  var args = rule.getCriteriaValues();
  //Logger.log('The data validation rule is %s %s', criteria, args);
 
  var lastRow = vendorSheet.getLastRow();
  
  //createSlackPost();
  //for (i = 0; i < 5; i++) {
  //text += "The number is " + i + "<br>";
//}
  
  var toSlackArr = [];
  for (i = 2; i < 8; i++) {
    vendorinfo = vendorSheet.getRange(lastRow , i);
    toSlackArr.push(vendorinfo.getValue());
  }
  //var range = vendorSheet.getRange(lastRow , 2); 
  //var vendorName = range.getValue();
  createSlackPost(toSlackArr);
  
  //Logger.log(lastRow);
  //var stringRow = num.toString(lastRow);
  columnH = "H"
  var rowID = columnH.concat(lastRow);
  Logger.log("rowID " + rowID);
  Logger.log(lastRow); 
  vendorSheet.getRange(rowID).setValue(args[0]);
  createVendorFolder(lastRow);
  
  
  //TODO create version status for Request(?)
}

function createVendorFolder(lastRow) {
 Logger.log("here");
// identify the sheet where the data resides 
  var ss = SpreadsheetApp.getActive();
  var names = ss.getSheetByName("Vendor Response Spreadsheet");
  //var lastRow =lastRow; 
//identify the cell that will be used to name the folder  
  //var vendorName = names.getRange(names.getLastRow(), 4).getValue();  
 var range = names.getRange(lastRow , 4); 
 var vendorName = range.getValue();
  Logger.log(vendorName);
//identify the parent folder the new folder will be in 
  var parentFolder=DriveApp.getFolderById("[insert ID]");
  Logger.log("here");
//create the new folder 
  var newFolder=parentFolder.createFolder(vendorName);
  var idFolder = newFolder.getId();
  Logger.log(idFolder);
  createVendorSpreadsheet(idFolder);

}

function createVendorSpreadsheet(idFolder) {
var sheetActive = SpreadsheetApp.openById("[insert ID]");

var destFolder = DriveApp.getFolderById(idFolder); //create destination
  DriveApp.getFileById(sheetActive.getId()).makeCopy("Vendor Due Diligence Spreadsheet", destFolder); //puts copy in destination 
Logger.log("file in dest");
}


function onEdit(event) {
  Logger.log("event");
  var sheet = event.range.getSheet();
  var actRng = event.source.getActiveRange();
  var index = actRng.getRowIndex();
  var cIndex = actRng.getColumnIndex();
  Logger.log(cIndex);
  
  Logger.log(typeof cIndex);
  Logger.log(cIndex);
  
  if(sheet.getName() == "Vendor Response Spreadsheet"){
    // correct sheet
    //Logger.log("here");
    
    var actRng = event.source.getActiveRange();
    var index = actRng.getRowIndex();
    //Logger.log("here");
    var oldValue = event.oldValue;
    var newValue = event.value;
    if (cIndex == 8.0) {
      // correct column
      Logger.log("Column H"); 
      
      var time = new Date();                   // timestamp

      var active_spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      var output_sheet = active_spreadsheet.getSheetByName("Status Version Control");
      
      output_sheet.appendRow([index, time, oldValue, newValue, Session.getActiveUser()]);
    }
  }
}

// Create an incoming webhook here - https://api.slack.com/incoming-webhooks
var POST_URL = "https://hooks.slack.com/services/[insert ID]";

//When form submitted
function createSlackPost(SlackArr) {

  var email = SlackArr[0];
  var vendorForm = [];
  
  var questions = ["Requester's Email Address", "Name", "Vendor Name", "Contact Email", "Website", "What is the use for the vendor"]
      for (var i = 0, x = SlackArr.length + 1; i<x; i++) {
        //Get the title of the form item being iterated on
        vendorForm.push({"title": questions[i] , "value": SlackArr[i]}) //getItem is for question
        Logger.log(vendorForm);

        
      }
      

  var attachment =
  {
   "attachments": [
        {
            "author_name": email,
            "fields": vendorForm,
            "title": "Google Sheet with Form Responses",
            "title_link": "https://docs.google.com/spreadsheets/d/1[insert ID]"    
        }
    ]
  };
  Logger.log(attachment);
  var options =
  {
    payload: JSON.stringify(attachment)
  };
  
 
  
  UrlFetchApp.fetch(POST_URL, options); // fetch: Makes a request to fetch a URL using optional advanced parameters 
};