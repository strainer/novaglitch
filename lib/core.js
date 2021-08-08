// Tock/core.js - 3D Physics Engine
/** @author Andrew Strain */

var Tcore=newTcore()

function newTcore(){ return (function(){
	//'us strict'

  var randf = Math.random
  var floor = Math.floor
  var clog={}// console.log
  
  if( typeof(Fdrandom) !==undefined ){ randf= Fdrandom.next }
  	
	var thrLc,thrCl  //three arrays
	var tkLc,tkVl    //tack loc,vel   Float32Array(*3
	var tkCl         //tack color     Float32Array(
	var tkClb         //tack color     Float32Array(
	var tkMa         //tack mass      Float32Array(
	var tkGp         //tack group     Uint16Array(
	var tkTy         //tack type      Uint16Array(
	var tkTm         //tack time      Uint16Array(
	var tkQa         //tack vector array n
	var tkQi         //tack size

	var mingrpI, mingrpFc, mingrpLH, mingrpCm   //ming
	var midgrpI, midgrpFc, midgrpLH, midgrpCm   //midg
	var medgrpI, medgrpFc, medgrpLH, medgrpCm   //medg
	var maxgrpI, maxgrpFc, maxgrpLH, maxgrpCm   //maxg

	var mxgrpsz=24, grpszfac=0.75

	var _divs=[1|0,1|0,1|0]  //grid division vector
	var	_divm=[+1 ,+1 ,+1]  //grid div measure vector
	var	gnlow     //grid epsiloned lowbounds vector

	var maxgdiv = 256    //max subdivision of space per iteration
	var maxtks = 64*1024 //max tacks in simulation
  var ctks = 0
  
	//Tack by Sector detail object
	var Rsdo = function()
	{ return { 
			//vals: new Uint16Array( maxtks ),  //max tacks
			cell: new Uint16Array( maxgdiv ),   //roster elements
			cells: 0,                        //number of elements
			divs: new Float32Array(3),      //divisions (each axis)
			divm: new Float32Array(3),      //division measure
			lobnd: new Float32Array(3)      //low bound
			//high bnd is lobnd+divm*divs
		}
	}

	//Tack by Sector detail object
	var Watcher =  { 
			//vals: new Uint16Array( maxtks ),  //max tacks
			surveys: new Uint16Array( maxgdiv ),   //roster elements
			cells: 0,                        //number of elements
			divs: new Float32Array(3),      //divisions (each axis)
			divm: new Float32Array(3),      //division measure
			lobnd: new Float32Array(3)      //low bound
			//high bnd is lobnd+divm*divs
		}

	
	
	
	
	var Ros=[]; //Tacks by Sector detail array 

	//--wrkspace
	
	var _slw3=[+1,+1,+1]
	var _shi3=[+1,+1,+1]
	
	function surcell_lw3(Isec,dvs,dvm,low) //checked
	{ var xsec,ysec,zsec
		
		var R=Isec/dvs[0] , U=Math.floor(R)	
		ysec=(U)%dvs[1]
		xsec=Isec-U*dvs[0]
		zsec=(U-ysec)/dvs[1]

		//return [low[0]+xsec*dvm[0],low[1]+ysec*dvm[1],low[2]+zsec*dvm[2]]
		
		_slw3[0]=low[0]+xsec*dvm[0]
		_slw3[1]=low[1]+ysec*dvm[1]
		_slw3[2]=low[2]+zsec*dvm[2]
		
	}

	function surcell_lwhi3(Isec,dvs,dvm,low) //checked
	{ var xsec,ysec,zsec
		
		var R=Isec/dvs[0] , U=Math.floor(R)	
		ysec=(U)%dvs[1]
		xsec=Isec-U*dvs[0]
		zsec=(U-ysec)/dvs[1]

		//return [low[0]+xsec*dvm[0],low[1]+ysec*dvm[1],low[2]+zsec*dvm[2]]
		
		_slw3[0]=low[0]+xsec*dvm[0]
		_slw3[1]=low[1]+ysec*dvm[1]
		_slw3[2]=low[2]+zsec*dvm[2]
		_shi3[0]=low[0]+(xsec+1)*dvm[0]
		_shi3[1]=low[1]+(ysec+1)*dvm[1]
		_shi3[2]=low[2]+(zsec+1)*dvm[2]
		
	}

	function loctosubcell(x,y,z,lw,dvm,dvs)
	{ return (
			floor((x-lw[0])/dvm[0])                    //*1
		+ floor((y-lw[1])/dvm[1])*dvs[0]             //*1*x 
		+ floor((z-lw[2])/dvm[2])*dvs[0]*dvs[1]      //*1*x*y 
		) 
	}  

	//   ((((((z-lw[2])/dvm[2])|0)*dvs[1])  //alt order
	//+  (((y-lw[1])/dvm[1])|0))*dvs[0])
	//+  (((x-lw[0])/dvm[0])|0)
	///--wrkspace

	///returns low 3 bound of a sector
	//sector is set by dvs[] and dvm[], and low
	//dvs is integer, dvm and low are floated reals

	function chopWorld(ctacks)
	{ 
		topcell(ctacks)
		
		surveycell( 0, 0, ((Fdrandom.fgskip()*(maxgdiv-70)/2)|0)+69 ) 
		
		for( var ci=0; ci<Ros[1].cells; ci++ )
		{ 
			var cpopul=Ros[1].cell[ci+1] - Ros[1].cell[ci]
			
			if(cpopul>mxgrpsz)
			{ surveysub( 1, ci, cpopul ) }
			else
			{ endcell( Ros[1].cell[ci], Ros[1].cell[ci+1] )	}
		}
	}

	//split = tts/tgs
	//for uneven spread half groups content > tgs,
	//  half groups < tgs
	//spread evenness, not efficiently estimable
	//so split for smaller group content target
	//so morethan half groups < actual maximum group size
	//cells = tl/(mxgrpsz*grpszfac)

  function deb_sub(blv,bci,bpop){
	 
		clog("over blv, bcl, pop",blv,bci,bpop)
		
		var h=floor(Ros[blv].cell[bci]+Ros[blv].cell[bci+1]/2)
		
		clog(Ros[blv-1])
		clog(Ros[blv])
		clog(Ros)
		
		clog(tkLc[Rst[ h ]*3],tkLc[Rst[ h ]*3+1],tkLc[Rst[ h ]*3+2])
		clog(tkLc[Rst[ h+1 ]*3],tkLc[Rst[ h+1 ]*3+1],tkLc[Rst[ h+1 ]*3+2])
		clog(tkLc[Rst[ h+2 ]*3],tkLc[Rst[ h+2 ]*3+1],tkLc[Rst[ h+2 ]*3+2])
		
		endcell( Ros[blv].cell[bci], Ros[blv].cell[bci+1] )
		//~ clog("Preobj",Ros[lv-1])
		//~ clog("Potobj",Ros[lv])
		return
	}
	  
	  
	function surveysub( blv, bci, bpop ) //b-level b-sector b-tacksnum
	{ 
		if(blv>8){ 
			endcell( Ros[blv].cell[bci], Ros[blv].cell[bci+1] );
			//~ deb_sub(blv,bci,bpop); debugger; 
			return }
		
		var cdivs= floor(bpop/(mxgrpsz*grpszfac)+1)
		if (cdivs>maxgdiv-1) { cdivs=maxgdiv-1; }
		
		surveycell( blv, bci, cdivs ) 
		
		var lv=blv+1
		
		for(var ci=0; ci<Ros[lv].cells;ci++)
		{
			//~ while(Ros[lv].cell[ci] === (ci<Ros[lv].cells)?Ros[lv].cell[ci=ci+1]:-2){}
			//~ if(ci>Ros[lv].cells){ continue }		
			//~ var cpop=Ros[lv].cell[ci] - Ros[lv].cell[--ci] //popl of ci

			var cpop=Ros[lv].cell[ci+1] - Ros[lv].cell[ci] //popl of ci
			if(cpop==0){ continue }		
			
			if(cpop>mxgrpsz)
			{ surveysub( lv, ci, cpop ) }
			else
			{ 
				if( ((ci+1)%Ros[lv].divs[0]!=0) && //next is not in new xline
						(ci+2<Ros[lv].cells) &&
						( (Ros[lv].cell[ci+2] - Ros[lv].cell[ci]) < mxgrpsz ) 
				) { 				  
				  endcell( Ros[lv].cell[ci], Ros[lv].cell[ci+2] )
					ci++ 
				} else { 
					endcell( Ros[lv].cell[ci], Ros[lv].cell[ci+1] ) 
				}
			}
		}
		
		//subsurveyed
	}

	function topcell(ctacks)
	{ 
		Ros[0]=Rsdo()
		Ros[0].cells=1
		
		Ros[0].cell[0]=0                //first tack i
		Ros[0].cell[1]=ctacks          //after tack i
		Ros[0].cell[2]=ctacks          //after tack i
		
		var low=[tkLc[0], tkLc[1], tkLc[2]]
		var hig=[tkLc[0], tkLc[1], tkLc[2]]  
		var I=-1
		
		for(var i=0; i<Ros[0].cell[1]; i++)
		{ 
			Rst[i]=i
			
			if(tkLc[++I]<low[0])    { low[0]=tkLc[I] }
			else if(tkLc[I]>hig[0]) { hig[0]=tkLc[I] }
			if(tkLc[++I]<low[1])    { low[1]=tkLc[I] } 
			else if(tkLc[I]>hig[1]) { hig[1]=tkLc[I] }
			if(tkLc[++I]<low[2])    { low[2]=tkLc[I] } 
			else if(tkLc[I]>hig[2]) { hig[2]=tkLc[I] } 
			
			//~ if(!(isFinite(tkLc[I])&&isFinite(tkLc[I-1])&&isFinite(tkLc[I-2]))){
					//~ clog("ziigled! ")
					//~ clog(Math.floor(I/3),tkLc[I],tkLc[I-1],tkLc[I-2])
					//~ debugger
			//~ }
		}
		
		Ros[0].lobnd[0]=low[0] ; Ros[0].lobnd[1]=low[1]	; Ros[0].lobnd[2]=low[2]	
		Ros[0].divs[0]=1       ; Ros[0].divs[1]=1       ; Ros[0].divs[2]=1
		
		for(var i=0;i<3;i++){
		
			Ros[0].divm[i]=(hig[i]-low[i])*1.01 // preincrease 
		//dither to blur repeat-grid alignment		
			var p=randf()*Ros[0].divm[i]/4
			var q=randf()*Ros[0].divm[i]/4
			Ros[0].lobnd[i]-=Math.abs(p)
			Ros[0].divm[i]+=Math.abs(q)+Math.abs(p)
		}
				
		//clog("Rst was %o", Rst); 
		return
	}

	var celsize = new Uint16Array(maxgdiv) //contains quantity of peas in sector
	var sctstrt = new Uint16Array(maxgdiv) //contains start index of peas sector in roster
	var celfill = new Uint16Array(maxgdiv) //counts fill of pot while filling roster
	var itkcel  //contains sector of tack at [ri]
	var itkdix  //contains direct index of tack at [ri]
	var Rst   //tack indexs by sector

	//this functions recursion level involves the density of tacks
	//grouping only knows what level to..
	//there should not be outliers, the algorithms scale
	//begins at level 0

	//a roster element contains the start index of a sector in the tacklist
	//the tacklist is a list of tack addresses ordered by sector occupation
	var dbgc=0,gd=0,bd=0

	function surveycell( blv, bci, cells ) //lvl uprost index , cells of divs
	{ 
		var st = Ros[blv].cell[bci]   //starting in rostertack list
		var ov = Ros[blv].cell[bci+1] //finished in rostertack list
		
		var clv=blv+1
		
		if(Ros[clv]==null){ Ros[clv]=Rsdo() }
					
		surcell_lwhi3(bci, Ros[blv].divs, Ros[blv].divm, Ros[blv].lobnd)
    //uses info from Ros.blv to determine sub.blv lw3bound 
    //subs lw3bound is defined by info in blv
    //it is blvs lw3 plus blvs survey matrix * subs survey address
    //

    calcBestGrid(Ros[blv].divm, cells)
    
    //~ clog(Ros,Rst)	
		///_divm, _divs updated - do not alter 
		//uses info from Ros.blv to determine survey matrix

						
		var bust=false
		
		var uhi3=[  /// /// ///
			_slw3[0]+Ros[blv].divm[0],
			_slw3[1]+Ros[blv].divm[1],
			_slw3[2]+Ros[blv].divm[2]
			]  /// /// ///
			
		//~ if(uhi3[0]!==_shi3[0]&&uhi3[1]!==_shi3[1]&&uhi3[2]!==_shi3[2])
		//~ { clog("twonk: ",uhi3,_shi3); bust=true }
		
		/// tweak and test
		for(i=0;i<3;i++){
			if (_slw3[i]+_divs[i]*_divm[i]<uhi3[i]) //each dim i
			{ 
				clog("neeked: ",_divm[i],_divm[i]=floatop.inc(_divm[i]) ); 
				bust=true		
				if ((_slw3[i]+_divs[i]*_divm[i]<uhi3[i])
					||(_slw3[i]+_divm[i]>uhi3[i]))
				{ clog("nookered!"); }
			}
		}	


		Ros[clv].divm[0]=_divm[0]//*1.0001 
		Ros[clv].divm[1]=_divm[1]//*1.0001 
		Ros[clv].divm[2]=_divm[2]//*1.0001

		Ros[clv].lobnd[0]=_slw3[0]
		Ros[clv].lobnd[1]=_slw3[1]
		Ros[clv].lobnd[2]=_slw3[2]

		Ros[clv].divs[0]=_divs[0]
		Ros[clv].divs[1]=_divs[1]
		Ros[clv].divs[2]=_divs[2]
		
		Ros[clv].cells=_divs[0]*_divs[1]*_divs[2]
		
		cells=Ros[clv].cells
		
		//~ clog(Ros,Rst)
			
		for(var i=0; i<=cells; i++) { celfill[i]=0; celsize[i]=0 }
		var tka, cel //, schack=cells*1000
			
		var sn=ov-st
		
		for(var uri=st; uri<ov; uri++)  //for through stretch to make note of members sectors
		{ tka=Rst[uri]*3 //uri address in roster gives address number of point
			
			cel=loctosubcell(
				tkLc[tka], tkLc[tka+1], tkLc[tka+2],
				Ros[clv].lobnd, Ros[clv].divm, Ros[clv].divs 
			) // mod cells to secure**
			  
			//~ if(!(cel<cells&&cel>-1)){
				//~ clog("zoiged! ",uri,cel)
				//~ clog(tka+2,tkLc[tka],tkLc[tka+1],tkLc[tka+2])
				//~ clog(Ros[clv])
				//~ clog(Rst[clv])
			  //~ bust=true
			//~ }
			//cel=(cel+schack)%cells	--this was really stoop	
			itkdix[uri]=Rst[uri]  //cache the tackid of the tack at uri
			itkcel[uri]=cel       //the dwnsector of the tack in the roster at uri
			celsize[cel]++

			//var lw3x =surcell_lw3(cel, Ros[clv].divs, Ros[clv].divm, Ros[clv].lobnd)
			
			//~ if(
				//~ tkLc[tka]<_slw3[0] || (tkLc[tka]>_slw3[0]+Ros[clv].divm)
				//~ ||tkLc[tka+1]<_slw3[1] || (tkLc[tka+1]>_slw3[1]+Ros[clv].divm)
				//~ ||tkLc[tka+2]<_slw3[2] || (tkLc[tka+2]>_slw3[2]+Ros[clv].divm)
			//~ ){
        //~ clog("moaged! ")
			  //~ debugger
			//~ }			
			
		}
		
		//each of st to ov in Rst, sector is noted in itkcel, tacki is note in itkdix
		
		var uca=st  //upcell anchor pos in Rst
		for(var ccel=0; ccel<=cells; ccel++)  //loop through sector to make roster index
		{ Ros[clv].cell[ccel]=uca; uca+=celsize[ccel]; }
		
		for( uca=st; uca<ov; uca++)  //loop through tack refs for put into roster
		{ cel=itkcel[uca]  
			Rst[ Ros[clv].cell[cel]+(celfill[cel]++) ]
				=itkdix[uca] 
		}
    
    //~ clog(Ros,Rst)
    //~ if(true){ debugger }
				
		return
	}

  ///
  ///
	
	var fsz3=0,fmxdiv=0

	function calcBestGrid(sz3,mxdiv)
	{ 	
		if((mxdiv==fmxdiv)&&fsz3[0]==sz3[0]  //simple caching last calc
			&&fsz3[0]==sz3[0]&&fsz3[0]==sz3[0]) { return }
		var put3=[sz3[0],sz3[1],sz3[2]]
		//put3[0]=put3[0]*1.6  //-squeeze more into this axis
		put3=sadd3( put3, (put3[0]+put3[1]+put3[2]+0.1)/1000.0)
		var vol=put3[0]*put3[1]*put3[2] 
		var fak= Math.pow( mxdiv /vol , (0.333334) ) //multi by cbrt to make vol mxdiv
		put3=smult3(put3,fak)            //scalar mult by scale to mxdiv volume
		var rnk=sorti012(put3);
		
		//boost the lowest value up if low, avoid error
		if((put3[rnk[0]])<(mxdiv/65|0)+1) {	 
			var lv=((put3[rnk[0]]|0)+1)
			fak=Math.sqrt(put3[rnk[0]]/lv)
			put3[rnk[0]]=lv
			put3[rnk[1]]=put3[rnk[1]]*fak
			put3[rnk[2]]=put3[rnk[2]]*fak
			if (put3[rnk[1]]<put3[rnk[0]]) { //second has become lower 
				fak=put3[rnk[1]]/(put3[rnk[0]])
				put3[rnk[1]]=put3[rnk[0]] 
				put3[rnk[2]]=put3[rnk[2]]*fak 
			} 
		}
		put3=[ put3[0]|0, put3[1]|0, put3[2]|0 ]
		fak=Math.sqrt((mxdiv/put3[0]*put3[1]*put3[2]))
		if(fak<0.95)
		{ if( put3[rnk[0]]*((put3[rnk[1]]*fak-1)|0)*((put3[rnk[2]]*fak)|0)<=mxdiv )
			{  put3[rnk[1]]=((put3[rnk[1]]*fak-1)|0)
				put3[rnk[2]]=((put3[rnk[2]]*fak)|0) } }
		if( put3[rnk[0]]*((put3[rnk[1]]+1)|0)*((put3[rnk[2]])|0)<=mxdiv )
		{ put3[rnk[1]]+=1; } 
		
		put3[rnk[2]]=(mxdiv/(put3[rnk[0]]*put3[rnk[1]]))|0;
		
		if(put3[rnk[2]]<put3[rnk[1]])
		{ fak=put3[rnk[2]]; put3[rnk[2]]=put3[rnk[1]]; put3[rnk[1]]=fak }
		
		//print(put3, dlen3 , put3[0], put3[0]*put3[1])
		//put3 is now split numbers of grid
		_divs[0]=put3[0]
		,_divs[1]=put3[1]
		,_divs[2]=put3[2];
    _divm[0]=sz3[0]/put3[0]
		,_divm[1]=sz3[1]/put3[1] 
		,_divm[2]=sz3[2]/put3[2];
		
		return 
	}

	///
	///
	
	function sorti012(m) 
	{ if(m[0]<m[1])                               
		{ if(m[1]<m[2]) return [0,1,2]   //1 not largest  
			if(m[0]<m[2]) return [0,2,1] 
			return [2,0,1]  }                                     
		if(m[0]<m[2]) return [1,0,2] 
		if(m[1]<m[2]) return [1,2,0]
		return [2,1,0] 
	}

	function delt3(a,b)
	{ return [b[0]-a[0], b[1]-a[1], b[2]-a[2]] }
	function smult3(a,b)
	{ return [ a[0]*b, a[1]*b, a[2]*b] }
	function sadd3(a,b)
	{ return [ a[0]+b, a[1]+b, a[2]+b] }

	function delt3r(a,b,r)
	{ r[0]=b[0]-a[0];r[1]=b[1]-a[1];r[2]=b[2]-a[2];return r }
	function smult3r(a,b,r)
	{ r[0]=a[0]*b;r[1]=a[1]*b;r[2]=a[2]*b;return r }
	function sadd3r(a,b,r)
	{ r[0]=a[0]+b;r[1]=a[1]+b;r[2]=a[2]+b;return r }


	//host
	//subdivide
	//group
	//collide
	//gravitate
	//revise

  
	//for variable size particle sets

	//on particle add, recreate all arrays of characteristic?
	//or maintain totaltacks number, and process to this instead of
	//array length, sync tkLc to thrLc and tkCl to thrCl

	function tksToThree()
	{
		for(var i=0;i<thrLc.length;i++)
		{ thrLc[i]=tkLc[i] }
		for(var i=0;i<thrCl.length;i++)
		{ thrCl[i]=tkCl[i]; }
	}

	//defoTacks, declares sized tock arrays 
	//parallel to given three particle array size
	//and fills tocks arrays using inner functions
	//rndRectaFill and rndfill

	function defoTacks(loca,colr)
	{
		thrLc=loca 
		thrCl=colr
		tkQa=thrLc.length
		tkQi=tkQa/3
		
		tkLc = new Float64Array(tkQa)
		tkVl = new Float64Array(tkQa)
		tkCl = new Float32Array(tkQa)
		tkClb= new Float32Array(tkQa)
		//~ tkMa = new Float32Array(tkQi)
		//~ tkGp = new Uint16Array(tkQi)
		//~ tkTy = new Uint16Array(tkQi)
		//~ tkTm = new Uint16Array(tkQi)
		
		itkcel = new Uint8Array (tkQi)   //contains sector of tack at [ri]
		itkdix = new Uint16Array (tkQi)  //contains address of tack at [ri]
		Rst = new Uint16Array(tkQi)      //contains tack

	}

  //-----------------
    

	var avgLc =[0.0, 0.0, 0.0]
	var avgVl =[0.0, 0.0, 0.0]
	var dfLc, gsz, tka,tkb

	function endcellx(rst,rov) //stub to test chopworld
	{
		for(var ri=rst; ri<rov; ri++)  //ds avg loc and avg vl
		{ tka=Rst[ri]*3;
			tkVl[tka++]=0.35
			tkVl[tka++]=0.35
			tkVl[tka]  =0.35
		}	
		return
	}

	function endcell(rst,rov) //stub to test chopworld
	{ 
		//~ avgLc[0]=0.0; avgLc[1]=0.0; avgLc[2]=0.0;
		avgVl[0]=0.0; avgVl[1]=0.0; avgVl[2]=0.0;
		gsz=(rov-rst)*4
		
		for(var ri=rst; ri<rov; ri++)  //ds avg loc and avg vl
		{ tka=Rst[ri]*3;
			avgVl[0]+=tkVl[tka++]
			avgVl[1]+=tkVl[tka++]
			avgVl[2]+=tkVl[tka]  
		}	
		
		avgVl[0]/=gsz; avgVl[1]/=gsz; avgVl[2]/=gsz

		for(var ri=rst; ri<rov; ri++)  //ds avg loc and avg vl
		{ tka=Rst[ri]*3;
			
			tkVl[tka] -=  (tkVl[tka++]-avgVl[0]*1.1)*0.04
			tkVl[tka] -=  (tkVl[tka++]-avgVl[1]*1.1)*0.04	
			tkVl[tka] -=  (tkVl[tka]-avgVl[2]*1.1)*0.04
							
		}	
 
  }


  ///------------------
  
	var floatop = (function () { //thanks stackoverflow.com/users/1615483/paul-s
		var aint =   new Uint32Array(1),
				afloat = new Float32Array(aint.buffer);
		return {
			i2f: function (i) { aint[0] = i; return afloat[0]; },
			f2i: function (f) { afloat[0] = f; return aint[0]; },
			
			inc: function (f) {
				afloat[0] = f; aint[0] = aint[0] + 1;
				return afloat[0];
			},
			dec: function (f) {
				afloat[0] = f; aint[0] = aint[0] - 1;
				return afloat[0];
			}
		}
	}())
	
	/// groups --------------------------------------------------
		

	//functions which sweep prime addressing space
	//functions which react on time integrating - real time

	//travelling particles cut across the space which its neibours
	//differ by, faster than the spacing
	//particles interaction scope is 
	//travelling particles extend their groups positional span
	//positional span increases likelyness of contact

	//splitting cuboid
	//given a cuboid volume, knowing density
	//calculating string travel in each dimension
	//on travel being greater than density*splitfactor
	//change group > compare travel to other groups
	//and select on better than (accept factor)
	//or make new group

	//splitfactor depends on desired grpsize, cuboid population, and 
	//  decisionscore = (decisionscore +1) /2  marginal contribution
	//  decisionscore = (decisionscore +1/2)   material contribution  

	//running center  
	//  rn_cent+=pdif*(pmass/rn_mass)

	//keeping a sum score for each pot
	//how far is it from testees? hehe
	//how does that compare to global average distances
	//how would it differ to accept modified on individual pot scores?
	//pot with high score should accept on lesser fit because it is far?
	//or greater because it is far?,
	//potscoring may be not helpful
	//this process is designed to do adequate grouping quickly
	//not optimum grouping...

	//objects for potting
	var opos = { x:0, y:0, z:0 }
	var hpos = { x:0, y:0, z:0 }
	var lpos = { x:0, y:0, z:0 }
	var ovel = { x:0, y:0, z:0 }
	var opsv = { x:0, y:0, z:0 }       //pos+vel
	var potGc= { x:0, y:0, z:0, w:0 }

	var potsmax =16,potsize=8
	var ptfill = new Array(potsmax)   //pot numbers preGn[0..7]
	var pttaks = [ new Uint16Array(potsize), //pot index preGi[0..7]
								 new Uint16Array(potsize),
								 new Uint16Array(potsize),
								 new Uint16Array(potsize) ] //...potmax
	var ptcntr = [potsmax][6] //pot center pos&vel preGc[g][0..2]	
		
//------------------------------------------
	function setGroupWorks()
	{   	
		var sc = maxtks/4 //16k
		
		//min group - each group of num sc, 8 prt indices
		//16kA    16*9+32*10, 58 bytes per A, total 928 kB
		mingrpI = 
		[ new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ]          
		
		mingrpFc = new Uint16Array( sc ) //status fillcount
		
		mingrpLH = //lowhighbnd 96k words 384k
		[ 
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc )	 ]
		
		mingrpCm = //centerofmass64k words 256k
		[ new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc )  ]
		
		sc = (maxtks/24)|0
		
		//mid group - each group of num sc, 8 prt indices
		midgrpI = //128k words   256k
		[ new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ] 
		
		midgrpFc = new Uint16Array( sc ) //status fillcount
		
		midgrpLH = //lowhighbnd 96k words 384k
		[ 
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc )	 ]
			
		midgrpCm = //centerofmass64k words 256k
		[ new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc )  ]
			
		sc = (maxtks/144)|0
		
		//min group - each group of num sc, 8 prt indices
		medgrpI = //128k words   256k
		[ new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ] 
			
		medgrpFc = new Uint16Array( sc ) //status fillcount
		
		medgrpLH = //lowhighbnd 96k words 384k
		[ 
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ]
			
		medgrpCm = //centerofmass64k words 256k
		[ new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ]
			
		sc = (maxtks/512)|0
		
		//min group - each group of num sc, 8 prt indices
		maxgrpI = //128k words   256k
		[ new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ,
			new Uint16Array( sc ) ] 
			
		maxgrpFc = new Uint16Array( sc ) //status fillcount
		
		maxgrpLH = //lowhighbnd 96k words 384k
		[ 
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ]
			
		maxgrpCm = //centerofmass64k words 256k
		[ new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ,   
			new Float32Array( sc ) ]
			
		//----------------------------------------		
	}


	function groupRostx(rsbeg,rsfin,roster)
	{   
		function pottogrp(grpI,pot)
		{
			var gpin=mingrpFc[grpI]
			var r=0, ix=0, iy=0, iz=0
			
			if(mingrpFc[grpI]==0) //init.reset group
			{ mingrpCm[grpI][0]=0; mingrpCm[grpI][1]=0
				mingrpCm[grpI][2]=0; mingrpCm[grpI][3]=0
			}
			
			for(var p=0; p<ptfill[pot]; p++)
			{ var t=pttaks[p]
				var ix=t*3, iy=t*3+1, iz=t*3+1		
				
				opos = { x:tkLc[ix], y:tkLc[iy], z:tkLc[iz] } //another syntax may be faster
				hpos = { x:tkLc[ix], y:tkLc[iy], z:tkLc[iz] }
				lpos = { x:tkLc[ix], y:tkLc[iy], z:tkLc[iz] }
				ovel = { x:tkVl[ix], y:tkVl[iy], z:tkVl[iz] }						
				opsv = { x:opos.x+ovel.x, y:opos.y+ovel.y, z:opos.z+ovel.z }
				
				r = tkD[t] //radii to calc bounding box
				if(opos.x<opsv.x) { hpos.x=opsv.x+r ; lpos.x=lpos.x-r }
				else{ lpos.x=opos.x+r ; hpos.x=hpos.x-r }
				if(opos.y<opsv.y) { hpos.y=opsv.y+r ; lpos.y=lpos.y-r }
				else{ lpos.y=opos.y+r ; hpos.y=hpos.y-r }
				if(opos.z<opsv.z) { hpos.z=opsv.z+r ; lpos.z=lpos.z-r }
				else{ lpos.z=opos.z+r ; hpos.z=hpos.z-r }
				
				if(lpos.x>mingrpLH[grpI][0]) { lpos.x=mingrpLH[grpI][0] }
				if(lpos.y>mingrpLH[grpI][1]) { lpos.y=mingrpLH[grpI][1] }
				if(lpos.z>mingrpLH[grpI][2]) { lpos.z=mingrpLH[grpI][2] }
				
				if(hpos.x<mingrpLH[grpI][3]) { hpos.x=mingrpLH[grpI][3] }
				if(hpos.y<mingrpLH[grpI][4]) { hpos.y=mingrpLH[grpI][4] }
				if(hpos.z<mingrpLH[grpI][5]) { hpos.z=mingrpLH[grpI][5] }
				
				potGc.x += tkLc[ix] * tkMa[t]
				potGc.y += tkLc[iy] * tkMa[t]
				potGc.z += tkLc[iz] * tkMa[t]
				potGc.w += tkMa[t]          
				
				tkGp[t]=grpI
				mingrpI[grpI][gpin++] = t
			}//finnish taking tacks 
			
			var gw = mingrpCm[grpI][3]  //group weight
			var tw = potGc.w+gw         //total weight
			
			//save grp data 
			mingrpFc[grpI] = gpin
			
			mingrpCm[grpI][0] = (potGc.x*potGc.w + mingrpCm[grpI][0]*gw) /tw 
			mingrpCm[grpI][1] = (potGc.y*potGc.w + mingrpCm[grpI][1]*gw) /tw 
			mingrpCm[grpI][2] = (potGc.z*potGc.w + mingrpCm[grpI][2]*gw) /tw 
			mingrpCm[grpI][3] = tw
			
			mingrpLH[grpI][0] = lpos.x ; mingrpLH[grpI][3] = hpos.x 
			mingrpLH[grpI][1] = lpos.x ; mingrpLH[grpI][4] = hpos.x
			mingrpLH[grpI][2] = lpos.x ; mingrpLH[grpI][5] = hpos.x
			
		}
		
		function poptopot(Pt,Tk)
		{
			if(ptfill[Pt]==4)
			{ Pt=++freepot; 
				if(freepot>16){ laspot=16; } ///clamp dangerous
			}
			pttaks[Pt]=Tk; //pot index preGi[0..7]
			ptfill[Pt]++;  //pot numbers preGn[0..7]
			var q=ptfill[Pt],p=ptfill[Pt]-1 
			Tk=Tk*3
			ptcntr[Pt][0]=(ptcntr[Pt][0]*p+tkLc[Tk]  )/q
			ptcntr[Pt][1]=(ptcntr[Pt][1]*p+tkLc[Tk+1])/q
			ptcntr[Pt][2]=(ptcntr[Pt][2]*p+tkLc[Tk+2])/q
			ptcntr[Pt][3]=(ptcntr[Pt][3]*p+tkVl[Tk]  )/q
			ptcntr[Pt][4]=(ptcntr[Pt][4]*p+tkVl[Tk+1])/q
			ptcntr[Pt][5]=(ptcntr[Pt][5]*p+tkVl[Tk+2])/q
		}
		
		function cal3dist(Tk,px,py,pz,vx,vy,vz)
		{ 
			dist3=
			Math.abs(tkLc[Tk]-px) + Math.abs(tkLc[Tk+1]-py) + Math.abs(tkLc[Tk+2]-pz)
			+(Math.abs(tkLc[Tk  ]+tkVl[Tk]/2 - px+vx/2)  
				+ Math.abs(tkLc[Tk+1]+tkVl[Tk+1]/2 - py+vy/2)
				+ Math.abs(tkLc[Tk+2]+tkVl[Tk+2]/2 - pz+vz/2))*2;
			
			if(d3prev/dist3>1.1)
			{ d3ups+=dist3 ; d3upnum++ //gotten bigger 
			}else{
				d3dns+=dist3 ; d3dnnum++ //gotten smaller
			}
			d3prev=dist3
			return
			
			//purpose of measurement is to favour certain relationships
			//between tacks. nearness/farness, approachingness/departingnesss
			//high speed usually means disconnect unless there is aggreeance
		}
		
		function cal3distpot(pta,ptb)
		{ 
			dist3=
			Math.abs(ptcntr[pta][0]-ptcntr[ptb][0]) 
			+ Math.abs(ptcntr[pta][1]-ptcntr[ptb][1])
			+ Math.abs(ptcntr[pta][2]-ptcntr[ptb][2])
			+(Math.abs(ptcntr[pta][3]-ptcntr[ptb][3])
				+ Math.abs(ptcntr[pta][4]-ptcntr[ptb][4])
				+ Math.abs(ptcntr[pta][5]-ptcntr[ptb][5]))*2
			
			if(d3prev/dist3>1.1)       //no longer useful for pot matching?
			{ d3ups+=dist3 ; d3upnum++ //gotten bigger 
			}else{
				d3dns+=dist3 ; d3dnnum++ //gotten smaller
			}
			d3prev=dist3
			return
			
			//purpose of measurement is to favour certain relationships
			//between tacks. nearness/farness, approachingness/departingnesss
			//high speed usually means disconnect unless there is aggreeance
		}
		
		var rsbeg= rostix[rnum]
		var rsnxt= rsbeg
		var rsfin= rostix[rnum+1]
		var rslen= rsbeg -rsfin //roster index convention
		//densityv[0]=population/divpvect[0]
		
		var d3prev=0
		
		//initialise first tacks to pots, observe distance calcs
		//but kick off d3ups,d3dwns,dist3,d3pre with 
		//estimates from basic density of cuboid
		//ensure roster order is shuffled with suffle sequence
		//the 3dist cals effectively pulsevel the bounds of the fit
		//the low 3dist cal will still be much bigger than group accept
		//group accept is ~ 3distcal / pop
		//the greater the pop, the smaller the grouping value
		
		var sepb=(bndx+bndy+bndz)
		var lod3=0xffffffff,dntarg,d3dnsum=sepb,d3upsum=sepb,d3upnum=2,d3dnnum=2
		var pots=pttaks.length,freepot=0
		var potTarg=(1+rslen/5)|0
		
		while(rsnxt<potTarg)
		{ 
			var i=roster[ (rsnxt+rslen-1)%rslen ]*3
			
			cal3dist( roster[rsnxt]*3,
				tkLc[i], tkLc[i+1], tkLc[i+2], 
				tkVl[i], tkVl[i+1], tkVl[i+2] )
			
			poptopot(freepot++,roster[rsnxt++]) 
		}
		
		//fill likepots to max depth of 4
		while (rsnxt<rsfin) 
		{ lod3=0xffffffff
			for(var wp =0; wp<freepot; wp++)
			{ if(ptfill[wp]<plen)
				{
					cal3dist(roster[rsnxt]*3,
						ptcntr[wp][0],ptcntr[wp][1],ptcntr[wp][2], 
						ptcntr[wp][3],ptcntr[wp][4],ptcntr[wp][5] )
					
					if( dist3 < lod3 )
					{ lod3=dist3; gopo=wp; }
					
					//d3sum is not required when tracking up and down
					//d3sum, d3num, d3ups, d3dns d3upnum, d3dnnumd
					// (d3ups/d3upnum) / (d3dns/d3dnnum) -- compare to d3sum 
					//the separation measurement of larger pairs and smaller pairs
					//informs of uniformity of spread of points,
					//it settles on a value which is a natural factor 
					//separated by actual diversity of locations
					//that factor should be calibrated by
					//testing on types of uniform spread tacks
					//if self setting, the meaning becomes more,
					//complex and obscure open to new flaws
					//the diff between up and down, informs
					//chancieness of measurement
					//when smaller, measurement is safer,
					//so increase acceptance...
				}
			}
			
			//upsm = upsm + dwsm * (un-dn)/(un+dn)
			var dntarg = (d3dnsum + d3upsum *(d3upnum-d3dnnum)/(d3upnum+d3dnnum))/d3dnnum
			//var uptarg = (d3upsum + d3dnsum *(d3upnum-d3dnnum)/(d3upnum+d3dnnum))/d3upnum
			
			if( lod3 > dntarg*fac2/rslen )
			{ if((++freepot)==pots) freepot-- 
					poptopot(freepot,roster[rsnxt++]); }
			else
			{ d3dnsum-=lod3; d3dnnum-- 
				poptopot(gopo,roster[rsnxt++]); 
			}
			
		}//all tacks in pots
		
		var pota=0
		while (pota<freepot)
		{
			pottogrp(wkgrp,pota)
			
			for(var potb=pota+1;potb<pots;potb++)
			{ if(ptfill[potb]+mingrpFc[wkgrp]<grplen)
				{ cal3distpot(pota,potb)
					
					if(dist3< (fc*(d3upsum+d3dnsum *(d3upnum-d3dnnum)/(d3upnum+d3dnnum))/d3upnum)/rslen )
					{ pottogrp(wkgrp,potb)
						if(mingrpFc[wkgrp]>=grplen){ wkgrp++; break }			
					}
				}
			}
		}
	}

	//for variable size particle sets

	//on particle add, recreate all arrays of characteristic?
	//or maintain totaltacks number, and process to this instead of
	//array length, sync tkLc to thrLc and tkCl to thrCl

  function getstate(){ 
	  return { tkLc:tkLc,tkVl:tkVl,tkCl:tkCl,tkQa:tkQa,tkClb:tkClb } 
  }
  
	return{
		
		 getstate      : getstate
		,defoTacks     : defoTacks
		,tksToThree    : tksToThree

		,chopWorld     : chopWorld
		,setGroupWorks : setGroupWorks
  
	}

}(arguments))} //newcore

/*

 (){
 ()
 
  surcell_lw3(Isec,dvs,dvm,low) //checked
  locToSector(x,y,z,lw,dvm,dvs)
  chopWorld()
  surveysub( blv, bci, bpop ) //b-level b-sector b-tacksnum
  topcell()
  surveycell( blv, bci, cells ) //lvl uprost index , cells of divs
  calcBestGrid(sz3,mxdiv)
  sorti012(m) 
  delt3(a,b)
  smult3(a,b)
  sadd3(a,b)
  delt3r(a,b,r)
  smult3r(a,b,r)
  sadd3r(a,b,r)
 
 
 
  tksToThree()
  defoTacks(loca,colr)
 
  setGroupWorks()
  doGroupz(rst,rov) //stub to test chopworld
  doGroupx(rst,rov) //stub to test chopworld
  doGroupf(rst,rov) //stub to test chopworld
  endcell(rst,rov) //stub to test chopworld
  signt(n){ return n<0 ? -1:1 }
  groupRostx(rsbeg,rsfin,roster)
  pottogrp(grpI,pot)
  poptopot(Pt,Tk)
  cal3dist(Tk,px,py,pz,vx,vy,vz)
  cal3distpot(pta,ptb)
 (){ 
*/