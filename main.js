// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.9/+esm';

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const colorDay = "#fff9d1";
const colorNight = "#d0e6f7";
const bgRect = svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .attr("fill", colorNight); // start with night - FIX THIS  
// Margins and plot size
const margin = { top: 250, right: 50, bottom: 50, left: 50 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = 200;

const plotGroup = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear().domain([0, 7]).range([0, plotWidth]);
const yScale = d3.scaleLinear().domain([35, 40]).range([plotHeight, 0]);

plotGroup.append("g").call(d3.axisLeft(yScale));
plotGroup.append("g")
  .attr("transform", `translate(0,${plotHeight})`)
  .call(d3.axisBottom(xScale)
    .ticks(7)
    .tickFormat(d => `Day ${d}`));

const lineFemale = plotGroup.append("path")
  .attr("stroke", "pink")
  .attr("fill", "none");

const lineMale = plotGroup.append("path")
  .attr("stroke", "blue")
  .attr("fill", "none");
// Slider setup
const slider = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${height - 50})`);

const sliderScale = d3.scaleLinear()
  .domain([0, 168]) // 7 days × 24 hours
  .range([0, plotWidth]);

slider.append("line")
  .attr("x1", 0)
  .attr("x2", plotWidth)
  .attr("stroke", "gray");

const handle = slider.append("circle")
  .attr("r", 8)
  .attr("cx", 0)
  .attr("fill", "gray");
  const mouseData = [
    { x: 200, label: "Female", color: "pink" },
    { x: 750, label: "Male", color: "lightblue" }
  ];
  
  mouseData.forEach(mouse => {
    // Face
    svg.append("circle")
      .attr("cx", mouse.x)
      .attr("cy", 80)
      .attr("r", 40)
      .attr("fill", mouse.color);
  
    // Ears
    svg.append("circle")
      .attr("cx", mouse.x - 30)
      .attr("cy", 40)
      .attr("r", 15)
      .attr("fill", mouse.color);
  
    svg.append("circle")
      .attr("cx", mouse.x + 30)
      .attr("cy", 40)
      .attr("r", 15)
      .attr("fill", mouse.color);
  
    // Label
    svg.append("text")
      .attr("x", mouse.x)
      .attr("y", 140)
      .attr("text-anchor", "middle")
      .text(mouse.label);
  
    // Thermometer border
    svg.append("rect")
      .attr("x", mouse.x - 10)
      .attr("y", 160)
      .attr("width", 20)
      .attr("height", 100)
      .attr("fill", "none")
      .attr("stroke", "#000");
  
    // Thermometer fill (to be updated dynamically)
    mouse.tempBar = svg.append("rect")
      .attr("x", mouse.x - 9)
      .attr("y", 260)
      .attr("width", 18)
      .attr("height", 0)
      .attr("fill", "red");
  
    // Temperature label
    mouse.tempLabel = svg.append("text")
      .attr("x", mouse.x)
      .attr("y", 280)
      .attr("text-anchor", "middle")
      .text("0°C");
  });
  const compareText = svg.append("text")
  .attr("x", width / 2)
  .attr("y", 190)
  .attr("text-anchor", "middle")
  .attr("font-size", "16px")
  .attr("font-weight", "bold")
  .text("On average, female mice are ___ °C hotter/colder!");
  const annotation = svg.append("text")
  .attr("x", 200)  // position near female mouse
  .attr("y", 30)
  .attr("class", "annotation")
  .attr("font-size", "14px")
  .attr("fill", "red")
  .attr("font-weight", "bold")
  .style("display", "none")
  .text("Female mouse is in estrus!");

Promise.all([
  d3.csv("fem_temp.csv", d3.autoType),
  d3.csv("male_temp.csv", d3.autoType)
]).then(([femData, maleData]) => {
  // Take first 7 days = 10080 minutes
  femData = femData.slice(0, 10080);
  maleData = maleData.slice(0, 10080);

  const hours = 168; // 7 days × 24 hours
  const femHourly = [], maleHourly = [];

  for (let h = 0; h < hours; h++) {
    const start = h * 60;
    const end = start + 60;

    const femHourSlice = femData.slice(start, end);
    const maleHourSlice = maleData.slice(start, end);

    const femAvg = d3.mean(femHourSlice.flatMap(d => Object.values(d)));
    const maleAvg = d3.mean(maleHourSlice.flatMap(d => Object.values(d)));

    femHourly.push({ hour: h, temp: femAvg });
    maleHourly.push({ hour: h, temp: maleAvg });
  }

  const line = d3.line()
    .x(d => xScale(d.hour / 24))
    .y(d => yScale(d.temp));

  lineFemale.attr("d", line(femHourly));
  lineMale.attr("d", line(maleHourly));

  function update(hour) {
    const femTemp = femHourly[hour].temp;
    const maleTemp = maleHourly[hour].temp;

    mouseData[0].tempBar
      .attr("y", 260 - (femTemp - 35) * 20)
      .attr("height", (femTemp - 35) * 20);
    mouseData[0].tempLabel.text(femTemp.toFixed(1) + "°C");

    mouseData[1].tempBar
      .attr("y", 260 - (maleTemp - 35) * 20)
      .attr("height", (maleTemp - 35) * 20);
    mouseData[1].tempLabel.text(maleTemp.toFixed(1) + "°C");

    const diff = femTemp - maleTemp;
    compareText.text(
      `On average, female mice are ${diff >= 0 ? "+" : ""}${diff.toFixed(1)}°C ${diff >= 0 ? "hotter" : "colder"}!`
    );

    const isDay = (hour % 24) < 12;
    bgRect.attr("fill", isDay ? colorDay : colorNight);

    const day = Math.floor(hour / 24) + 1;
    annotation.style("display", (day === 2 || day === 6) ? "block" : "none");
  }

  const drag = d3.drag().on("drag", (event) => {
    let x = Math.max(0, Math.min(event.x, width - 100));
    handle.attr("cx", x);
    const hour = Math.round(sliderScale.invert(x));
    update(hour);
  });

  handle.call(drag);
  update(0);
});