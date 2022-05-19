  
if ( typeof(Detector)!=="undefined" && !Detector.webgl )
{ Detector.addGetWebGLMessage(); exit() }

var gplay = {
  framefix:20,
  framec:0,
  gdelay:5,
  hasbeeped:false,
  haszoomed:false,
  reloaded:0,
  particles:20000, geometry:{}, camera:{}, scene:{}, renderer:{},
  tStat:{},
  camRad:200, camRadd:15, camThet:0, camPhi:Math.PI/6, spincam:0,
  keyY:0, keyX:0, keyZ:0, 
  paused:1, explode:0, 
  gravity:1, bgravity:0, cgravity:0.999,
  vtimef:0.2,
  velfz:0.15,
  pradius:0.04,
  slow:1,
  scount:0,
  audio:false
}

///
var Fd=Fdrandom.pot()

gplay.tStat = new rStats({CSSPath:"./libx/"}); 
togglestats()

window.addEventListener( 'resize', onWindowResize, false )

function cvset(arg){ gplay[arg[0]]=arg[1] }

keysys.whilst("q"    , function(){ gplay.slow--; if(gplay.slow<1)gplay.slow=1 } )
keysys.whilst("w"    , function(){ gplay.slow++; if(gplay.slow>30)gplay.slow=30 } )

keysys.whilst("up"    , cvset , ["keyY", 1] )
keysys.whilst("down"  , cvset , ["keyY",-1] )
keysys.whilst("left"  , cvset , ["keyX", 1] )
keysys.whilst("right" , cvset , ["keyX",-1] )
keysys.whilst("z"     , cvset , ["keyZ", 1] )
keysys.whilst("a"     , cvset , ["keyZ",-1] )
keysys.whenup("up"    , cvset , ["keyY", 0] )
keysys.whenup("down"  , cvset , ["keyY", 0] )
keysys.whenup("left"  , cvset , ["keyX", 0] )
keysys.whenup("right" , cvset , ["keyX", 0] )
keysys.whenup("z"     , cvset , ["keyZ", 0] )
keysys.whenup("a"     , cvset , ["keyZ", 0] )
keysys.whenup("n"     , function(){ /*gplay.gravity=gplay.cgravity*/ } )

keysys.whenst ("p"    , function(){ 
  gplay.paused = (gplay.paused)^1 
  if !(gplay.hasbeeped) { gplay.hasbeeped = true; gplay.audio = 1; }
  if(gplay.audio) { audio.play() }
} )
keysys.whenst ("b"    , function(){ 
  gplay.hasbeeped = true;
  gplay.audio = (gplay.audio)^1
  if(gplay.audio) { audio.play() }
  else{ audio.pause() }
} )
//~ keysys.whenst ("e"    , function(){ gplay.explode = (gplay.explode)^1 } )
keysys.whilst ("n"    , function(){ gplay.gravity=0.01 } )
keysys.whenst ("w"    , function(){ gplay.spincam = (gplay.spincam)^1 } )
keysys.whenst ("s"    , togglestats )

keysys.whenst ("r"    , function() { 
  if(gplay.reloaded++>1&&!gplay.hasbeeped&&Fd.rbit())
  { gplay.audio = 1 ; audio.play() ; gplay.hasbeeped=true }
    writestate(); display();
} )

init_three()

var origin3=new THREE.Vector3( 0, 0, 0 )

Tcore.defoTacks(
  gplay.geometry.getAttribute( 'position' ).array
 ,gplay.geometry.getAttribute( 'color' ).array
)

var TS=Tcore.getstate()

Talter.setstate    ( TS )
//~ Talter.rndFill     ( TS.tkLc, 90 )
//~ Talter.rndRectaFill( TS.tkVl, 15 )

//~ Talter.insertRing(cx,cy,cz,a,n,rad, phi, drf,drs)

var bpartic=0,cpartic=0

