import { arc } from 'https://cdn.skypack.dev/d3-shape@3';

d3.csv('data/tracks.csv', (track) =>
	d3.autoType({
		id: track.id,
		name: track.name,
		release_date: track.release_date,
		duration: track.duration_ms,
		//danceability: track.danceability,
		energy: track.energy,
		loudness: track.loudness,
		liveness: track.liveness,
		acousticness: track.acousticness,
		valence: track.valence,
		tempo: track.tempo,
		popularity: track.popularity,
		artists: track.artists,
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
		.domain(d3.extent(filtered_data, (d) => d.loudness))
		.range([0, 1]);

	console.log(
		'duration',
		d3.extent(filtered_data, (d) => d.duration)
	);
	console.log(
		'loudness',
		d3.extent(filtered_data, (d) => d.loudness)
	);
	console.log(
		'tempo',
		d3.extent(filtered_data, (d) => d.tempo)
	);

	const scaled_data = filtered_data.map((track) => ({
		name: track.name,
		artists: track.artists,
		tempo: tempoScale(track.tempo),
		durtion: durationScale(track.duration),
		loudness: loudnessScale(track.loudness),
		year: new Date(track.release_date).getFullYear(),
		danceability: track.danceability,
		acousticness: track.acousticness,
		energy: track.energy,
		valence: track.valence,
		liveness: track.liveness,
		popularity: track.popularity,
	}));

	scaled_data.sort((a, b) => d3.descending(a.popularity, b.popularity));
	const ticks = d3
		.scaleTime()
		.domain(d3.extent(scaled_data, (d) => d.year))
		.ticks(10)
		.slice(2, -1);

	console.log('ticks', ticks);
	const bins = d3
		.bin()
		.value((d) => d.year)
		.thresholds(ticks)(scaled_data);

	const top100bins = bins.map((bin) => bin.slice(0, 100));
	const decade_bins = top100bins.slice(1, top100bins.length);
	console.log('bins', decade_bins);

	//Plot
	const width = 500;
	const height = 500;
	console.log(decade_bins);

	const categories = [
		'tempo',
		'durtion',
		'loudness',
		'energy',
		'valence',
		'acousticness',
	];

	categories.forEach((category, i) => {
		const svg = d3
			.select('#visualization')
			.append('svg')
			.attr('id', category)
			.attr('viewBox', [-width / 2, -height / 2, width, height]);

		radar_box_plot(svg, decade_bins, category, width, height);
	});
}

function radar_box_plot(svg, bins, category, width, height, scale = 200) {
	let quantileArcs = [];
	let medianArcs = [];
	let minArcs = [];
	let maxArcs = [];
	let labelArcs = [];

	bins.forEach((bin, i) => {
		const values = bin.map((d) => d[category]);
		const sectorAngle = (Math.PI * 2) / bins.length;

		const q1 = d3.quantile(values, 0.25);
		const q3 = d3.quantile(values, 0.75);

		quantileArcs.push({
			innerRadius: q1 * scale,
			outerRadius: q3 * scale,
			startAngle: sectorAngle * i,
			endAngle: sectorAngle * (i + 1),
		});

		const median = d3.median(values);
		medianArcs.push({
			innerRadius: median * scale,
			outerRadius: median * scale,
			value: median,
			startAngle: sectorAngle * i,
			endAngle: sectorAngle * (i + 1),
		});

		const min = d3.min(values);
		minArcs.push({
			innerRadius: min * scale,
			outerRadius: min * scale,
			startAngle: sectorAngle * i,
			endAngle: sectorAngle * (i + 1),
		});

		const max = d3.max(values);
		maxArcs.push({
			innerRadius: max * scale,
			outerRadius: max * scale,
			startAngle: sectorAngle * i,
			endAngle: sectorAngle * (i + 1),
		});

		labelArcs.push({
			innerRadius: 1.1 * scale,
			outerRadius: 1.1 * scale,
			startAngle: sectorAngle * i,
			endAngle: sectorAngle * (i + 1),
		});
	});

	const arc = d3.arc();
	//Todo add groups
	svg.selectAll('.minArc')
		.data(minArcs)
		.join('path')
		.attr('class', 'arc')
		.attr('stroke-dasharray', '1,5')
		.attr('fill', 'none')
		.attr('stroke', 'white')
		.attr('d', (a) => arc(a));

	svg.selectAll('.maxArc')
		.data(maxArcs)
		.join('path')
		.attr('class', 'arc')
		.attr('stroke-dasharray', '1,5')
		.attr('fill', 'none')
		.attr('stroke', 'white')
		.attr('d', (a) => arc(a));

	svg.selectAll('.quantileArc')
		.data(quantileArcs)
		.join('path')
		.attr('class', 'arc')
		.attr('fill', '#28C85030')
		.attr('d', (a) => arc(a));

	svg.selectAll('.medianArc')
		.data(medianArcs)
		.join('path')
		.attr('class', 'arc')
		.attr('stroke', '#28C850')
		.attr('stroke-width', 5)
		.attr('d', (a) => arc(a));

	const tickSize = 10;
	svg.selectAll('.ticks')
		.data(bins)
		.enter()
		.append('line')
		.attr('x1', scale - tickSize)
		.attr('y1', scale - tickSize)
		.attr('x2', 0)
		.attr('y2', scale)
		.attr('transform', (d, i) => `rotate(${(i * 360) / 7 + 360 / 14})`)
		.attr('stroke', 'white');

	svg.selectAll('.labelArcs')
		.data(labelArcs)
		.join('path')
		.attr('id', (a) => `label-${a[0]}`)
		.attr('class', 'arc')
		//.attr('stroke', 'red')
		.attr('stroke-width', 5)
		.attr('d', (a) => arc(a[1]));

	svg.selectAll('.labels')
		.data(labelArcs)
		.enter()
		.append('text')
		.append('textPath') //append a textPath to the text element
		.attr('xlink:href', (a) => `#label-${a[0]}`) //place the ID of the path here
		.attr('fill', 'white')
		.text((a) => a[0]);
}
