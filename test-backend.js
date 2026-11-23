// Run with Code.gs loaded first in a JavaScript runtime.
function assert(condition,message){if(!condition)throw new Error(message);}
const valid={id:'12345678-1234-1234-1234-123456789abc',eventName:'Sample event',eventDate:'2027-02-14',name:'Sample provider',address:'Kampala',email:'test@example.com',phone:'+256 700 123456',services:'Sound system',currency:'UGX',total:'100',deposit:'25',method:'Bank',consent:true,website:''};
assert(validate_(valid).balance===75,'Balance calculation');
assert(validate_({...valid,total:'0.30',deposit:'0.10'}).balance===0.2,'Decimal precision');
function rejects(patch){let failed=false;try{validate_({...valid,...patch});}catch(e){failed=true;}assert(failed,'Expected rejection: '+JSON.stringify(patch));}
rejects({deposit:'101'});rejects({total:'-1'});rejects({total:'NaN'});rejects({consent:false});rejects({email:'invalid'});rejects({eventDate:'2027-02-30'});rejects({website:'bot'});rejects({services:''});rejects({method:'Other'});
assert(cell_('=IMPORTXML("url")').charAt(0)==="'",'Formula neutralization');
assert(cell_('+256 700').charAt(0)==="'",'Phone treated as text');
assert(cell_('Normal text')==='Normal text','Normal values preserved');
let rows=[],released=0,enabled=true;
var PropertiesService={getScriptProperties:()=>({getProperty:key=>key==='ACCEPTING_RESPONSES'?(enabled?'true':'false'):'sheet-id'})};
var LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released++})};
const sheet={getLastRow:()=>rows.length+1,getRange:(r,c)=>r===1?{getValues:()=>[HEADERS]}:{createTextFinder:id=>({matchEntireCell:()=>({findNext:()=>rows.some(row=>row[1]===id)})})},appendRow:row=>rows.push(row)};
var SpreadsheetApp={openById:()=>({getSheetByName:()=>sheet}),flush:()=>{}};
assert(submitForm(valid).ok,'Successful save');assert(rows.length===1,'One row saved');assert(rows[0][12]===75,'Stored balance');
submitForm(valid);assert(rows.length===1,'Retries deduplicated');assert(released===2,'Lock released');
enabled=false;let closed=false;try{submitForm(valid);}catch(e){closed=true;}assert(closed&&rows.length===1,'Closed form cannot write');
'Backend checks passed';
