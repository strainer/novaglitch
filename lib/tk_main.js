if ( ! Detector.webgl ){ Detector.addGetWebGLMessage(); exit() }

///

var gkbd = { keyY:0, keyX:0, keyZ:0, paused:0, keyBup:1, keyC:0 }

var gplay = {
  framefix:20,
  framec:0,
  particles:30000,
  geometry:{}, camera:{}, scene:{}, renderer:{},
  tStat:{},
}

///

gplay.tStat = new rStats({CSSPath:"./libx/"}) ; togglestats()

init_keys()
init_three()

Tock.defoTacks(
	gplay.geometry.getAttribute( 'position' ).array
 ,gplay.geometry.getAttribute( 'color' ).array
)

var TS=Tock.getState()

Tock.rndFill     ( TS.tkLc, 90 )
Tock.rndRectaFill( TS.tkVl, 15 )

Tock.tksToThree()

runner()

function runner(){
	requestAnimationFrame(runner)
	action()
	display()
}

function init_three() {
	
	var container = document.getElementById( 'threediv' );
	
	gplay.camera = new THREE.PerspectiveCamera( 28
	  ,( window.innerWidth-gplay.framefix) / (window.innerHeight-gplay.framefix)
	  , 1, 12000 )
	
	gplay.camera.position.z = 195

	gplay.scene = new THREE.Scene()
//gplay.scene.fog = new THREE.Fog( 0x000000, 500, 4500 )

	gplay.geometry = new THREE.BufferGeometry()

	gplay.geometry.addAttribute('position',new Float32Array( gplay.particles * 3 ), 3 )
	gplay.geometry.addAttribute('color',   new Float32Array( gplay.particles * 3 ), 3 )
	
	gplay.geometry.computeBoundingSphere()

	var material = new THREE.ParticleSystemMaterial( { size: 1, vertexColors: true } )

	gplay.particleSystem = new THREE.ParticleSystem( gplay.geometry, material )
	gplay.scene.add( gplay.particleSystem )

	gplay.renderer = new THREE.WebGLRenderer( { antialias: true } )

	gplay.renderer.setClearColor( 0x000000, 1 )
	gplay.renderer.setSize( window.innerWidth-gplay.framefix, window.innerHeight-gplay.framefix )

	container.appendChild( gplay.renderer.domElement )

}


function init_keys()
{
  window.addEventListener( 'resize', onWindowResize, false )
	document.addEventListener("keydown",keyDownHandler, false)	
	document.addEventListener("keyup",keyUpHandler, false)	
}

function togglestats()
{
	var el = document.getElementById("rstatsd")
	if( el.style.display == 'none') el.style.display = 'block'
	else el.style.display = 'none'
}

function keyDownHandler(event)
{ 
	switch(event.keyCode)
	{
		case 38: gkbd.keyY= 1 ; break
		case 40: gkbd.keyY=-1 ; break
		case 37: gkbd.keyX=-1 ; break
		case 39: gkbd.keyX= 1 ; break
		case 65: gkbd.keyZ=-1 ; break
		case 90: gkbd.keyZ= 1 ; break 
		
		case 66: { 
			gkbd.paused = gkbd.keyBup 
			break
		}
		
		case 67: togglestats() ; break
		case 123: debugger; break //f12	this doesnt stop the script as exp 	
	}
}

function keyUpHandler(event)
{
	switch(event.keyCode)
	{	case 38: gkbd.keyY=0 ; break
		case 40: gkbd.keyY=0 ; break
		case 37: gkbd.keyX=0 ; break
		case 39: gkbd.keyX=0 ; break
		case 65: gkbd.keyZ=0 ; break
		case 66: {
			gkbd.keyBup ^= 1 
			break
    }		
		case 90: gkbd.keyZ=0 ; break 
	}
}

function onWindowResize() {

	gplay.camera.aspect = 
	  (window.innerWidth-gplay.framefix) / (window.innerHeight-gplay.framefix)
	gplay.camera.updateProjectionMatrix()
	gplay.renderer.setSize( 
	  window.innerWidth-gplay.framefix, window.innerHeight-gplay.framefix )
}


function ctrlcam()
{
	gplay.geometry.attributes.color.needsUpdate = true
	gplay.geometry.attributes.position.needsUpdate = true
	
	if(gkbd.keyZ==1){ gplay.camera.position.z = gplay.camera.position.z+(gkbd.keyZ*5); }
	if(gkbd.keyZ==-1){ gplay.camera.position.z = gplay.camera.position.z+(gkbd.keyZ*5); }
	if(gkbd.keyX==1||gkbd.keyX==-1){ gplay.camera.position.x = gplay.camera.position.x-(gkbd.keyX/2) }
	if(gkbd.keyY==1||gkbd.keyY==-1){ gplay.camera.position.y = gplay.camera.position.y-(gkbd.keyY/2) }
	
	if(gkbd.keyX==-1||gkbd.keyX==1)
	{ gplay.particleSystem.rotation.y = gplay.particleSystem.rotation.y +gkbd.keyX/20; }
	
	if(gkbd.keyY==-1||gkbd.keyY==1)
	{ gplay.particleSystem.rotation.x = gplay.particleSystem.rotation.x -gkbd.keyY/20; }	
}


function spincam()
{
	gplay.geometry.attributes.color.needsUpdate = true
	gplay.geometry.attributes.position.needsUpdate = true
	
	var cammv=Math.sin(gplay.framec/280)
	var cammv2=Math.sin(gplay.framec/(280*6))

	gplay.camera.position.z+=         Math.abs(cammv)*cammv*2.0 -cammv2/22
	gplay.particleSystem.rotation.y+= Math.pow(Math.sin(gplay.framec/400),25)/30
	gplay.particleSystem.rotation.x+= Math.pow(Math.sin(gplay.framec/1600),45)/15
	
}

function action() {

	gplay.framec+=1
	
	gplay.tStat('frame').start()
	gplay.tStat('rAF').tick()
	gplay.tStat('FPS').frame()
	 
	//~ Tock.blasta()
	//~ Tock.velmove(0.1)
	//~ Tock.pulsevel(1)
	if (!gkbd.paused){ 
		gplay.tStat('pulsevel').start()
		Tock.pulsevel(0.001)
		gplay.tStat('pulsevel').end()
		//Tock.pulsepos(0.016)
		
		gplay.tStat('velmove').start()
		outtake.velmove(0.2,TS.tkLc,TS.tkVl)
		gplay.tStat('velmove').end()
		
		gplay.tStat('chopworld').start()
		Tock.chopWorld()
		gplay.tStat('chopworld').end()
	}
	
}

function display(){
 
  //~ gplay.tStat('velcolor').start()
	//~ outtake.velcolor(1,TS.tkCl,TS.tkLc)  //gamma, brightness
	//~ gplay.tStat('velcolor').end()

	gplay.tStat('tksToThree').start()
	Tock.tksToThree()
	gplay.tStat('tksToThree').end()
	
	gplay.tStat('ctrlcam').start()
	ctrlcam()
	gplay.tStat('ctrlcam').end()

	gplay.tStat('spincam').start()	
	if(!gkbd.paused) spincam()
	gplay.tStat('spincam').end()
	
	gplay.tStat('render').start()
	gplay.renderer.render( gplay.scene, gplay.camera )
	gplay.tStat('render').end()
	
	gplay.tStat('frame').end() 
	gplay.tStat().update()
}
