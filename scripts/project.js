/*
author: Danielle Martin
student no.: 100628392
references:
Stacked         - Data Loading: https://www.d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
                - Normalising data: https://www.d3-graph-gallery.com/graph/barplot_stacked_percent.html
                - Isolate rectangles: https://www.d3-graph-gallery.com/graph/barplot_stacked_hover.html
                - Remove bars: https://stackoverflow.com/questions/36950625/d3-js-updating-a-stacked-bar-chart?fbclid=IwAR2Gmmdn4qaxzQDO7lO0t-yuocnBFa2yP7D8shYNpCFdlmQ69_-V52XKxFQ

Bar             - Mouseover: https://stackoverflow.com/questions/10805184/show-data-on-mouseover-of-circle
ALL             - Tooltip: https://chartio.com/resources/tutorials/how-to-show-data-on-mouseover-in-d3js/ 
                - Formatting: https://observablehq.com/@d3/d3-format 
*/

"use strict";

function barChart(){
        var barFileName = "by-industry";

        //LOADING THE DATA
        d3.csv("data/"+barFileName+".csv", function(error, data){
                if (error) {
                        alert(barFileName + " file not found");
                } 
                else 
                {
                
                //DATA TYPE CONVERSION
                data.forEach(function(d) {
                        d.tonnes = +d.tonnesDay;
                });

                //SORT DATA DESCENDING
                data.sort(function(a, b) {
                        return b.tonnes - a.tonnes;
                });

                //CHART ELEMENT DECLARATIONS
                var chart = document.getElementById("barChart");
                var w = 700;
                var h = 380;
                var tPadding = 70;
                var bPadding = 20;
                var lPadding = 150;
                var rPadding = 50;

                var xScale = d3.scaleLinear()
                        .domain([0, (d3.max(data, function(d) { return d.tonnes; }))])    
                        .rangeRound([lPadding, w]);
                
                var yScale = d3.scaleBand() //ordinal scale
                        .domain(data.map(function(d) { return d.industry; }))
                        .rangeRound([tPadding, h - bPadding])
                        .paddingInner(0.05); //5% of band width  
        
                var svg = d3.select(chart)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);
                
                var myTooltip = d3.select(chart)
                        .append("div")
                        .style("visibility", "hidden")
                        .attr("class", "tooltip")
                        .style("position", "absolute")
                        .style("background-color", "#048884")
                        .style("color", "white")
                        .style("border-radius", "5px")
                        .style("padding", "10px")
                        .style("font-family", "Arial, Helvetica, sans-serif")
                        .style("font-size", "12px")
                        .style("font-weight", "bold")
                        .style("text-anchor", "left");  

                //BARS
                svg.selectAll("rect")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("y", function(d){
                                return yScale(d.industry);
                                })
                        .attr("x", lPadding)
                        .attr("height", yScale.bandwidth())
                        .attr("width", function(d) {
                                return xScale(d.tonnes) - lPadding;
                        })
                        .attr("fill", "#7dc2af")
                        //MOUSE OVER EFFECTS
                        .on("mouseover", function(){
                                return myTooltip.style("visibility", "visible");
                        })
                        .on("mousemove", function(d){
                                d3.select(this)
                                .attr("fill", "#fc8d62");
                                //map the tooltip to current mouse position using pageX and pageY
                                return myTooltip.style("top", (d3.event.pageY-20)+"px") 
                                        .style("left",(d3.event.pageX+10)+"px")
                                        .html(d.industry + " produced " + d3.format(",.4r")(d.tonnes) + "<br/> tonnes per DAY in 2018-2019");
                        })
                        .on("mouseout", function(){
                                d3.select(this)
                                .transition()
                                .duration(100) 
                                .attr("fill", "#7dc2af");
                                return myTooltip.style("visibility", "hidden");
                        });     

                //Y GRID LINES
                var gridlines = d3.axisBottom()
                        .tickFormat("")
                        .ticks(5)
                        .tickSize(h - bPadding)
                        .scale(xScale);

                svg.append("g")
                        .attr("class", "grid")
                        .call(gridlines);
                
                //AXIS
                var xAxis = d3.axisTop()
                        .scale(xScale)
                        .ticks(5); //limit the number of ticks
                svg.append("g")
                        .attr("class", "xAxis")
                        .attr("transform", "translate(0, " + tPadding + ")")
                        .style("font", "14px sans-serif")
                        .call(xAxis);

                var yAxis = d3.axisLeft()
                        .scale(yScale);
                svg.append("g")
                        .attr("class", "yAxis")
                        .attr("transform", "translate(" + lPadding + ", 0 )" ) 
                        .style("font", "14px sans-serif")
                        .call(yAxis);

                //CHART TITLE
                svg.append("text")
                        .attr("x", (w / 2))             
                        .attr("y", 0 + (tPadding / 2))
                        .attr("text-anchor", "middle")  
                        .style("font-size", "16px") 
                        .style("font-weight", "bold") 
                        .style("fill", "rgb(70,70,70)") 
                        .text("Tonnes produced per day in 2018-2019");
                }
        });
}

