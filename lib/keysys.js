//keysys.whenst(key,fnc,args)  //key fires fnc on hit
//keysys.whilst(key,fnc,args) //key fires fnc whilst held
//keysys.after(key,fnc,args)  //key fires fnc on release
//keysys.dokeyed()               //fire fncs
//keysys.pause() .resume()       //     
//keysys.clearkeyed              //
//keysys2=keysys.newKeySet()     //

var keysys = newKeySet_glbl()

function newKeySet_glbl(){ return (function(){
		
	if(typeof document !=='undefined'){ 
		document.addEventListener("keydown" , notekeyon)	
		document.addEventListener("keyup" , notekeyoff)	
  }
  
  var keycodes = {
		"backspace":8,"tab":9,"clear":12,"enter":13,"shift":16,
		"ctrl":17,"alt":18,"pause":19,"escape":27,"space":32,
		"pageup":33,"pagedown":34,"end":35,"home":36,
		"left":37,"up":38,"right":39,"down":40,
		"select":41,"print":42,"insert":45,"delete":46,
		"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,
		"a":65,"b":66,"c":67,"d":68,"e":69,"f":70,"g":71,"h":72,"i":73,
		"j":74,"k":75,"l":76,"m":77,"n":78,"o":79,"p":80,"q":81,"r":82,
		"s":83,"t":84,"u":85,"v":86,"w":87,"x":88,"y":89,"z":90,
		"f1":112,"f2":113,"f3":114,"f4":115,"f5":116,
		"f6":117,"f7":118,"f8":119,"f9":120,"f10":121,
		",":188,".":190,"/":191,"[":219,"]":221,"\\":220
  }

  var onhit={}, onhold={}, onrelease={}
  var active=1, atime=0, delay=500
  var kbstate={} 
  var c, i
  
  function pause()      { active=false }
  function resume()     { active=true }
  function clear()      { onhit={} ; onhold={} ; onrelease={} }
  function clearkeyed() { kbstate={} }
  
  function setrepeat(ms) { delay=ms }
  
  function whenst(key,fnc,arg)
  { onhit[keycodes[key]]  = {"fnc":fnc, "arg":arg} }
  
  function whenup(key,fnc,arg)
  { onrelease[keycodes[key]]  = {"fnc":fnc, "arg":arg} }
	
	function whilst(key,fnc,arg,x) {
  	if (isFinite(key)){ x=key; key=fnc; fnc=arg; arg=x }
	  else{ x=delay }
	  onhold[keycodes[key]] = {"fnc":fnc,"arg":arg,"dly":x} 
	}
	
  function notekeyon(event) { kbstate[event.keyCode]=Date.now() }
	  
  function notekeyoff(event) { kbstate[event.keyCode]=-1 }
	
	var ctime=Date.now()
	
  function dokeys() {
    
    if(!active) return
    var didk=0
    var ntime=Date.now()
    
    for ( c in kbstate ) {
			if (kbstate.hasOwnProperty(c) && kbstate[c]) { 
				if(onhit[c] && kbstate[c]>ctime) {
					didk++;(onhit[c].fnc)(onhit[c].arg)
				}
				
				if(kbstate[c]==-1) {
					kbstate[c]=false; 
					if(onrelease[c]) { didk++;(onrelease[c].fnc)(onrelease[c].arg) }
				}else{
					if(onhold[c]) { //!implement repeat
						didk++;(onhold[c].fnc)(onhold[c].arg)		
					}
				}
			}
    }
    ctime=ntime+0.1
    return didk
	}
  
  function newkeyset() { return newKeySet_glbl }
  
  return {
	  pause:pause, resume:resume, clear:clear, clearkeyed:clearkeyed,
	  setrepeat:setrepeat,
	  whenst:whenst, whenup:whenup, 
	  whilst:whilst,
	  newkeyset:newkeyset,
	  dokeys:dokeys
	}    
	
})()}
