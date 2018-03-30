// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

var map = L.map('map').setView([-15.794236, -47.883568,], 11);

// Add base layer
L.tileLayer('https://api.mapbox.com/styles/v1/eduardaaun/cje7b2cg93v4x2so2t3pnsvog/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWR1YXJkYWF1biIsImEiOiJjajI1OWQ4b3kwMDhtMzJsZWdmOHhocWFpIn0.dM0AOmAI9UmpTcD6J8jNKw', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'apikey',
  username: 'eduardaaun'
});

// Initialze source data - case studies 
var casestudiesSource = new carto.source.SQL('SELECT * FROM case_studies_edited');

// Create style for the data
var casestudiesStyle = new carto.style.CartoCSS(`
  #layer {
  marker-width: 7;
  marker-fill: deeppink;
  marker-fill-opacity: 1;
  marker-allow-overlap: true;
  marker-line-width: 1;
  marker-line-color: #ffffff;
  marker-line-opacity: 1;
}
`);

// Add style to the data
var casestudiesLayer = new carto.layer.Layer(casestudiesSource, casestudiesStyle, {
  featureClickColumns: ['cartodb_id', 'atividade','activity','organizado', 'name', '_when', 'local','foto','foto_2', 'foto_3','contact']
});

var popup = L.popup();
casestudiesLayer.on('featureClicked', function (event) {
  // Create the HTML that will go in the popup. event.data has all the data for 
  // the clicked feature.
  //
  // I will add the content line-by-line here to make it a little easier to read.
  var content = '<h1>' + event.data['name'] + '</h1>'
    content += '<div>' + event.data['activity'] + ' </div>';
  content += '<div>Who: ' + event.data['organizado'] + ' </div>';
   content += '<div>Where: ' + event.data['local'] + ' </div>';
  content += '<div>When: ' + event.data['_when'] + ' </div>';
  popup.setContent(content);
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});


/*
 * Begin layer two - spaces
 */

// Initialze source data
var spacesSource = new carto.source.SQL('SELECT * FROM espacos');

// Create style for the data
var spacesStyle = new carto.style.CartoCSS(`
#layer {
  polygon-fill: deeppink;
  polygon-opacity: 1;
  }
`);

// Add style to the data
var spacesLayer = new carto.layer.Layer(spacesSource, spacesStyle);

/*
 * Begin layer four - income 
 */

// Initialze source data
var incomeSource = new carto.source.SQL('SELECT * FROM renda_raca_brasilia_1');

// Create style for the data
var incomeStyle = new carto.style.CartoCSS(`
 #layer {
  polygon-fill: ramp([rend_rnm], (#b25400, #e46c00, #ff7800, #ff8b24, #ffa554), quantiles);
  polygon-opacity: 0.8;
}
#layer::outline {
  line-width: 1;
  line-opacity: 0;
}
`);
// Add style to the data
var incomeLayer = new carto.layer.Layer(incomeSource, incomeStyle);

/*
 * Begin layer five - bus stops
 */

// Initialze source data
var busstopSource = new carto.source.Dataset('pontos_parada');

// Create style for the data
var busstopStyle = new carto.style.CartoCSS(`
 #layer {
  marker-width: 10;
  marker-fill: #16fc73;
  marker-fill-opacity: 0;
  marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/bus-18.svg');
  marker-allow-overlap: true;
  marker-line-width: 1;
  marker-line-opacity: 0;
 [zoom >= 13] {
    marker-fill-opacity: 1;
    marker-line-opacity: 1;
}
}
`);
// Add style to the data
var busstopLayer = new carto.layer.Layer(busstopSource, busstopStyle);

/*
 * Begin layer six - bike share
 */

// Initialze source data
var bikeSource = new carto.source.Dataset('bikeshare_bsb');