function stackedChart()
{
        var chart = document.getElementById("stackedChart");

        var w = 700;
        var h = 250;
        var bPadding = 60;
        var tPadding = 60;
        var padding = 110;
        var stackFileName = "by-type";

        //LOADING THE DATA
        d3.csv("data/"+stackFileName+".csv", function(error, data){
                if (error) {
                        alert(stackFileName + " file not found");
                } 
                else 
                {
                        //MAKE CHART AREA                    
                        var svg = d3.select(chart)
                                .append("svg")
                                .attr("width", w)
                                .attr("height", h);  
                        
                        //SET UP KEYS
                        var industry = d3.map(data, function(d){
                                return(d.type)}).keys();
                                
                        var xScale = d3.scaleLinear()
                                .domain([0, 102]) //100 because it's always 100%, +2 for a bit of extra space
                                .rangeRound([ padding, w ]);

                        var yScale = d3.scaleBand()
                                .domain(industry)
                                .rangeRound([tPadding, h])
                                .paddingInner(0.05); //5% of band height    

                        //UPDATE / CREATE CHART
                        var wasteType;
                        var setChartVars = function(a, b){
                                wasteType = data.columns.slice(a, b);

                                //NORMALISE
                                data.forEach(function(d, i) {
                                        var total = 0;
                                        for (i in wasteType){ name=wasteType[i] ; total += +d[name] }
                                        for (i in wasteType){ name=wasteType[i] ; d[name] = d[name] / total * 100 }
                                });

                                //CHART ELEMENT DECLARATIONS
                                var color = d3.scaleOrdinal()
                                        .range(['#e78ac3', '#e5c494', '#fc8d62', '#cdcdcd', '#7dc2af', '#998dcb', '#a6d854', '#ffd92f'])
                                        .domain(industry);

                                var stack = d3.stack()
                                        .keys(wasteType)
                                        .order(d3.stackOrderDescending)
                                        (data);

                                var myTooltip = d3.select(chart)
                                        .append("div")
                                        .style("visibility", "hidden")
                                        .attr("class", "tooltip")
                                        .style("position", "absolute")
                                        .style("background-color", "#048884")
                                        .style("color", "white")
                                        .style("border-radius", "5px")
                                        .style("padding", "10px")
                                        .style("font-family", "Arial, Helvetica, sans-serif")
                                        .style("font-size", "12px")
                                        .style("font-weight", "bold")
                                        .style("text-anchor", "left")
                                        .style("text-align", "left");  

                                //BARS
                                svg.selectAll(".bars").remove();
                                var bars = svg.append("g")
                                        .selectAll("g")
                                        // Enter in the stack data = loop key per key = group per group
                                        .data(stack)
                                        //.exit().remove()
                                        .enter()
                                        .append("g")
                                        .attr("class", "bars")
                                        .style("fill", function(d) {
                                                return color(d.key); 
                                        });
                                var rects = bars.selectAll("rect")
                                        // enter a second time = loop subgroup per subgroup to add all rectangles
                                        .data(function(d) { return d; })
                                        .enter()
                                        .append("rect")
                                        .attr("x", function(d) {
                                                return 1 + xScale(d[0]); 
                                        })
                                        .attr("y", function(d) {
                                                return tPadding + yScale(d.data.type) - bPadding; 
                                        })
                                        .attr("height", yScale.bandwidth())
                                        .attr("width", function(d) {
                                                return xScale(d[1]) - xScale(d[0]); 
                                        })
                                        .attr("opacity", "0.7")

                                        //MOUSE OVER EFFECTS
                                        .on("mouseover", function(){
                                                return myTooltip.style("visibility", "visible");
                                        })
                                        .on("mousemove", function(d){
                                                d3.select(this)
                                                .attr("opacity", "1");
                                                //map the tooltip to current mouse position using pageX and pageY
                                                var wasteTypeName = d3.select(this.parentNode).datum().key; //isolate individual wastetype
                                                
                                                return myTooltip.style("top", (d3.event.pageY-20)+"px") 
                                                        .style("left",(d3.event.pageX+10)+"px")
                                                        .text(d3.format(".0%")((d[1] - d[0]) / 100) + " " + wasteTypeName);

                                        })
                                        .on("mouseout", function(){
                                                d3.select(this)
                                                .transition()
                                                .duration(100) 
                                                .attr("opacity", "0.7");
                                                return myTooltip.style("visibility", "hidden");
                                        });   
                        };
                                 
                        //AXIS
                        var xAxis = d3.axisTop()
                                .scale(xScale)
                                .ticks(5);
                        svg.append("g")
                                .attr("class", "xAxis")
                                .attr("transform", "translate(0, " + tPadding + ")")
                                .style("font", "14px sans-serif")
                                .call(xAxis);

                        var yAxis = d3.axisLeft()
                                .scale(yScale);
                        svg.append("g")
                                .attr("class", "yAxis")
                                .attr("transform", "translate(" + padding + ", 0)" ) 
                                .style("font", "14px sans-serif")
                                .call(yAxis);
                        
                        //CHART TITLE
                        svg.append("text")
                                .attr("x", (w / 2))             
                                .attr("y", 0 + (tPadding / 2))
                                .attr("text-anchor", "middle")  
                                .style("font-size", "16px") 
                                .style("font-weight", "bold") 
                                .style("fill", "rgb(70,70,70)") 
                                .text("Waste type percentage in 2018-2019");

                        //SET DEFAULT VARIABLES
                        setChartVars(1, 9); 

                        //BUTTONS
                        d3.select("#all")
                        .on("click", function() {
                                setChartVars(1, 9);
                        });
                        d3.select("#masonry")
                        .on("click", function() {
                                setChartVars(9, 14);
                        });
                        d3.select("#plastics")
                        .on("click", function() {
                                setChartVars(26, 33);
                        });
                        d3.select("#organic")
                        .on("click", function() {
                                setChartVars(17, 22);
                        });
                        d3.select("#paperCard")
                        .on("click", function() {
                                setChartVars(22, 26);
                        });
                        d3.select("#metals")
                        .on("click", function() {
                                setChartVars(14, 17);
                        });
                        d3.select("#hazardous")
                        .on("click", function() {
                                setChartVars(33, 35);
                        });
                        
                }
        });

}


function init() {
        barChart();
        stackedChart();
}
    

window.onload = init;