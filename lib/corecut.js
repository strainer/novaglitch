// Tock/corecut.js - 3D Physics Engine
/** @author Andrew Strain */



	function doGroupz(rst,rov) //stub to test chopworld
	{ var tk,tka,r,g,b
		r=((2+rst)%7)/6 
		g=((1+rst)%6)/5 
		b=((2+rst)%5)/4
		
		for(var ri=rst; ri<rov; ri++)  //for through stretch to make note of members sectors
		{ tk=Rst[ri]; tka=tk*3;
			tkCl[tka]=r; tkCl[tka+1]=g; tkCl[tka+2]=b;
			//tkLc[tka]=r; tkLc[tka+1]=g; tkLc[tka+2]=b;
		}	
		return
	}



	function doGroupx(rst,rov) //stub to test chopworld
	{ avgLc[0]=0.0;avgLc[1]=0.0;avgLc[2]=0.0;
		gsz=rov-rst
		
		for(var ri=rst; ri<rov; ri++)  //for through stretch to make note of members sectors
		{ tk=Rst[ri]; tka=tk*3;
			avgLc[0]+=tkLc[tka++];avgLc[1]+=tkLc[tka++];avgLc[2]+=tkLc[tka]  
		}
		avgLc[0]/=gsz; avgLc[1]/=gsz; avgLc[2]/=gsz
		var ff=1/100000
		for(var ri=rst; ri<rov; ri++)  //for through stretch to make note of members sectors
		{ tk=Rst[ri]; tka=tk*3;
			dfLc=tkLc[tka]-avgLc[0]
			if(dfLc>0){ tkVl[tka]+=Math.sqrt(dfLc)*ff }
			else    { tkVl[tka]-=Math.sqrt(-dfLc)*ff }
			dfLc=tkLc[++tka]-avgLc[1]
			if(dfLc>0){ tkVl[tka]+=Math.sqrt(dfLc)*ff }
			else    { tkVl[tka]-=Math.sqrt(-dfLc)*ff }
			dfLc=tkLc[++tka]-avgLc[2]
			if(dfLc>0){ tkVl[tka]+=Math.sqrt(dfLc)*ff }
			else    { tkVl[tka]-=Math.sqrt(-dfLc)*ff }
		}	
	}
	
	
	///---------------------------------------------
	avgLc[0]/=gsz; avgLc[1]/=gsz; avgLc[2]/=gsz
	
	for(var ri=rst; ri<rov; ri++)  //
	{ tka=Rst[ri]*3;
		dfLc=(tkLc[tka]-avgLc[0])*(tkLc[tka]-avgLc[0]); tka++
		dfLc+=(tkLc[tka]-avgLc[1])*(tkLc[tka]-avgLc[1]); tka++
		dfLc+=(tkLc[tka]-avgLc[2])*(tkLc[tka]-avgLc[2]);
		dfLc=Math.sqrt(dfLc)+0.01; 
		tka-=2;
		var dfLc3=dflc
		// tkVl[tka]=(tkVl[tka]*799 + avgVl[0] )/800 ;tka++
		// tkVl[tka]=(tkVl[tka]*799 + avgVl[1] )/800 ;tka++
		// tkVl[tka]=(tkVl[tka]*799 + avgVl[2] )/800
		tkVl[tka]=(tkVl[tka]*dfLc + avgVl[0] )/(dfLc+1) ;tka++
		tkVl[tka]=(tkVl[tka]*dfLc + avgVl[1] )/(dfLc+1) ;tka++
		tkVl[tka]=(tkVl[tka]*dfLc + avgVl[2] )/(dfLc+1)
	}	
	
	var dd=0.02
	
	function signt(n){ return n<0 ? -1:1 }
	
	var p
	var rr=rov-rst
	
	for(var ri=rst; ri<rov; ri++)  //
	{ tka=Rst[ri]*3;
		tkb=Rst[rst+((ri-rst+1)%rr)]*3;
				
		p=(tkLc[tka]-tkLc[tkb++]) 
		p+=signt(p)  
		tkLc[tka++]+=dd/p;
		
		p=(tkLc[tka]-tkLc[tkb++]) 
		p+=signt(p)  
		tkLc[tka++]+=dd/p;
		
		p=(tkLc[tka]-tkLc[tkb]) 
		p+=signt(p)  
		tkLc[tka++]+=dd/p;
		
		tka-=3;
		var dfLc3=dflc
		tkVl[tka]=(tkVl[tka]*799 + avgVl[0] )/800 ;tka++
		tkVl[tka]=(tkVl[tka]*799 + avgVl[1] )/800 ;tka++
		tkVl[tka]=(tkVl[tka]*799 + avgVl[2] )/800
		//tkVl[tka]=(tkVl[tka]*dfLc + avgVl[0] )/(dfLc+1) ;tka++
		//tkVl[tka]=(tkVl[tka]*dfLc + avgVl[1] )/(dfLc+1) ;tka++
		//~ //tkVl[tka]=(tkVl[tka]*dfLc + avgVl[2] )/(dfLc+1)
	}
	
}

	///