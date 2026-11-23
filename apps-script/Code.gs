const HEADERS = ['Received at','Submission ID','Event','Event date','Provider name','Address','Email','Phone','Services','Currency','Total cost','Deposit','Balance','Payment method','Contact consent'];
function doGet(){return HtmlService.createHtmlOutputFromFile('Form').setTitle('Kenganda | Service provider form').addMetaTag('viewport','width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);}
function getFormConfig(){
 const p=PropertiesService.getScriptProperties();
 return {accepting:p.getProperty('ACCEPTING_RESPONSES')==='true'&&!!p.getProperty('SPREADSHEET_ID')};
}
function clean_(value,label,max){
 if(typeof value!=='string'||!value.trim()||value.length>max) throw new Error('Please check '+label+'.');
 return value.trim();
}
function amount_(value,label){
 if(typeof value!=='string'||!/^\d{1,12}(\.\d{1,2})?$/.test(value)) throw new Error('Please check '+label+'.');
 return Math.round(Number(value)*100);
}
function validate_(data){
 if(!data||typeof data!=='object'||data.website) throw new Error('Unable to accept this submission.');
 const v={};
 [['name',120],['address',300],['email',200],['phone',40],['services',4000],['eventName',160],['eventDate',10]].forEach(([key,max])=>v[key]=clean_(data[key],key,max));
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)||!Number.isFinite(Date.parse(v.eventDate))||new Date(v.eventDate).toISOString().slice(0,10)!==v.eventDate) throw new Error('Please enter a valid event date.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) throw new Error('Please check your email address.');
 if(!/^[+()\d .-]{6,40}$/.test(v.phone)) throw new Error('Please check your phone number.');
 if(!['UGX','USD','KES','EUR','GBP'].includes(data.currency)) throw new Error('Please select a currency.');
 if(!['Mobile Money','Cash','Bank'].includes(data.method)) throw new Error('Please select a payment method.');
 if(data.consent!==true) throw new Error('Please confirm permission to contact you.');
 if(!/^[a-f0-9-]{36}$/i.test(data.id||'')) throw new Error('Invalid submission reference. Reload the form.');
 const total=amount_(data.total,'total cost'),deposit=amount_(data.deposit,'deposit');
 if(total<=0||deposit>total) throw new Error('The total must be positive and the deposit cannot exceed it.');
 return {...v,id:data.id,total:total/100,deposit:deposit/100,balance:(total-deposit)/100,currency:data.currency,method:data.method};
}
function cell_(value){return /^[=+@\-\t\r\n]/.test(value)?"'"+value:value;}
function submitForm(data){
 const v=validate_(data),config=getFormConfig();
 if(!config.accepting) throw new Error('This form is not currently accepting submissions.');
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(10000)) throw new Error('The form is busy. Please try again.');
 try{
  const sheet=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')).getSheetByName('Responses');
  if(!sheet||sheet.getRange(1,1,1,HEADERS.length).getValues()[0].join('|')!==HEADERS.join('|')) throw new Error('Response sheet configuration needs attention.');
  const last=sheet.getLastRow();
  if(last>1&&sheet.getRange(2,2,last-1,1).createTextFinder(v.id).matchEntireCell(true).findNext()) return {ok:true,id:v.id};
  const row=[new Date(),v.id,v.eventName,v.eventDate,v.name,v.address,v.email,v.phone,v.services,v.currency,v.total,v.deposit,v.balance,v.method,'Yes'];
  sheet.appendRow(row.map(x=>typeof x==='string'?cell_(x):x));SpreadsheetApp.flush();return {ok:true,id:v.id};
 }finally{lock.releaseLock();}
}