// Create style for the data
var bikeStyle = new carto.style.CartoCSS(`
  #layer {
  marker-width: 10;
  marker-fill: #16fc73;
  marker-fill-opacity: 0;
  marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/bicycle-18.svg');
  marker-allow-overlap: true;
  marker-line-width: 1;
  marker-line-opacity: 0;
 [zoom >= 13] {
    marker-fill-opacity: 1;
    marker-line-opacity: 1;
}
}
`);
// Add style to the data
var bikeLayer = new carto.layer.Layer(bikeSource, bikeStyle);

/*
 * Begin layer seven - subway line
 */

// Initialze source data
var subwaylineSource = new carto.source.Dataset('metroline');

// Create style for the data
var subwaylineStyle = new carto.style.CartoCSS(`
  #layer {
  line-width: 2;
  line-color: #16fc73;
  line-opacity: 0;
  line-style: dashed;
 [zoom >= 13] {
    marker-fill-opacity: 1;
    marker-line-opacity: 1;
}
}
`);
// Add style to the data
var subwaylineLayer = new carto.layer.Layer(subwaylineSource, subwaylineStyle);



// Add the data to the map as two layers. Order matters here--first one goes on the bottom
client.addLayers([incomeLayer, busstopLayer, bikeLayer, spacesLayer, casestudiesLayer]);
client.getLeafletLayer().addTo(map);


/*
 * Listen for changes on the layer picker - people picker 
 */

// Step 1: Find the dropdown by class. If you are using a different class, change this.
var peoplePicker = document.querySelector('.people-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
peoplePicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var people = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (people === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    casestudiesSource.setQuery("SELECT * FROM case_studies_edited");
  }
  else {
    // Else the value must be set to a life stage. Use it in an SQL query that will filter to that life stage.
    casestudiesSource.setQuery("SELECT * FROM case_studies_edited WHERE people = '" + people + "'");
    // console.log("no")

    // occupationsSource.setQuery("SELECT * FROM case_studies_edited WHERE activity = " + activity + "'");
  }
  
  // Sometimes it helps to log messages, here we log the lifestage. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + people+ '"');
});


/*
 * Listen for changes on the layer picker - action picker 
 */

// Step 1: Find the dropdown by class. If you are using a different class, change this.
var actionPicker = document.querySelector('.action-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
actionPicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var activity = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (activity === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    casestudiesSource.setQuery("SELECT * FROM case_studies_edited");
  }
  else {
    // Else the value must be set to a life stage. Use it in an SQL query that will filter to that life stage.
    casestudiesSource.setQuery("SELECT * FROM case_studies_edited WHERE activity = '" + activity + "'");
    // console.log("no")

    // occupationsSource.setQuery("SELECT * FROM case_studies_edited WHERE activity = " + activity + "'");
  }
  
  // Sometimes it helps to log messages, here we log the lifestage. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + activity + '"');
});

/*
 * Listen for changes on the layer picker - space picker 
 */

// Step 1: Find the dropdown by class. If you are using a different class, change this.
var spacePicker = document.querySelector('.space-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
spacePicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var tipo = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (tipo === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    spacesSource.setQuery("SELECT * FROM espacos");
  }
  else {
    // Else the value must be set to a life stage. Use it in an SQL query that will filter to that life stage.
    spacesSource.setQuery("SELECT * FROM espacos WHERE tipo = '" + tipo + "'");
    // console.log("no")

    // occupationsSource.setQuery("SELECT * FROM case_studies_edited WHERE activity = " + activity + "'");
  }
  
  // Sometimes it helps to log messages, here we log the lifestage. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + tipo + '"');
});

/*
 * Listen for changes on the layer picker - income button 
 */

// Step 1: Find the button by its class. If you are using a different class, change this.
var incomeButton = document.querySelector('.income-button');

// Step 2: Add an event listener to the button. We will run some code whenever the button is clicked.
incomeButton.addEventListener('click', function (e) {
  source.setQuery("SELECT * FROM renda_raca_brasilia_1 WHERE = 'Juvenile'");
  
  // Sometimes it helps to log messages, here we log to let us know the button was clicked. You can see this if you open developer tools and look at the console.
  console.log('Juvenile was clicked');
});