function writestate(){
  
gplay.framec=0

bpartic=0,cpartic=0
Tcore.clearstate()
Talter.clearbodies()

//~ Talter.rndRectaFill( TS.tkVl, 15 )
gplay.gravity=1
gplay.vtimef=1
gplay.velfz=0.001
gplay.posfz=0.3

//function insertSpinRing(cx,cy,cz,a,n,rad, phi, drf,drs,vs) {
//
for(var q=3;q<1500;q=q+1.5) {

  cpartic += Talter.insertSpinRing(
    q*Fdrandom.fgnorm(-0.071,0.071),
    q*Fdrandom.fgnorm(-0.071,0.071),
    q*Fdrandom.fgnorm(-0.071,0.071),
    bpartic, Math.floor(1500/(q))+2, 
    7+q/4, 0, Fdrandom.fgteat,
    2.5+Math.sqrt(40/(q+1)),
    Math.pow(0.017/(q+1),0.25)*0.5
  )
  //~ console.log(cpartic)

  Talter.basecolor(bpartic*3,cpartic*3, 0.5/Math.pow(q,0.4), 0.6/Math.pow(q,0.3)+0.1, 0.9-q/3000,
   function(){ return Fdrandom.fgteat(1,0.5) } )

  bpartic=cpartic

}

console.log("bpartic"+bpartic)


//central star
//insertOrbitalCluster(cx,cy,cz,a,n,rad,dphi,frad,ffac)
//~ cpartic += Talter.insertaSphere(0,0,0,bpartic,1500,rad=15,Fdrandom.fgthorn,0,0)


///The outer starfeild
cpartic += Talter.insertOrbitalCluster(
  0,0,0, bpartic,1500, rad=500,0, Fdrandom.fgthorn,200
)

Talter.basecolor(
 bpartic*3,cpartic*3, 0.3, 0.6, 2.2,
 function(){ return Fdrandom.fgnorm(0,1) }
);
bpartic=cpartic


///center star more outer atmosphere

cpartic += Talter.insertOrbitalCluster(
  0,0,0, bpartic,1500, rad=7.5,0, Fdrandom.fgteat,5.0
)
Talter.basecolor(bpartic*3,cpartic*3, 2.8, 0.1, 0.1,
 function(){ return Fdrandom.fgteat(1,0.5) })
bpartic=cpartic


///center star outer atmosphere

cpartic += Talter.insertOrbitalCluster(
  0,0,0, bpartic,1500, rad=4,0, Fdrandom.fgteat,3.0
)
Talter.basecolor(bpartic*3,cpartic*3, 2.8, 0.4, 0.2,
 function(){ return Fdrandom.fgteat(1,0.5) })
bpartic=cpartic

///star inner atmosphere

cpartic += Talter.insertOrbitalCluster(
  0,0,0, bpartic,1200, rad=3,0, Fdrandom.fgteat,1.9
)
Talter.basecolor(bpartic*3,cpartic*3, 4.1, 0.3, 0.1,
 function(){ return Fdrandom.fgteat(1,0.5) })
bpartic=cpartic

///core star

cpartic += Talter.insertOrbitalCluster(
  0,0,0, bpartic,1500, rad=1.0,0, Fdrandom.fgteat,0.3
)
Talter.basecolor(bpartic*3,cpartic*3, 0.8, 1.9, 4.2,
 function(){ return Fdrandom.fgteat(1,0.5) })
bpartic=cpartic

console.log("bpartic"+bpartic)

//iaddbody(x,y,z,     tx,ty,tz,         G,    r, g,b,     rad,   fo1  fo2  qn
iaddbody(0,0,0,     0.001,-0.001,0.001, 3.0,  3.8,2.0,0.0,  0.3, 0.3, 0,  1)
iaddbody(37,5,-10,  -0.04,-0.03,0.07,  0.03,  4.8,1.0,0.0,  0.3, 0.3, 0,  700)
iaddbody(22,5,-10,  -0.04,-0.03,0.07,  0.03,  1.8,1.0,1.0,  0.6, 0.3, 0,  900)
iaddbody(-10,37,5,  0.07,-0.04,-0.03,  0.02,  0.8,0.2,3.0,  0.2, 0.3, 0,  800)
iaddbody(40,7,-13,  -0.03,-0.04,0.07,  0.04,  3.2,0.0,0.7,  0.5, 0.3, 0,  600)
iaddbody(20,8,-11,  -0.03,-0.04,0.07,  0.04,  1.1,3.0,0.7,  0.5, 0.3, 0,  400)
iaddbody(7,-13,30,  -0.04,0.07,-0.03,  0.06,  0.4,4.0,0.1,  1.5, 0.5, 0,  600)

function iaddbody(x,y,z,tx,ty,tz, G, r,g,b, rad, fo1,fo2, qn){
  
  Talter.addbody( x,y,z,tx,ty,tz, G )
  ,  0.03
  cpartic += Talter.insertOrbitalCluster(
    x,y,z,  bpartic, qn,  rad, fo2,  Fdrandom.fgnorm, fo1
  )
  Talter.basecolor(bpartic*3,cpartic*3, r,g,b
   ,function(){ return Fdrandom.fgnorm(0,1) })
  bpartic=cpartic
}
console.log("bpartic"+bpartic)
//console.log(TS)
//~ ipartic += Talter.insertRing(0,0,0,ipartic,2000,50, Math.PI/3, Fdrandom.fgteat,1)
//~ ipartic += Talter.insertRing(0,0,0,ipartic,2000,50, Math.PI*2/3, Fdrandom.fgteat,1)
//~ ipartic += Talter.insertRing(0,0,0,ipartic,2000,50, Math.PI, Fdrandom.fgteat,1)

Talter.velcolor(0.6)
Tcore.tksToThree()

gplay.gravity=Fd.fgteat(0.01,0.2)
}

