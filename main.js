// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.9/+esm';

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const colorDay = "#ffe066"; // yellow for day
const colorNight = "#274690"; // dark blue for night
const sliderOvalDay = "#ffe066";
const sliderOvalNight = "#274690";
const sliderOvalShadow = "#bbb";
const bgRect = svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "white"); // keep overall background white
// Margins and plot size
const margin = { top: 250, right: 50, bottom: 50, left: 50 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = 200;

const plotGroup = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear().domain([0, 7]).range([0, plotWidth]);
const yScale = d3.scaleLinear().domain([35, 40]).range([plotHeight, 0]);

plotGroup.append("g").call(d3.axisLeft(yScale).tickFormat(d => d + "°C"));
plotGroup.append("g")
  .attr("transform", `translate(0,${plotHeight})`)
  .call(d3.axisBottom(xScale)
    .ticks(7)
    .tickFormat(d => `Day ${d}`));

const lineFemale = plotGroup.append("path")
  .attr("stroke", "#ff1493") // hot pink
  .attr("fill", "none");

const lineMale = plotGroup.append("path")
  .attr("stroke", "blue")
  .attr("fill", "none");

// Vertical line in the plot that follows the slider
const plotVLine = plotGroup.append("line")
  .attr("y1", 0)
  .attr("y2", plotHeight)
  .attr("x1", 0)
  .attr("x2", 0)
  .attr("stroke", "#888")
  .attr("stroke-width", 2)
  .attr("opacity", 0.7);

// Legend
const legend = plotGroup.append("g")
  .attr("transform", `translate(${plotWidth - 100}, 10)`);

legend.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 15)
  .attr("height", 15)
  .attr("fill", "#ff1493");

legend.append("text")
  .attr("x", 20)
  .attr("y", 12)
  .attr("font-size", "14px")
  .text("Female");

legend.append("rect")
  .attr("x", 0)
  .attr("y", 25)
  .attr("width", 15)
  .attr("height", 15)
  .attr("fill", "blue");

legend.append("text")
  .attr("x", 20)
  .attr("y", 37)
  .attr("font-size", "14px")
  .text("Male");

