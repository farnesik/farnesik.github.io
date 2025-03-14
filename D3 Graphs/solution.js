// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 800,
        height = 500;

    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }; 
    // Create the SVG container
    let svg = d3.select('#boxplot')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    let xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.5);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g").call(d3.axisLeft(yScale));

    // Add axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Platform");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Likes");

    // Compute quartiles
    const rollupFunction = function(values) {
        values.sort((a, b) => a.Likes - b.Likes);
        const q1 = d3.quantile(values.map(d => d.Likes), 0.25);
        const median = d3.quantile(values.map(d => d.Likes), 0.5);
        const q3 = d3.quantile(values.map(d => d.Likes), 0.75);
        const min = d3.min(values, d => d.Likes);
        const max = d3.max(values, d => d.Likes);
        return { q1, median, q3, min, max };
    };

    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

    // Draw the boxplot
    quartilesByPlatform.forEach((quartiles, platform) => {
        const x = xScale(platform);
        const boxWidth = xScale.bandwidth();

        // Vertical line (min to max)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black");

        // Box (Q1 to Q3)
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");

        // Median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black");
    });
});

// Load the summarized data for bar plot
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    data.forEach(d => {
        d.AvgLikes = +parseFloat(d.AvgLikes).toFixed(2);
    });
    
    // Define the dimensions and margins for the SVG
    let width = 1100,
        height = 500;

    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }; 

    let svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0));
    svg.append("g").call(d3.axisLeft(y));

    // Add axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Platform");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Likes");

    const barGroups = svg.selectAll("g.bar-group")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    barGroups.append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 45}, 20)`);
    const types = [...new Set(data.map(d => d.PostType))];
    types.forEach((type, i) => {
        legend.append("rect").attr("x", 0).attr("y", i * 20).attr("width", 10).attr("height", 10).attr("fill", color(type));
        legend.append("text").attr("x", 15).attr("y", i * 20 + 10).text(type);
    });
});

// Load the data for the line plot
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    data.forEach(d => {
        d.AvgLikes = +d.AvgLikes;
    });

    let width = 800,
        height = 500;

    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }; 

    let svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let x = d3.scalePoint()
        .domain(data.map(d => d.Date))
        .range([0, width]);

    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height, 0]);
        
    // Add axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Likes");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "center");

    svg.append("g").call(d3.axisLeft(y));

    let line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line);
});