writestate()
Tcore.tksToThree()
display()

runner()

function runner() {
  requestAnimationFrame(runner)
  if (keysys.dokeys() ||!gplay.paused) {
    if (!gplay.paused){ action() }
    display()
  }
}

function init_three() {
  
  var container = document.getElementById( 'threediv' );
  
  gplay.camera = new THREE.PerspectiveCamera( 28
    ,( window.innerWidth-gplay.framefix) / (window.innerHeight-gplay.framefix)
    , 1, 1200000 )
  
  //gplay.camera.position.z = 195

  gplay.scene = new THREE.Scene()
//gplay.scene.fog = new THREE.Fog( 0x000000, 500, 4500 )

  gplay.geometry = new THREE.BufferGeometry()

  gplay.geometry.addAttribute('position',new Float32Array( gplay.particles * 3 ), 3 )
  gplay.geometry.addAttribute('color',   new Float32Array( gplay.particles * 3 ), 3 )
  
  gplay.geometry.computeBoundingSphere()

  var material = new THREE.ParticleSystemMaterial( { size: gplay.pradius, vertexColors: true } )

  gplay.particleSystem = new THREE.ParticleSystem( gplay.geometry, material )
  gplay.scene.add( gplay.particleSystem )

  gplay.renderer = new THREE.WebGLRenderer( { antialias: true } )

  gplay.renderer.setClearColor( 0x000000, 1 )
  gplay.renderer.setSize( window.innerWidth-gplay.framefix, window.innerHeight-gplay.framefix )

  container.appendChild( gplay.renderer.domElement )

}


function togglestats()
{
  var el = document.getElementById("rstatsd")
  if( el.style.display == 'none') el.style.display = 'block'
  else el.style.display = 'none'
}

function onWindowResize() {

  gplay.camera.aspect = 
    (window.innerWidth-gplay.framefix) / (window.innerHeight-gplay.framefix)
  gplay.camera.updateProjectionMatrix()
  gplay.renderer.setSize( 
    window.innerWidth-gplay.framefix, window.innerHeight-gplay.framefix )
  display()
}

function ctrlcam()
{
  gplay.geometry.attributes.color.needsUpdate = true
  gplay.geometry.attributes.position.needsUpdate = true
  
  if(gplay.keyZ!=0) gplay.haszoomed = true
  var cu=1-gplay.keyZ*0.1
  gplay.camRad  /= cu
  if(gplay.keyZ) gplay.camRadd=gplay.camRad
  
  gplay.camThet -= gplay.keyX*0.025
  gplay.camPhi  -= gplay.keyY*0.025
  
  var camo=Talter.tocarte(gplay.camRad,gplay.camThet,gplay.camPhi)
  
  //~ gplay.camera.position.x=camo[0]
  //~ gplay.camera.position.y=camo[1]
  //~ gplay.camera.position.z=camo[2]
  if(!gplay.paused && !gplay.haszoomed) 
    gplay.camRad=(gplay.camRad-gplay.camRadd)*0.99 + gplay.camRadd

  gplay.camera.position.z=gplay.camRad
  
  gplay.particleSystem.rotation.x= gplay.camPhi
  gplay.particleSystem.rotation.y= gplay.camThet
  gplay.particleSystem.rotation.z= 0

  //gplay.camera.lookAt(origin3)
  
  //~ gplay.camera.position.z = gplay.camera.position.z + gplay.keyZ*5
  //~ gplay.camera.position.x = gplay.camera.position.x - gplay.keyX/2 
  //~ gplay.camera.position.y = gplay.camera.position.y - gplay.keyY/2 
  //~ gplay.particleSystem.rotation.y = gplay.particleSystem.rotation.y +gplay.keyX/20
  //~ gplay.particleSystem.rotation.x = gplay.particleSystem.rotation.x -gplay.keyY/20
  
}


