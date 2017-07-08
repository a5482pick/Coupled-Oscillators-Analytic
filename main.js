//This script listens for changes initiated by the user e.g. data submissions or resizing of the window.

"use strict";


//Namespace 'Space'.
var Space = (function()  { 

    //setPixelData(..) initialises the values of the pixel object.  (Called from Space.drawScreen(..).)
    //imgData is an instance of ImageData.
    function setPixelData(imgData)  {


        for (var i = 0; i < imgData.data.length; i += 4) {
    
            imgData.data[i+0] = 255;
            imgData.data[i+1] = 0;
            imgData.data[i+2] = 0;
            imgData.data[i+3] = 255;
        }

        return imgData;
    }


    //All the following functions are public.
    return  {


//-------------

    
    //This function is called when either the window loads or when location.reload() is applied as a result of resizing.
    begin : function () {
     

        //We listen for'start' being clicked.  When it is, 'running' is set to 1 and animation begins.
    	document.getElementById("start").addEventListener("click", Space.canvasApp, false);

        //When 'reset' is pressed, set 'running' to 0.
    	document.getElementById("stop").addEventListener("click", Space.reset,false);
   

    	//This block is used when 'begin()' is called as a response to a 'resize' event, and when the animation is 'running'.
    	//Local storage has remembered the previous parameters, and we automatically commence animation with these values.
    	if (sessionStorage.getItem("resized") ==="1" && sessionStorage.getItem("running") === "1") {
    
            document.getElementById("k1").value = sessionStorage.getItem("k1");
            document.getElementById("k2").value = sessionStorage.getItem("k2");
            document.getElementById("k3").value = sessionStorage.getItem("k3");
            document.getElementById("m1").value = sessionStorage.getItem("m1");
            document.getElementById("m2").value = sessionStorage.getItem("m2");
        
            //Start the animation automatically...
            Space.canvasApp();
        }

        //When resized but 'running' is not "1" don't do anything.
    },

//-------------

    //Called when the window is resized.  SessionStorage 'remembers' that a resizing event, not a new session, has occurred.
    resized : function() { 
   
        sessionStorage.setItem("resized","1");

        //Set the values so that the animation is able to restart automatically.
        sessionStorage.setItem("k1", document.getElementById("k1").value);
    	sessionStorage.setItem("k2", document.getElementById("k2").value);
    	sessionStorage.setItem("k3", document.getElementById("k3").value);
    	sessionStorage.setItem("m1", document.getElementById("m1").value);
    	sessionStorage.setItem("m2", document.getElementById("m2").value);
  
    	//(Firefox needs this to ensure automatic resizing when reloading.)
    	window.location.href = window.location.href;

    	location.reload();
    },


//-------------


    //We stop and clear the animation when the reset button is pressed.
    reset : function() {
   
        location.reload();
   
        //Set the last known state to 'not running'. 
        sessionStorage.setItem("running","0");
    },


//-------------


//Space.canvasApp() is called when a request to make the animation run has been made.
//It doesn't receive or return any values, it simply prepares the canvas and calculates (with the 
//help of Space.eigenstate(..)) the initial (t = 0) physical conditions.  Note that the initial conditions completely determine the 
//system's evolution.
//From within this script we call checkSubmit(), then eigenstate(..), and then drawScreen(..).
    canvasApp : function()  {
   
        var ratioWidth, ratioHeight, omega1, omega2, eigen1, eigen2, initialDisp, t, a, radiusM1, radiusM2, m1, m2;
        var context, theCanvas, theProperties = {}, eigen = {};
        
        //When canvasApp() is called, the user has asked the animation to run.  Record this 'running' state in sessionStorage.
        sessionStorage.setItem("running","1");
   
   
        //Set up the dimensions of the canvas that will hold the animation.
        ratioWidth = 0.79;
        ratioHeight = 0.075;
        theCanvas = document.getElementById("canvasOne");
        context = theCanvas.getContext("2d");
        theCanvas.width = window.innerWidth*ratioWidth;
        theCanvas.height = window.innerHeight*ratioHeight;
   
   
        //Read the user-submitted values, check their validity, then respond appropriately.
    	//The returned object is {k1:k1, k2:k2, k3:k3, m1:m1, m2:m2}.
    	theProperties = Space.checkSubmit();
    
    	//Calculate then store the eigenfrequencies and 'eigenvectors' as the object:
    	//{omega1:omega1, omega2:omega2, eigen1:eigen1, eigen2:eigen2} where:
    	//omega1 = frequency mass1, eigen1 = vector mass1, omega2 = frequency mass2, eigen2 = vector mass2.
    	eigen = Space.eigenstate(theProperties);
      
   	//Set up the initial displacement.  'a' is the (displacement) amplitude passed to drawScreen(..).
    	initialDisp = 1.0;
    	t = 0;      
    	a = initialDisp / (eigen.eigen1 - eigen.eigen2);    
    
    
    	//Allow the difference in masses to be represented on screen by a corresponding difference in sizes.   
    	radiusM1 = 20*Math.pow(theProperties.m1,1/3);
    	radiusM2 = 20*Math.pow(theProperties.m2,1/3);
  
   
    	//Call drawScreen(..) to animate.
    	function run() {
      
            //Set the rate of redrawing.
            window.setTimeout(run,20);

            //See drawScreen.js
            Space.drawScreen(context, theCanvas.width, theCanvas.height, eigen, t, a, radiusM1, radiusM2);
        
            //Set the incremented time for each successive redraw.
            t=t+0.03;
        }  
   
        //The entry point for the looping.
        run ();
    },


//-------------


//This script retrieves the user's submitted values, then checks validity.  If the values are accepted, they're returned to canvasApp(..).

    checkSubmit : function()    {


        var k1match, k2match, k3match, m1match, m2match, k1, k2, k3, m1, m2;

    	//A draw request can be from either a user submission or a resizing.  Here we consider new user submitted values.  
    	if (sessionStorage.getItem("resized") !== "1") {
   
            //Test to see if a submitted value contains a non-numeric character after 1 or more numbers.
            k1match = document.getElementById("k1").value.match(/^[0-9]+[^0-9\.]+/);
            k2match = document.getElementById("k2").value.match(/^[0-9]+[^0-9\.]+/);
            k3match = document.getElementById("k3").value.match(/^[0-9]+[^0-9\.]+/);
            m1match = document.getElementById("m1").value.match(/^[0-9]+[^0-9\.]+/);
            m2match = document.getElementById("m2").value.match(/^[0-9]+[^0-9\.]+/);
      
      
            //Strip away unwanted characters from the submitted input.
            k1 = parseFloat(document.getElementById("k1").value);
            k2 = parseFloat(document.getElementById("k2").value);
            k3 = parseFloat(document.getElementById("k3").value);
            m1 = parseFloat(document.getElementById("m1").value);
            m2 = parseFloat(document.getElementById("m2").value);
      
      
            //The size of the animation on the screen means these input constraints are needed.
            if ((k1 > 100 || k1 < 1) || (k2 > 100  || k2 < 1) || (k3 > 100 || k3 < 1) || (m1 > 100 || m1 < 1) || (m2 > 100 || m2 < 1)  || (!k1 || !k2 || !k3 || !m1 || !m2))  {
        
                alert("All parameters must be numbers between 1 and 100.");
                reset(); 
            }
      
      
            //If any of the matches were true, proceed, but with a warning.
            if (k1match || k2match || k3match || m1match || m2match)   {
         
                alert("Numeric values are assumed to be the numbers preceding the first non-numeric character.");
            }   
        }  
   
   
        //If the window has been resized while the animation was running, we reuse the previously entered values
        //that we stored in local storage.
        if (sessionStorage.getItem("resized") == "1") {
   
            sessionStorage.setItem("resized","0");
            k1 = parseFloat(sessionStorage.getItem("k1"));
            k2 = parseFloat(sessionStorage.getItem("k2"));
            k3 = parseFloat(sessionStorage.getItem("k3"));
            m1 = parseFloat(sessionStorage.getItem("m1"));
            m2 = parseFloat(sessionStorage.getItem("m2"));
        }

        return {k1:k1, k2:k2, k3:k3, m1:m1, m2:m2};
    },


//-------------


//Calculate the eigenfrequencies and eigenvectors associated with this two-mass ,three-spring system.
//The 2nd component of the eigenvector is always 1, so only the first eigenvector component of each mass needs to be calculated and returned. 

//The function expects the 3 spring constants and 2 masses as parameter 'theProperties': {k1:k1, k2:k2, k3:k3, m1:m1, m2:m2}.
    eigenstate : function (theProperties)  {


        var lamdaBlock1, lamdaBlock2, lamdaBlock3, lamdaSQRT, lamda1, lamda2, omega1, omega2;
        var vectorBlock1, vectorBlock2, vectorBlock3, eigen1, eigen2, k1, k2, k3, m1, m2;
    

        //Extract individual values from the passed object for clarity.
        k1 = theProperties.k1;
    	k2 = theProperties.k2;
        k3 = theProperties.k3;
        m1 = theProperties.m1;
        m2 = theProperties.m2;
    
        //Calculate the eigenvalues.          
        lamdaBlock1 = k1*m2 + k2*m1 + k2*m2 + k3*m1;
        lamdaBlock2 = k1*k2*m1*m2 + k1*k3*m1*m2 + k2*k3*m1*m2;
        lamdaBlock3 = k1*m2 + k2*m1 + k2*m2 + k3*m1;
      
        lamdaSQRT = Math.sqrt(Math.pow(lamdaBlock1,2) - 4*lamdaBlock2);
      
        lamda1 = ((-lamdaSQRT) - lamdaBlock3) / (2*m1*m2);
        lamda2 = (lamdaSQRT - lamdaBlock3) / (2*m1*m2); 
      
        //The two eigenvalues:
        omega1 = Math.sqrt(-lamda1);
        omega2 = Math.sqrt(-lamda2);
   
   
        //Calculate the eigenvectors.  The 2nd vector component is 1.   
        vectorBlock1 = Math.pow(k2*m1 + k3*m1 + k1*m2 + k2*m2,2);
        vectorBlock2 = k1*k2*m1*m2 + k1*k3*m1*m2 + k2*k3*m1*m2;
        vectorBlock3 = k2*m1 + k3*m1 + k1*m2 + k2*m2;
     
        eigen1 = 0.5*(vectorBlock3 + Math.sqrt(vectorBlock1 - 4*vectorBlock2));
        eigen1 = -m1*(k2 + k3) + eigen1;
        eigen1 = (-1/(k2*m1))*eigen1;
      
        eigen2 = 0.5*(vectorBlock3 - Math.sqrt(vectorBlock1 - 4*vectorBlock2));
        eigen2 = -m1*(k2 + k3) + eigen2;
        eigen2 = (-1/(k2*m1))*eigen2;

        //Return eigenfrequencies and eigenvectors:  omega1 = frequency mass1, eigen1 = vector mass1, omega2 = frequency mass2, eigen2 = vector mass2.  
        return {omega1:omega1, omega2:omega2, eigen1:eigen1, eigen2:eigen2};
    },

      
//-------------


//Draw the position of the masses at a particular moment in time.

//In order, the parameters expected are: (1) The canvas's context (2) The canvas's width (3) The canvas's height
//(4) An 'eigen object' of the form returned by eigenstate.js (5) The current time (6) An initial amplitude (7) The radius
//of the left mass (8) The radius of the right mass. 
//The output is to the screen and nothing is returned.
                   
    drawScreen : function (context, width, height, eigen, t, a, radiusM1, radiusM2)  {
        

        var omega1, omega2, eigen1, eigen2, x1, x2, x1Draw, x2Draw, dist, yCoord, param, xPos, yPos, imgData;


        //Extract the values from the array for clarity.
    	omega1 = eigen.omega1;
    	omega2 = eigen.omega2;
   	eigen1 = eigen.eigen1;
   	eigen2 = eigen.eigen2;

        //The canvas that holds the image of the oscillation.
        context.fillStyle ='#EEEEEE';
        context.fillRect(0,0,width,height);
        context.strokeStyle = '#000000';
        context.strokeRect(1,1,width-2,height-2);
        
           
        //x1 and x2 are the displacments of the masses on the left and right respectively, after a time t.
        x1 = a*eigen1*Math.cos(omega1*t) - a*eigen2*Math.cos(omega2*t); 
        x2 = a*Math.cos(omega1*t) - a*Math.cos(omega2*t);
      
      
        //The displaced position, adjusted to allow for variable screen size.
        //0.25*width and 0.75*width represent the two balls' canvas positions at zero displacement.
        x1Draw = x1*0.13636*width + 0.25*width;
        x2Draw = x2*0.13636*width + 0.75*width;
      
     
 
        //Parameter for the sine wave that generates the spring corresponding to k1. 
        param = (2*Math.PI*20)/x1Draw; 

        //Draw the pixels for the spring corresponding to k1.
        dist = 0;    

        while (dist < x1Draw)  {
       
            //(k1) spring's 'y' canvas coordinate.  
            yCoord = (height/2)+0.1*height*Math.sin(param * dist);  

            //Instantiate an ImageData object of one pixel.
            imgData = context.createImageData(1, 1);       
         
            //Set the pixel's values.  (Such calls are OK because JS is single threaded (synchronous)).
            setPixelData(imgData);
             
            xPos = dist;

            yPos = yCoord;
 
            context.putImageData(imgData, xPos, yPos);   

            dist = dist + 1;  
        }
   
  
        //Parameter for the sine wave that generates the spring corresponding to k2.
        param = (2*Math.PI*40)/((x2Draw-radiusM2)-(x1Draw+radiusM1));

        //Draw the pixels for the spring corresponding to k2.
        dist = 0;    

        while (dist < (x2Draw+radiusM2)-(x1Draw+radiusM1))  {
        
            //(k2) spring's 'y' canvas coordinate.      
            yCoord = (height/2)+0.1*height*Math.sin(param * dist);   

            //Instantiate an ImageData object of one pixel.
            imgData = context.createImageData(1, 1);      
        
            setPixelData(imgData);       
 
            xPos = dist+x1Draw + radiusM1;

            yPos = yCoord;
 
            context.putImageData(imgData, xPos, yPos); 

            dist = dist + 1; 
        }    
      
     
        //Parameter for the sine wave that generates the spring corresponding to k3.
        param = (2*Math.PI*20)/(width - (x2Draw+radiusM2)); 

        //Draw the pixels for the spring corresponding to k3.
        dist = 0;
      
        while (dist < width - (x2Draw+radiusM2))  {       

            //(k3) spring's 'y' canvas coordinate.     
            yCoord = (height/2)+0.1*height*Math.sin(param * dist); 

            //Instantiate an ImageData object of one pixel.
            imgData = context.createImageData(1, 1);        
         
            setPixelData(imgData);

            xPos = dist+x2Draw + radiusM2;

            yPos = yCoord;
 
            context.putImageData(imgData, xPos, yPos);

            dist = dist + 1;
        }

    
        //Draw mass 1.
        context.beginPath();
        context.arc(x1Draw,height/2,radiusM1,0,2*Math.PI);
        context.fillStyle="#000000";
        context.fill();
        context.closePath();
    
        context.font = "20px serif";
        context.fillStyle = "#FFFFFF";
        context.fillText("1",x1Draw-6,(height/2)+6);
      
        //Draw mass 2.
        context.beginPath();
        context.arc(x2Draw,height/2,radiusM2,0,2*Math.PI);
        context.fillStyle="#000000";
        context.fill();
        context.closePath();   
    
        context.font = "20px serif";
        context.fillStyle = "#FFFFFF";
        context.fillText("2",x2Draw-6,(height/2)+6);
    }

}  //Close object of public functions.

})();


//-------------


//Listening for both window 'loading' and window 'resizing'.
window.addEventListener("resize",Space.resized,false);
window.addEventListener("load",Space.begin,false);



