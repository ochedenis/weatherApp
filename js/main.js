'use strict';

 document.getElementById('input').addEventListener('keyup',
   function( event ) {
       if (event.keyCode == 13) { // key code of "enter"
           generateRequest();
       }
 });

function generateRequest() {
  let path = "http://api.openweathermap.org/data/2.5/forecast?q=";
  let appKey = "&APPID=72c979476d0f1aaa523178d8859506b1";
  let city = document.getElementById("input").value;

  if( city.length == 0 ) {
    alert( "Please enter a city name!" );
  } else {
    city = city.charAt(0).toUpperCase() + city.toLowerCase().slice(1);

    handleRequest( path + city + appKey );
  }
}

function handleRequest( request ) {
  let XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
  let xhr = new XHR();

  xhr.open('GET', request, true);

  xhr.onload = function() {
    let dataObj = JSON.parse( this.responseText );

    if( dataObj.cod == 200 ) {
      writeToDoc( sortData( dataObj.list ));
    } else {
      alert( 'Error: ' + dataObj.message );
    }
  }

  xhr.onerror = function() {
    alert( 'Error: ' + this.status );
  }

  xhr.send();
}

function sortData( dataArr ) {
 let date;
 let prevDay = -1;
 let neededData = [];
 let daysCounter = 0;

 for( let obj of dataArr ) {
   date = new Date(obj.dt * 1000); // multiply by 1000 to get the number of milliseconds for correct work of time indicators

   if( prevDay == -1 ) {
     getNeededData( obj, neededData );
     prevDay = date.getDay();
     daysCounter++;
   } else {
     if( date.getDay() != prevDay && date.getHours() == 14 ) { // to represent the forecast for the next days, the average daytime was selected( 14:00 )
       getNeededData( obj, neededData );
       prevDay = date.getDay();
       daysCounter++;
     }
   }

   if (daysCounter == 5) break;
 }

 return neededData;
}

function getNeededData( obj, arr ) {
 let data = {};

 data.day = ( new Date(obj.dt * 1000) ).getDay();
 data.iconId = obj.weather[0].icon;
 data.descrip = obj.weather[0].description;
 data.temp = obj.main.temp;

 arr.push( data );
}

function writeToDoc( dataArr ) {
 let daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
 let index = 0;
 let weatherBlocks = document.querySelectorAll('.weather__frame');

 for (let block of weatherBlocks) {
   block.getElementsByClassName("day")[0].innerHTML =
     daysOfWeek[ dataArr[index].day ];

   let str = dataArr[index].descrip
   block.getElementsByClassName("description")[0].innerHTML =
     str.charAt(0).toUpperCase() + str.slice(1);

   let url = "http://openweathermap.org/img/w/";
   block.getElementsByClassName("icon")[0]
     .setAttribute("src", url + dataArr[index].iconId + ".png");

   block.getElementsByClassName("temp")[0].innerHTML =
     Math.round(dataArr[index].temp - 273.15) + String.fromCharCode(176);
     // temp - 273.15 => convert Kelvin into Celsius
    // 176 - char code of the degree symbol

   index++;
 }

 document.querySelector('.forecast__frame').style.display = "flex";
}
