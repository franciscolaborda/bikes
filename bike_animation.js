var width = 900,
    height = 760;

var formatNumber = d3.format(",.0f");

var chosenProjection = d3.geo.mercator()
  .scale(195000)
  .center([-58.43000,-34.58600]);

var path = d3.geo.path()
    .projection(chosenProjection)
    .pointRadius(1.5);;

var radius = d3.scale.sqrt()
    .domain([0, 1e6])
    .range([0, 15]);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);



d3.json("caba.json", function(error, us) {
  if (error) throw error;

d3.csv("semana.csv", function(error, datos) {
  
  if (error) throw error;    

var weekDay = svg.append("text")
        .attr("class", "year_label")
        .attr("text-anchor", "end")
        .style('fill', '#2779a2')
        .style('font-family','Changa One')
        .style('font-size','32')
        .style('opacity','0.6')        
        .attr("y", 645)
        .attr("x", 770)
        .text("Dia: "+0);

var label = svg.append("text")
            .attr("class", "year_label")
            .attr("text-anchor", "end")
            .style('fill', '#000')
            .style('font-family','Changa One')
            .style('opacity','0.3')            
            .attr("y", 705)
            .attr("x", 780)
            .text("Hora: "+0);

var available_bikes_label = svg.append("text")
                .attr("class", "available_label")
                .attr("text-anchor", "end")
                .style('fill', '#08519c')
                .style('display', 'block')
                .style('font-family','Changa One')
                .style('opacity','0.5')                
                .attr("y", 740)
                .attr("x", 780)
                .text("Promedio bicis disponibles: "+0);

svg.append("path")
    .datum(topojson.feature(us, us.objects.limites))
    .attr("class", "land")
    .attr("d", path);

svg.append("path")
    .datum(topojson.mesh(us, us.objects.barrios, function(a, b) { return a !== b; }))
    .attr("class", "border border--state")
    .attr("d", path);

//Function to do a callback once all transitions have finished
function endall(transition, callback) { 
    if (typeof callback !== "function") throw new Error("Wrong callback in endall");
    if (transition.size() === 0) { callback() }
    var n = 0; 
    transition 
        .each(function() { ++n; }) 
        .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
  }

//Transform into an array for projection
datos.forEach(element => {
  coord=[];
  coord.push(element.long);
  coord.push(element.lat);
  element.coord=coord;
});

var i=0;
function draw (datos,hora,dia,available_bikes_mean){
  var dataFilter = datos.filter(function(d){ if (d.dayOfWeek == dia & d.hour==hora) {return d} })
  

var available_bikes_mean_interpolate=available_bikes_mean;
var available_bikes_mean=d3.sum(dataFilter,e=>e.num_bikes_available);

  var day;
    switch(dia) {
      
    case '0':
      var day = 'Lunes';
      break;
    case '1':
      var day = 'Martes';
      break;
    case '2':
      var day = 'Miércoles';
      break;
    case '3':
      var day = 'Jueves';
      break;
    case '4':
      var day = 'Viernes';
      break;
    case '5':
      var day = 'Sábado';
      break;
    case '6':
    var day = 'Domingo';
    break;
    default:
      
    } 

  d3
    .selectAll("circle")
    .data(dataFilter)
    .transition()
    .attr("r",function (d) {if(d.num_bikes_available==0){return 0}else if(d.num_bikes_available<2){return d.num_bikes_available}else{return d.num_bikes_available} })
    .duration(1200)    
    .attr("fill", "red")
    .call(endall, function() { if (++hora < 24) {draw(datos,hora,dia,available_bikes_mean)}});
  
  weekDay
    .transition()
    .duration(1100)
    .text(day);

  label
    .transition()
    .duration(1100)
    .text(hora+"hs");

  available_bikes_label
    .transition()
    .duration(1200)
    .text("Promedio bicis disponibles: "+available_bikes_mean);

    available_bikes_label.transition()
  .tween("text", function() {
    var selection = d3.select(this);    
    var interpolator = d3.interpolateNumber(available_bikes_mean_interpolate,available_bikes_mean);
    return function(t) { selection.text('Promedio bicis disponibles: '+Math.round(interpolator(t))); }; 
     
  })
  .duration(700);
}


var dataFilter_cero = datos.filter(function(d){ if (d.dayOfWeek == "4" & d.hour=="0") {return d} })

var points = svg.append("g")
      .attr("class", "bubble")
      .selectAll("circle")
      .data(dataFilter_cero)

points.enter()
      .append("circle")
      .attr("cx", function (d) {  return chosenProjection(d.coord)[0];})
      .attr("cy", function (d) { return chosenProjection(d.coord)[1];})
      .attr("r",function (d) {if(d.num_bikes_available==0){return 0}else if(d.num_bikes_available<2){return d.num_bikes_available}else{return d.num_bikes_available} })      
      .attr("fill", "red");      



draw(datos,i,'4',500);

window.updateGlobal = function(dia){
  draw(datos,'0',dia,500);
}

});

});

d3.select(self.frameElement).style("height", height + "px");