// Slider setup
const sliderY = height - 50;
const slider = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${sliderY})`);

// Oval background for slider
const sliderOval = slider.append("rect")
  .attr("x", -30)
  .attr("y", -22)
  .attr("rx", 22)
  .attr("ry", 22)
  .attr("width", plotWidth + 60)
  .attr("height", 44)
  .attr("fill", sliderOvalNight) // start with night
  .attr("stroke", sliderOvalShadow)
  .attr("stroke-width", 2)
  .attr("filter", "drop-shadow(0px 2px 6px #aaa)");

const sliderScale = d3.scaleLinear()
  .domain([0, 168]) // 7 days × 24 hours
  .range([0, plotWidth]);

// Slider ticks and labels
const tickHours = d3.range(0, 169, 12); // every 12 hours
slider.selectAll(".slider-tick")
  .data(tickHours)
  .enter()
  .append("line")
  .attr("class", "slider-tick")
  .attr("x1", d => sliderScale(d))
  .attr("x2", d => sliderScale(d))
  .attr("y1", 18)
  .attr("y2", 22)
  .attr("stroke", "#333")
  .attr("stroke-width", 2);

slider.selectAll(".slider-tick-label")
  .data(tickHours)
  .enter()
  .append("text")
  .attr("class", "slider-tick-label")
  .attr("x", d => sliderScale(d))
  .attr("y", 38)
  .attr("text-anchor", "middle")
  .attr("font-size", "13px")
  .attr("font-weight", "bold")
  .attr("fill", "#333")
  .text(d => {
    if (d === 0) return "0";
    if (d % 24 === 0) return `${d / 24} days`;
    return `${d} hrs`;
  });

slider.append("line")
  .attr("x1", 0)
  .attr("x2", plotWidth)
  .attr("y1", 0)
  .attr("y2", 0)
  .attr("stroke", "#888")
  .attr("stroke-width", 4)
  .attr("opacity", 0.3);

const handle = slider.append("circle")
  .attr("r", 12)
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("fill", "#fff")
  .attr("stroke", "#333")
  .attr("stroke-width", 3)
  .attr("filter", "drop-shadow(0px 2px 6px #aaa)");

const mouseData = [
  { x: 200, label: "Female", color: "#ff1493" }, // hot pink
  { x: 750, label: "Male", color: "lightblue" }
];

mouseData.forEach((mouse, i) => {
  // Face
  svg.append("circle")
    .attr("cx", mouse.x)
    .attr("cy", 80)
    .attr("r", 40)
    .attr("fill", mouse.color)
    .attr("stroke", "#888")
    .attr("stroke-width", 2)
    .attr("filter", "drop-shadow(0px 2px 6px #aaa)");

  // Ears
  svg.append("circle")
    .attr("cx", mouse.x - 30)
    .attr("cy", 40)
    .attr("r", 15)
    .attr("fill", mouse.color)
    .attr("stroke", "#888")
    .attr("stroke-width", 1.5);

  svg.append("circle")
    .attr("cx", mouse.x + 30)
    .attr("cy", 40)
    .attr("r", 15)
    .attr("fill", mouse.color)
    .attr("stroke", "#888")
    .attr("stroke-width", 1.5);

  // Label
  svg.append("text")
    .attr("x", mouse.x)
    .attr("y", 140)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text(mouse.label);

  // Thermometer border (move to right of face)
  svg.append("rect")
    .attr("x", mouse.x + 55)
    .attr("y", 60)
    .attr("width", 20)
    .attr("height", 80)
    .attr("rx", 10)
    .attr("fill", "#f4f4f4")
    .attr("stroke", "#888")
    .attr("stroke-width", 2)
    .attr("filter", "drop-shadow(0px 2px 6px #aaa)");

  // Thermometer fill (to be updated dynamically)
  mouse.tempBar = svg.append("rect")
    .attr("x", mouse.x + 56)
    .attr("y", 140)
    .attr("width", 18)
    .attr("height", 0)
    .attr("fill", "#e63946");

  // Temperature label (above thermometer)
  mouse.tempLabel = svg.append("text")
    .attr("x", mouse.x + 65)
    .attr("y", 55)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#333")
    .text("0°C");
});

const compareText = svg.append("text")
  .attr("x", width / 2)
  .attr("y", 190)
  .attr("text-anchor", "middle")
  .attr("font-size", "16px")
  .attr("font-weight", "bold")
  .text("On average, female mice are ___ °C hotter/colder!");

const annotation = svg.append("g")
  .attr("transform", "translate(400, 160)")
  .style("display", "none");
annotation.append("rect")
  .attr("width", 170)
  .attr("height", 36)
  .attr("rx", 18)
  .attr("fill", "#e63946")
  .attr("filter", "drop-shadow(0px 2px 6px #aaa)");
annotation.append("text")
  .attr("x", 85)
  .attr("y", 22)
  .attr("text-anchor", "middle")
  .attr("font-size", "18px")
  .attr("font-weight", "bold")
  .attr("fill", "#fff")
  .text("Female is in estrus");

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

    // Calculate average across all columns for each row
    const femAvg = d3.mean(femHourSlice.map(d => d3.mean(Object.values(d))));
    const maleAvg = d3.mean(maleHourSlice.map(d => d3.mean(Object.values(d))));

    femHourly.push({ hour: h, temp: femAvg });
    maleHourly.push({ hour: h, temp: maleAvg });
  }

  const line = d3.line()
    .x(d => xScale(d.hour / 24))
    .y(d => yScale(d.temp));

  lineFemale.attr("d", line(femHourly)).attr("stroke-width", 4);
  lineMale.attr("d", line(maleHourly)).attr("stroke-width", 4);

  function update(hour) {
    const femTemp = femHourly[hour].temp;
    const maleTemp = maleHourly[hour].temp;

    mouseData[0].tempBar
      .attr("y", 140 + 80 - (femTemp - 35) * 16)
      .attr("height", (femTemp - 35) * 16);
    mouseData[0].tempLabel.text(femTemp.toFixed(1) + "°C");

    mouseData[1].tempBar
      .attr("y", 140 + 80 - (maleTemp - 35) * 16)
      .attr("height", (maleTemp - 35) * 16);
    mouseData[1].tempLabel.text(maleTemp.toFixed(1) + "°C");

    const diff = femTemp - maleTemp;
    compareText.text(
      `On average, female mice are ${diff >= 0 ? "+" : ""}${diff.toFixed(1)}°C ${diff >= 0 ? "hotter" : "colder"}!`
    );

    const isDay = (hour % 24) < 12;
    sliderOval.attr("fill", isDay ? sliderOvalDay : sliderOvalNight);
    sliderOval.attr("stroke", isDay ? "#e1c340" : "#1b2a4a");

    // Move handle and vertical line in the plot
    const x = sliderScale(hour);
    handle.attr("cx", x);
    plotVLine.attr("x1", x).attr("x2", x);

    // Estrus badge
    const day = Math.floor(hour / 24) + 1;
    annotation.style("display", (day === 2 || day === 6) ? "block" : "none");
  }

  const drag = d3.drag().on("drag", (event) => {
    let x = Math.max(0, Math.min(event.x, plotWidth));
    handle.attr("cx", x);
    plotVLine.attr("x1", x).attr("x2", x);
    const hour = Math.round(sliderScale.invert(x));
    update(hour);
  });

  handle.call(drag);
  update(0);
});