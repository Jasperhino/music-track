d3.csv('data/tracks_filtered.csv', (track) =>
	d3.autoType({
		id: track.id,
		name: track.name,
		release_date: track.release_date,
		duration: track.duration_ms,
		popularity: track.popularity,
		energy: track.energy,
		loudness: track.loudness,
		acousticness: track.acousticness,
		valence: track.valence,
		tempo: track.tempo,
		decade: track.decade,
	})
).then(useData);

function useData(data) {
	const filtered_data = data.filter((d) => d.duration < 10 * 60 * 1000);
	console.log(
		`We filtered ${data.length - filtered_data.length} of ${
			data.length
		} tracks`
	);

	console.log(
		`Thats ${((data.length - filtered_data.length) / data.length) * 100}%`
	);

	const tempoScale = d3
		.scaleLinear()
		.domain(d3.extent(filtered_data, (d) => d.tempo))
		.range([0, 1]);

	const durationScale = d3
		.scaleLinear()
		.domain(d3.extent(filtered_data, (d) => d.duration))
		.range([0, 1]);

	const loudnessScale = d3
		.scaleLinear()
		.domain([d3.min(filtered_data, (d) => d.loudness), 0])
		.range([0, 1]);

	console.log(
		'duration',
		d3.extent(filtered_data, (d) => d.duration)
	);
	console.log('loudness', [d3.min(filtered_data, (d) => d.loudness), 0]);
	console.log(
		'tempo',
		d3.extent(filtered_data, (d) => d.tempo)
	);

	const scaled_data = filtered_data.map((track) => ({
		name: track.name,
		artists: track.artists,
		tempo: tempoScale(track.tempo),
		duration: durationScale(track.duration),
		loudness: loudnessScale(track.loudness),
		decade: parseInt(track.decade),
		year: new Date(track.release_date).getFullYear(),
		danceability: track.danceability,
		acousticness: track.acousticness,
		energy: track.energy,
		valence: track.valence,
		liveness: track.liveness,
		popularity: track.popularity,
	}));

	const categories = [
		'tempo',
		'duration',
		'loudness',
		'energy',
		'valence',
		'acousticness',
	];

	scaled_data.sort((a, b) => d3.descending(a.popularity, b.popularity));

	const bins = d3.groups(scaled_data, (d) => d.decade);
	console.log(bins);
	const top100bins = bins.map(([name, bin]) => [name, bin.slice(0, 100)]);
	top100bins.sort((a, b) => d3.descending(parseInt(a[0]), parseInt(b[0])));
	console.log(top100bins);

	//Plot
	const width = 400;
	const height = 400;
	const scale = 150;

	for (const [name, bin] of top100bins) {
		console.log(`Created small-multiple-${name}`);
		const container = d3
			.select('#small-multiples-container')
			.append('div')
			.attr('class', 'small-multiples');
		container
			.append('div')
			.attr('class', 'sm-graph-container')
			.attr('id', `small-multiple-${name}`);
		container
			.append('div')
			.attr('class', 'sm-labels-container')
			.append('h3')
			.text(`${name}s`)
			.append('h4')
			.text(`(${name} - ${name + 9})`);

		radar_box_plot(
			`small-multiple-${name}`,
			bin,
			categories,
			width,
			height,
			scale
		);
	}

	//Legend
	const legendSize = 200;
	const legendScale = 100;
	const sectorLegendScale = legendScale * 1.8;
	const rotationOffset = -Math.PI / 2;
	const sectorLegend = d3
		.select('#sector-legend')
		.append('svg')
		.attr('width', legendSize + 100)
		.attr('height', legendSize)
		.attr('viewBox', [
			-legendSize / 2 - 60,
			-legendSize,
			legendSize,
			legendSize,
		]);

	const arc = d3.arc();
	const legendColor = d3.color('#28C850');
	const backgroundColor = 'black';
	const centerOffset = 0.07 * legendScale;
	const sectorAngle = (Math.PI * 2) / categories.length;

	const min = 0.1;
	const q3 = 0.4;
	const median = 0.6;
	const q1 = 0.8;
	const max = 0.9;

	sectorLegend
		.append('path')
		.attr('class', 'arc')
		.attr('stroke-width', 5)
		.attr('fill', backgroundColor)
		.attr(
			'd',
			arc({
				innerRadius: centerOffset,
				outerRadius: sectorLegendScale + centerOffset,
				startAngle: -sectorAngle,
				endAngle: 0,
			})
		);

	sectorLegend
		.append('path')
		.attr('class', 'arc')
		.attr('stroke-width', 5)
		.attr('fill', legendColor.copy({ opacity: 0.4 }))
		.attr(
			'd',
			arc({
				innerRadius: q1 * sectorLegendScale + centerOffset,
				outerRadius: q3 * sectorLegendScale + centerOffset,
				startAngle: -sectorAngle,
				endAngle: 0,
			})
		);

	sectorLegend
		.append('path')
		.attr('class', 'arc')
		.attr('id', 'median')
		.attr('stroke-width', 5)
		.attr('stroke', legendColor)
		.attr(
			'd',
			arc({
				innerRadius: median * sectorLegendScale + centerOffset,
				outerRadius: median * sectorLegendScale + centerOffset,
				startAngle: -sectorAngle,
				endAngle: 0,
			})
		);

	const minPath = d3.path();
	minPath.arc(
		0,
		0,
		min * sectorLegendScale + centerOffset,
		-sectorAngle + rotationOffset,
		rotationOffset
	);

	const maxPath = d3.path();
	maxPath.arc(
		0,
		0,
		max * sectorLegendScale + centerOffset,
		-sectorAngle + rotationOffset,
		rotationOffset
	);

	sectorLegend
		.selectAll('.labels')
		.data([
			['min', min],
			['max', max],
			['q1', q1],
			['q3', q3],
			['median', median],
		])
		.join('text')
		.attr('x', 5)
		.attr('y', ([_, value]) => -(value * sectorLegendScale + centerOffset))
		.attr('dominant-baseline', 'middle')
		.text(([text, _]) => text);

	sectorLegend
		.selectAll('.boundaryArc')
		.data([minPath, maxPath])
		.join('path')
		.attr('fill', 'none')
		.attr('stroke', 'white')
		.attr('stroke-dasharray', '1, 3')
		.attr('stroke-width', 1)
		.attr('d', (p) => p);

	// Radar Legend
	const labelArcs = categories.map((category, i) => {
		const labelArc = d3.path();
		labelArc.arc(
			0,
			0,
			1.05 * legendScale,
			sectorAngle * i + rotationOffset,
			sectorAngle * (i + 1) + rotationOffset
		);

		return [category, labelArc];
	});

	const margin = 30;
	const radarLegend = d3
		.select('#radar-legend')
		.append('svg')
		.attr('width', legendSize)
		.attr('height', legendSize)
		.attr('viewBox', [
			-(legendSize + margin) / 2,
			-(legendSize + margin) / 2,
			legendSize + margin,
			legendSize + margin,
		]);

	radarLegend
		.append('circle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', legendScale)
		.attr('fill', backgroundColor);

	radarLegend
		.append('circle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', centerOffset)
		.attr('fill', 'white');

	radarLegend
		.selectAll('.axis')
		.data(categories)
		.join('line')
		.attr('x1', 0)
		.attr('x2', 0)
		.attr('y1', centerOffset)
		.attr('y2', scale + centerOffset)
		.attr('transform', (_, i) => `rotate(${(i * 360) / categories.length})`)
		.attr('stroke', 'white')
		.attr('stroke-width', 1);

	radarLegend
		.selectAll('.labelArc')
		.data(labelArcs)
		.join('path')
		.attr('id', (a) => `label-${a[0]}`)
		.attr('class', 'arc')
		.attr('fill', 'none')
		.attr('d', (a) => a[1]);

	radarLegend
		.selectAll('.label')
		.data(labelArcs)
		.enter()
		.append('text')
		.append('textPath')
		.attr('xlink:href', (a) => `#label-${a[0]}`)
		.attr('startOffset', '50%')
		.attr('text-anchor', 'middle')
		.text((a) => a[0]);

	const iconSize = 30;
	const icons = categories.map((category, i) => {
		const x =
			Math.cos(sectorAngle * i + sectorAngle / 2 + rotationOffset) *
				legendScale *
				0.6 -
			iconSize / 2;
		const y =
			Math.sin(sectorAngle * i + sectorAngle / 2 + rotationOffset) *
				legendScale *
				0.6 -
			iconSize / 2;
		return [category, x, y];
	});

	radarLegend
		.selectAll('.icon')
		.data(icons)
		.join('svg:image')
		.attr('class', 'icon')
		//.join('circle')
		.attr('xlink:href', ([icon, x, y]) => `assets/${icon}.svg`)
		.attr('width', iconSize)
		.attr('height', iconSize)
		.attr('r', 2)
		.attr('fill', 'red')
		.attr('x', ([_, x, y]) => x)
		.attr('y', ([_, x, y]) => y);
}

