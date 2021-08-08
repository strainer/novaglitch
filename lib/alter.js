// Tock/alter.js - 3D Physics Engine
/** @author Andrew Strain */

var Talter=newTalter()

/* inject shapes, build orbits etc, make/remove selections */

function newTalter(s) { return (function(s) {
  'use strict'
  
  var floor=Math.floor, sqrt=Math.sqrt, tau=2*Math.PI, pi=Math.PI
  var i,tkLc,tkVl,tkCl,tkQa
  var tkClb
  
  function setstate(s)
  { tkLc=s.tkLc ; tkVl=s.tkVl ; 
    tkCl= s.tkCl ; tkQa=s.tkQa ;
    tkClb=s.tkClb
  }
    
  //thet begins at 0, thet is pi/2 in middle
  function insertSphere(cx,cy,cz,a,n,rad,drf,drs,s) {
    
    var ni=floor(sqrt(n))
    var i=a*3,thd=tau/ni
    for(var thet=0;thet<pi;thet+=thd) {
      for(var phi=0;phi<tau;phi+=thd) {
        _tocarte(rad,thet,phi)
        tkLc[i++]=cx+_x+drf()*drs
        tkLc[i++]=cy+_y+drf()*drs
        tkLc[i++]=cz+_z+drf()*drs
      }
    }
    return ni*ni
  }

  //thet begins at 0, thet is pi/2 in middle
  //sin 0 = 0, sin pi/2 =1 sin pi =0
  function insertaSphere(cx,cy,cz,a,n,rad,drf,drs,s) {
    
    var ni=floor(sqrt(n))
    var i=a*3,thd=tau/ni
    
    for(var thet=0.5;thet<ni;thet+=1) {
      for(var phi=0;phi<tau;phi+=thd) {
        _tocarte(rad,Math.asin(((thet*2/ni)-1))+pi/2,phi)
        tkLc[i++]=cx+_x+drf()*drs
        tkLc[i++]=cy+_y+drf()*drs
        tkLc[i++]=cz+_z+drf()*drs
      }
    }
    return ni*ni
  }
    
  function insertRing(cx,cy,cz,a,n,rad, phi, drf,drs) {
    
    var i=a*3, thd=tau/n
    for(var thet=0;thet<tau;thet+=thd) {

      _tocarte(rad,thet,phi)
      tkLc[i++]=cx+_x+drf()*drs
      tkLc[i++]=cy+_y+drf()*drs
      tkLc[i++]=cz+_z+drf()*drs

    }
    return n
  }
  
  function insertCluster(cx,cy,cz,a,n,rad,drf,drs) {
    
    var i=a*3 ; n=n*3 +i
    while(i<n) {
      tkLc[i++]=cx+drf()*rad
      tkLc[i++]=cy+drf()*rad
      tkLc[i++]=cz+drf()*rad
    
      tkVl[i-3]=drf()*drs
      tkVl[i-2]=drf()*drs
      tkVl[i-1]=drf()*drs
    }
    return n
  } 

  function insertSpinRing(cx,cy,cz,a,n,rad, phi, drf,drs,vs) {
    
    var i=a*3, thd=tau/n
    for(var thet=0;thet<tau;thet+=thd) {
      
      var th=thet+Fdrandom.fgnorm()
      _tocarte(rad,th,phi+Fdrandom.fgnorm(-0.1,0.1))
      tkLc[i++]=cx+_x+drf()*drs
      tkLc[i++]=cy+_y+drf()*drs
      tkLc[i++]=cz+_z+drf()*drs

      _tocarte(sqrt(1/rad),th+Math.PI/2,phi)
      tkVl[i-3]=_x+drf()*vs
      tkVl[i-2]=_y+drf()*vs
      tkVl[i-1]=_z+drf()*vs
    }
    
    return i/3-a
  }

  function insertOrbitalCluster(cx,cy,cz,a,n,rad,dphi,frad,ffac)
  {
    var i=a*3; var ni=n*3+i
    while( i<ni ) {
      var f48=Fdrandom.f48
      _tocarte(rad+frad()*ffac, Math.asin(((f48()*2)-1))+pi/2,f48()*tau)
      tkLc[i  ]=_x+cx
      tkLc[i+1]=_y+cy
      tkLc[i+2]=_z+cz
      _toorbitinzx(tkLc[i+0],tkLc[i+1],tkLc[i+2],0) //012 210 201 102 021 120	
      tkVl[i  ]=_x
      tkVl[i+1]=_y
      tkVl[i+2]=_z
      
      i+=3	
    }
    
    return n
  }

  function _toorbitinzx(rx,ry,rz,dphi) {
    
    _topolar( rx,ry,rz )
    _tocarte( sqrt(1/_rad), _the, _phi )
    var c=_z ; _z=_x; _x=_y; _y=c
  }
  
  function rndFill(phys,spread)
  {
    var i=0
    
    while(i < phys.length)
    { 
      phys[i++]=(randf()-0.5)*spread
      phys[i++]=(randf()-0.5)*spread
      phys[i++]=(randf()-0.5)*spread	
    }
  }

  function rndRectaFill(phys,spread)
  {
    var n=spread, n2=n/2; i=0 
    var bnc=0, bncp=0, bncpx=0, bncpy=0, bncpz=0
    var x,y,z, wx=0,wy=0,wz=0
    
    while(i < phys.length)
    { if(bnc<3)
      { 
        bnc=( randf()*randf()*(phys.length-i)/5 )+1
        bncpx=(((randf()-0.5)*n)*3)/4
        bncpy=(((randf()-0.5)*n)*3)/4
        bncpz=(((randf()-0.5)*n)*3)/4
        wx=randf()*n2
        wy=randf()*n2
        wz=randf()*n2
      }
      
      x=(randf()-0.5)*wx; y=(randf()-0.5)*wy; z=(randf()-0.5)*wz

      phys[i]=bncpx+x; phys[i+1]=bncpy+y; phys[i+2]=bncpz+z

      i=i+3
      bnc--
    }
  }

  var shrinki=0;
  function pulsevel(t)
  {
    shrinki++;
    var shfc= (1+Math.sin(shrinki/100))*t
    for( i=0;i<tkQa; )
    { 
      tkVl[i]-=tkLc[i++]*shfc
    }
  }

  var shrinki2=0;
  function pulsepos(f)
  {
    shrinki2++;
    var shfc= (Math.sin(shrinki2/88))*f
    for( i=0;i<tkQa;  )
    { 
      tkLc[i]=tkLc[i++]*shfc
      tkLc[i]=tkLc[i++]*shfc
      tkLc[i]=tkLc[i++]*shfc
    }
  }

    //move all tacks by their velocity
    //have an elastic central tether, 
    //whose force increases by square of tack distance from center
    //this will arrest all tacks at points where force balances out
    //modulate the power of the elestic force to keep tacks in motion

  function rndmovep()
  {
    var scale=1;
    for ( var i = 0; i < tkQa; i += 3 ) {
      // rawpos
      var vx = randf();
      var vy = randf();
      var vz = randf();
      tkVl[ i ]     = vx;
      tkVl[ i + 1 ] = vy;
      tkVl[ i + 2 ] = vz;
      tkLc[ i ]     += (vx*scale-scale/2)|0;
      tkLc[ i + 1 ] += (vy*scale-scale/2)|0;
      tkLc[ i + 2 ] += (vz*scale-scale/2)|0;
    }
    return
  }

  function velmove(t)
  {
    for(var i=0;i<tkQa;)
    { 
      _topolar(tkVl[i],tkVl[i+1],tkVl[i+2])
      _rad -= sqrt(_rad)*0.005-0.003
      _tocarte(_rad,_the,_phi)
      
      tkVl[i]=_x;tkVl[i+1]=_y;tkVl[i+2]=_z
      
      tkLc[i]=tkLc[i]+tkVl[i++]*t
      tkLc[i]=tkLc[i]+tkVl[i++]*t
      tkLc[i]=tkLc[i]+tkVl[i++]*t
    }
  }
    
  function gravity(G)
  {
    for(var i=0;i<tkQa;)
    { 
      var f=tkLc[i]*tkLc[i] + tkLc[i+1]*tkLc[i+1] + tkLc[i+2]*tkLc[i+2]+0.001
      f=f*sqrt(f)	
      tkVl[i] -= tkLc[i++]/f*G
      tkVl[i] -= tkLc[i++]/f*G
      tkVl[i] -= tkLc[i++]/f*G
    }
  }
  
  var mb=[]
  
  function addbody(x,y,z, vx,vy,vz, G)
  { mb.push([x,y,z, vx,vy,vz, G]) }

  function clearbodies()
  { mb=[] }
    
  function gravitybody(vt,g)
  {
    var ca=tkLc[0],cb=tkLc[1],cc=tkLc[2]
    tkLc[0]=ca, tkLc[1]=cb, tkLc[2]=cc

    for(var i=0;i<mb.length;i++){
      for(var j=0;j<mb.length;j++) {  //i is the static
        
        var xi=mb[i][0],yi=mb[i][1],zi=mb[i][2]
        var xj=mb[j][0],yj=mb[j][1],zj=mb[j][2]
        
        var dx=xj-xi
        var dy=yj-yi
        var dz=zj-zi
        
        var jx=dx+(mb[i][3]-mb[j][3])*0.5 
        var jy=dy+(mb[i][4]-mb[j][4])*0.5
        var jz=dz+(mb[i][5]-mb[j][5])*0.5
        
        var f=jx*jx + jy*jy + jz*jz 
        f*=g
        
        var epsil=1
        f+=3.5
        f= (f>epsil) ? f:sqrt(f+0.2)
        f= mb[i][6]/(f*sqrt(f))
              
        ///future force is applied in present direction 
        mb[j][3] -= dx*f
        mb[j][4] -= dy*f
        mb[j][5] -= dz*f
      }
    }
    
    //~ var ca=mb[0][0],cb=mb[0][1],cc=mb[0][2]

    for(var i=1;i<mb.length;i++)
    {
      mb[i][0]+=mb[i][3]*vt	
      mb[i][1]+=mb[i][4]*vt	
      mb[i][2]+=mb[i][5]*vt	
    }
    
    //~ mb[0][0]=ca ,mb[0][1]=cb ,mb[0][2]=cc
        
  }
  
  var gbd
  
  function pregrav_v(){
    gbd=new Array(mb.length*4)
    var i=0

    for(var gbody=0; gbody<mb.length;gbody++){

      gbd[i++] = mb[gbody][0], gbd[i++]=mb[gbody][1]
     ,gbd[i++] = mb[gbody][2], gbd[i++]=mb[gbody][6]

    }
  }
  
  var DBcalls = 0, DBlim = 100000000;
  //~ if ((++DBcalls) > DBlim) { debugger; }

  
  function gravity_v(gg)
  {
    var gn=gbd.length 
    var grvrange=500 // Fdrandom.fgbell(0,100)
            
    for(var i=0,g=0 ; i<tkQa ; )
    { 
      var dx=tkLc[i  ]-gbd[g++]
      var dy=tkLc[i+1]-gbd[g++]
      var dz=tkLc[i+2]-gbd[g++]
      
      var G=gbd[g++]*gg
      
      //~ if ((++DBcalls) > DBlim) { debugger; }
             
      var jx=dx - tkVl[i  ]* 0.5
      var jy=dy - tkVl[i+1]* 0.5
      var jz=dz - tkVl[i+2]* 0.5
        
        ///force is calced half step in future, try the past
      var dist=(jx*jx + jy*jy + jz*jz) 
      if( dist < g*grvrange) {
        
        //nuke fuze causes ripplezone,eats or creates energy
        //f= (f>epsil) ? f : (f+epsil)*0.33333333 
        
        dist+=0.2
        if (dist<1.5) { dist= ( dist+(1.5-dist)*0.5 ) } //nuke fuze

        var f=G/(dist*sqrt(dist))
        
        ///future force is applied in present direction 
        tkVl[i  ] -= dx*f//-tkVl[i]*0.0001
        tkVl[i+1] -= dy*f//-tkVl[i+1]*0.0001
        tkVl[i+2] -= dz*f//-tkVl[i+2]*0.0001
      }
      
      if((g===gn)) { g=0; i=i+3 }
    }
  
  }
  
  function gravity_i()
  {
    for(var gbody=0; gbody<mb.length;gbody++){
        
      var x=mb[gbody][0], y=mb[gbody][1]
         ,z=mb[gbody][2], G=mb[gbody][6]
      
      for(var i=0;i<tkQa;)
      { 
        var dx=tkLc[i  ]-x
        var dy=tkLc[i+1]-y
        var dz=tkLc[i+2]-z
               
        var jx=dx-tkVl[i  ]*0.5
        var jy=dy-tkVl[i+1]*0.5
        var jz=dz-tkVl[i+2]*0.5
        
        ///force is calced half step in future, try the past
        var f=jx*jx + jy*jy + jz*jz 
        
        var epsil=1
        f= (f>epsil) ? f:sqrt(f+0.2) //nuke fuze
        f=f*sqrt(f)
              
        ///future force is applied in present direction 
        tkVl[i++] -= dx/f*G
        tkVl[i++] -= dy/f*G
        tkVl[i++] -= dz/f*G
      }
    }
  }
  
  function velcolor(f)
  { 
    for(var i=0;i<tkQa; i+=3)
    { var k=(Fdrandom.next()+Fdrandom.next())*0.17*f
      tkCl[i  ] = tkClb[i  ] +(k+Math.abs(tkVl[i  ]+tkVl[i+1])*k )
      tkCl[i+1] = tkClb[i+1] +(k+Math.abs(tkVl[i+1]+tkVl[i+2])*k )
      tkCl[i+2] = tkClb[i+2] +(k+Math.abs(tkVl[i+2]+tkVl[i  ])*k )
    }
  }
  
  function basecolor(a,e,x,y,z,fz)
  { 
    while(a<e)
    { var u=fz()
      tkClb[a++]=x*u 
      tkClb[a++]=y*u 
      tkClb[a++]=z*u 
    }
  }
  
  //plotting

  var _the,_phi,_rad
  function _topolar(x,y,z) {
    _rad = Math.sqrt(x*x+y*y+z*z)
    _the = Math.acos(z/_rad) 
    _phi = Math.atan2(y,x) 
  }
  
  function topolar(x,y,z) {
    var r=Math.sqrt(x*x+y*y+z*z)
    return [
      r,
      Math.acos(z/r),
      Math.atan2(y,x)
    ]
  }
  
  var _x,_y,_z
  function _tocarte(r,t,p) {
    _x=r*Math.sin(t)*Math.cos(p)
    _y=r*Math.sin(t)*Math.sin(p)
    _z=r*Math.cos(t)
  }
    
  function tocarte(r,t,p) {
    return [
       r*Math.sin(t)*Math.cos(p)
      ,r*Math.sin(t)*Math.sin(p)
      ,r*Math.cos(t)
    ]
  }
  
  function pointline(Ao,aloc,oloc,n,e)
  {
    if(!Ao) Ao= new Array(n*3)
    if(!e) e = Ao.length*3
    var ui=1/n
    for(var i=0,ii=0; i<n; i++) {
      Ao[ii++]=aloc[0]+oloc[0]*(i*ui)
      Ao[ii++]=aloc[1]+oloc[1]*(i*ui)
      Ao[ii++]=aloc[2]+oloc[2]*(i*ui)
    }
    return Ao
  }
  
  function randf()
  //~ { return Fdrandom.gaus(0.1,0.5) }
  { return Fdrandom.fgteat()+0.5 }
  
  
  return {
     rndFill       :rndFill
    ,rndRectaFill  :rndRectaFill
    ,pulsevel      :pulsevel
    ,pulsepos      :pulsepos
    ,rndmovep      :rndmovep
    ,velmove       :velmove
    ,velcolor      :velcolor
    ,basecolor     :basecolor
    ,randf         :randf
    ,setstate      :setstate
    ,tocarte       :tocarte
    ,insertRing    :insertRing
    ,insertSpinRing:insertSpinRing
    ,insertSphere  :insertSphere
    ,insertaSphere :insertaSphere
    ,insertCluster :insertCluster
    ,gravity_i     :gravity_i
    ,gravitybody   :gravitybody
    ,addbody       :addbody
    ,clearbodies   :clearbodies
    ,insertOrbitalCluster : insertOrbitalCluster
    ,pregrav_v     :pregrav_v
    ,gravity_v     :gravity_v
  }

}(s))} //newalter

