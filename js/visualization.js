import { arc } from 'https://cdn.skypack.dev/d3-shape@3';

d3.csv('data/tracks.csv', (track) =>
	d3.autoType({
		id: track.id,
		name: track.name,
		release_date: track.release_date,
		duration: track.duration_ms,
		danceability: track.danceability,
		energy: track.energy,
		loudness: track.loudness,
		liveness: track.liveness,
		valence: track.valence,
		tempo: track.tempo,
		popularity: track.popularity,
		artists: track.artists,
	})
).then(useData);

function useData(data) {
	const tempoScale = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.tempo))
		.range([0, 1]);

	const durationScale = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.duration))
		.range([0, 1]);

	const loudnessScale = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.loudness))
		.range([0, 1]);

	console.log(d3.extent(data, (d) => d.duration));
	console.log(tempoScale(data[0].tempo));
	console.log(loudnessScale(-17));
	console.log(
		'duration',
		d3.extent(data, (d) => d.duration)
	);
	console.log(
		'loudness',
		d3.extent(data, (d) => d.loudness)
	);
	console.log(
		'tempo',
		d3.extent(data, (d) => d.tempo)
	);

	const scaled_data = data.map((track) => ({
		name: track.name,
		artists: track.artists,
		tempo: tempoScale(track.tempo),
		durtion: durationScale(track.duration),
		loudness: loudnessScale(track.loudness),
		year: new Date(track.release_date).getFullYear(),
		danceability: track.danceability,
		energy: track.energy,
		valence: track.valence,
		liveness: track.liveness,
		popularity: track.popularity,
	}));

	scaled_data.sort((a, b) => d3.descending(a.popularity, b.popularity));

	console.log(scaled_data[0]);

	const ticks = d3
		.scaleTime()
		.domain(d3.extent(data, (d) => d.release_date))
		.ticks(10)
		.slice(2, -1);

	console.log(ticks);
	const bins = d3
		.bin()
		.value((d) => d.year)
		.thresholds(ticks)(scaled_data);

	const top100bins = bins.map((bin) => bin.slice(0, 10));
	console.log(top100bins);

	//Plot
	const width = 500;
	const height = 500;

	top100bins.map((bin, i) => {
		console.log(`small-multiple-${i + 1}`);
		radar_box_plot(bin, `small-multiple-${i + 1}`, width, height);
	});
}

function radar_box_plot(data, container_id, width, height, scale = 200) {
	const categories = [
		'tempo',
		'durtion',
		'loudness',
		'danceability',
		'energy',
		'valence',
		'liveness',
	];

	const svg = d3.select(`#${container_id}`).append('svg');

	const quantileArcs = categories.map((category, i) => {
		const values = data.map((d) => d[category]);
		const q1 = d3.quantile(values, 0.25);
		const q3 = d3.quantile(values, 0.75);
		return {
			innerRadius: q1 * scale,
			outerRadius: q3 * scale,
			startAngle: ((Math.PI * 2) / 7) * i,
			endAngle: ((Math.PI * 2) / 7) * (i + 1),
		};
	});

	const medianArcs = categories.map((category, i) => {
		const values = data.map((d) => d[category]);
		const median = d3.median(values);
		return {
			innerRadius: median * scale,
			outerRadius: median * scale,
			value: median,
			startAngle: ((Math.PI * 2) / 7) * i,
			endAngle: ((Math.PI * 2) / 7) * (i + 1),
		};
	});

	const minArcs = categories.map((category, i) => {
		const values = data.map((d) => d[category]);
		const min = d3.min(values);
		return {
			innerRadius: min * scale,
			outerRadius: min * scale,
			startAngle: ((Math.PI * 2) / 7) * i,
			endAngle: ((Math.PI * 2) / 7) * (i + 1),
		};
	});

	const maxArcs = categories.map((category, i) => {
		const values = data.map((d) => d[category]);
		const max = d3.max(values);
		return {
			innerRadius: max * scale,
			outerRadius: max * scale,
			startAngle: ((Math.PI * 2) / 7) * i,
			endAngle: ((Math.PI * 2) / 7) * (i + 1),
		};
	});

	const axes = categories.map((category, i) => {
		const values = data.map((d) => d[category]);
		const max = d3.max(values);
		return {
			innerRadius: max * scale,
			outerRadius: max * scale,
			startAngle: ((Math.PI * 2) / 7) * i,
			endAngle: ((Math.PI * 2) / 7) * (i + 1),
		};
	});
	const arc = d3.arc();

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

	svg.selectAll('.axis')
		.data(categories)
		.enter()
		.append('line')
		.attr('x1', 0)
		.attr('x2', 0)
		.attr('y1', 0)
		.attr('y2', scale)
		.attr('transform', (d, i) => `rotate(${(i * 360) / 7 + 360 / 14})`)
		.attr('stroke', 'white');

	return d3
		.select(container_id)
		.append('svg')
		.attr('viewBox', [-width / 2, -height / 2, width, height]);
}