function radar_box_plot(container_id, data, categories, width, height, scale) {
	const colorScale = d3.scaleLinear().domain([0, categories.length]);
	const categoryColor = (c) => d3.interpolateWarm(colorScale(c));

	const axisColor = '#303030';
	const backgroundColor = '#101010';
	const rotationOffset = -Math.PI / 2;
	const centerOffset = 0.07 * scale;
	const sectorAngle = (Math.PI * 2) / categories.length;

	let quantileArcs = [];
	let medianArcs = [];
	let minArcs = [];
	let maxArcs = [];

	categories.forEach((category, i) => {
		const values = data.map((d) => d[category]);
		const q1 = d3.quantile(values, 0.25);
		const q3 = d3.quantile(values, 0.75);

		quantileArcs.push({
			innerRadius: q1 * scale + centerOffset,
			outerRadius: q3 * scale + centerOffset,
			startAngle: sectorAngle * i,
			endAngle: sectorAngle * (i + 1),
		});

		const median = d3.median(values);
		medianArcs.push({
			innerRadius: median * scale + centerOffset,
			outerRadius: median * scale + centerOffset,
			startAngle: sectorAngle * i,
			endAngle: sectorAngle * (i + 1),
		});

		const min = d3.min(values);
		const minPath = d3.path();
		minPath.arc(
			0,
			0,
			min * scale + centerOffset,
			sectorAngle * i + rotationOffset,
			sectorAngle * (i + 1) + rotationOffset
		);
		minArcs.push(minPath);

		const max = d3.max(values);
		const maxPath = d3.path();
		maxPath.arc(
			0,
			0,
			max * scale + centerOffset,
			sectorAngle * i + rotationOffset,
			sectorAngle * (i + 1) + rotationOffset
		);
		maxArcs.push(maxPath);
	});

	// Drawing
	const arc = d3.arc();

	const svg = d3
		.select(`#${container_id}`)
		.insert('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [-width / 2, -height / 2, width, height]);

	svg.append('circle')
		.attr('r', scale + centerOffset)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', backgroundColor);

	svg.append('circle')
		.attr('r', centerOffset)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', 'white')
		.attr('stroke', axisColor)
		.attr('stroke-width', 1);

	const arcs = svg.append('g').attr('class', 'sector');

	arcs.selectAll('.boundaryArc')
		.data(minArcs.concat(maxArcs))
		.join('path')
		.attr('fill', 'none')
		.attr('stroke', (_, i) => categoryColor(i % categories.length))
		.attr('stroke-dasharray', '1, 3')
		.attr('stroke-width', 1)
		.attr('d', (p) => p);

	arcs.selectAll('.quantileArc')
		.data(quantileArcs)
		.join('path')
		.attr('class', 'arc')
		.attr('fill', (_, i) =>
			d3.color(categoryColor(i)).copy({ opacity: 0.2 })
		)
		.attr('d', (a) => arc(a));

	arcs.selectAll('.medianArc')
		.data(medianArcs)
		.join('path')
		.attr('class', 'arc')
		.attr('stroke', (_, i) => categoryColor(i))
		.attr('stroke-width', 5)
		.attr('d', (a) => arc(a));

	arcs.selectAll('.axis')
		.data(categories)
		.join('line')
		.attr('class', (c) => c)
		.attr('x1', 0)
		.attr('x2', 0)
		.attr('y1', -centerOffset)
		.attr('y2', -(scale + centerOffset))
		.attr('transform', (_, i) => `rotate(${(i * 360) / categories.length})`)
		.attr('stroke', axisColor)
		.attr('stroke-width', 1);
}