function spincam(s)
{
  s=s||1
  gplay.geometry.attributes.color.needsUpdate = true
  gplay.geometry.attributes.position.needsUpdate = true
  
  var cammv=Math.sin(s*gplay.framec/280)
  var cammv2=Math.sin(s*gplay.framec/(280*6))

  gplay.camera.position.z+=         s*(Math.abs(cammv)*cammv*2.0 -cammv2/22)
  gplay.particleSystem.rotation.y+= s*(Math.pow(Math.sin(gplay.framec/400),25)/30)
  gplay.particleSystem.rotation.x+= s*(Math.pow(Math.sin(gplay.framec/1600),45)/15)
  
}

var DBcalls = 0, DBlim = 100000000;
//~ if ((++DBcalls) > DBlim) { debugger; }

function action() {

  gplay.framec+=1
  
  gplay.tStat('frame').start()
  gplay.tStat('rAF').tick()
  gplay.tStat('FPS').frame()
   
  //~ Tcore.blasta()
  //~ Tcore.velmove(0.1)
  //~ Tcore.pulsevel(1)
  
  var cmv=0
  
  
  if ((!gplay.paused)&&((gplay.scount++)%gplay.slow==0)){ 
    
    if (gplay.gravity){
      if(gplay.framec==gplay.gdelay) gplay.gravity=gplay.cgravity 
      
      gplay.tStat('gravity_v').start()
      Talter.pregrav_v()
      Talter.gravity_v(gplay.gravity)
      Talter.gravitybody(gplay.vtimef,gplay.gravity)
      gplay.tStat('gravity_v').end()	
      }
    
    gplay.tStat('chopworld').start()
    if((gplay.framec)++%16==3) Tcore.chopWorld(bpartic)
    gplay.tStat('chopworld').end()
    
    cmv=gplay.vtimef
  }
  
  if (gplay.explode){ 
    gplay.tStat('pulsevel').start()
    Talter.pulsevel(0.001)
    gplay.tStat('pulsevel').end()
    //Tcore.pulsepos(0.016)
    
    gplay.tStat('velmove').start()
    //~ Talter.velmove(gplay.vtimef)
    gplay.tStat('velmove').end()
    
    gplay.tStat('chopworld').start()
    //~ Tcore.chopWorld()
    gplay.tStat('chopworld').end()
  }
  
  gplay.tStat('velmove').start()
  Talter.velmove(cmv)
  gplay.tStat('velmove').end()

  gplay.tStat('velcolor').start()
  Talter.velcolor(0.8)
  gplay.tStat('velcolor').end()
  
  gplay.tStat('tksToThree').start()
  Tcore.tksToThree()
  gplay.tStat('tksToThree').end()

}

function display(){
 
  //~ gplay.tStat('velcolor').start()
  //~ outtake.velcolor(1,TS.tkCl,TS.tkLc)  //gamma, brightness
  //~ gplay.tStat('velcolor').end()

  gplay.tStat('ctrlcam').start()
  ctrlcam()
  gplay.tStat('ctrlcam').end()

  gplay.tStat('spincam').start()	
  if(gplay.spincam) spincam()
  gplay.tStat('spincam').end()
  
  gplay.tStat('render').start()
  gplay.renderer.render( gplay.scene, gplay.camera )
  gplay.tStat('render').end()
  
  gplay.tStat('frame').end() 
  gplay.tStat().update()
}
