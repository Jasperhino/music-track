import { arc } from 'https://cdn.skypack.dev/d3-shape@3';

d3.csv('data/tracks.csv', (track) =>
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
		duration: durationScale(track.duration),
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
	for (const [i, bin] of decade_bins.entries()) {
		console.log(`small-multiple-${i + 1}`);
		radar_box_plot(bin, `small-multiple-${i + 1}`, width, height);
	}
}

function radar_box_plot(data, container_id, width, height, scale = 200) {
	const categories = [
		'tempo',
		'duration',
		'loudness',
		'energy',
		'valence',
		'acousticness',
	];

	const svg = d3
		.select(`#${container_id}`)
		.append('svg')
		.attr('viewBox', [-width / 2, -height / 2, width, height]);

	let quantileArcs = [];
	let medianArcs = [];
	let minArcs = [];
	let maxArcs = [];

	categories.forEach((category, i) => {
		const values = data.map((d) => d[category]);
		const sectorAngle = (Math.PI * 2) / categories.length;
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
		const num_dashes = Math.floor(21) / 2 + 1;

		for (let d = 0; d < num_dashes; d++) {
			if (d % 2 == 0) continue;
			minArcs.push({
				innerRadius: min * scale,
				outerRadius: min * scale,
				startAngle: sectorAngle * i + (d * sectorAngle) / num_dashes,
				endAngle:
					sectorAngle * (i + 1) +
					((d + 1) * sectorAngle) / num_dashes,
			});

			const max = d3.max(values);

			maxArcs.push({
				innerRadius: max * scale,
				outerRadius: max * scale,
				startAngle: (sectorAngle * i) / num_dashes,
				endAngle: (sectorAngle * (i + 1)) / num_dashes,
			});
		}
	});

	const arc = d3.arc();

	const dataColor = '#28C850';
	const axisColor = '#303030';
	const backgroundColor = '#101010';

	svg.append('circle')
		.attr('r', scale)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', backgroundColor)
		.attr('stroke', axisColor)
		.attr('stroke-width', 1);

	svg.selectAll('.minArc')
		.data(minArcs.concat(maxArcs))
		.join('path')
		.attr('class', 'arc')
		.attr('fill', 'none')
		.attr('stroke', dataColor)
		//.attr('stroke-dasharray', '1, 5')
		.attr('stroke-width', 1)
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
		.attr('stroke', dataColor)
		.attr('stroke-width', 5)
		.attr('d', (a) => arc(a));

	svg.selectAll('.axis')
		.data(categories)
		.join('line')
		.attr('x1', 0)
		.attr('x2', 0)
		.attr('y1', 0)
		.attr('y2', scale)
		.attr('transform', (d, i) => `rotate(${(i * 360) / categories.length})`)
		.attr('stroke', axisColor)
		.attr('stroke-width', 1);
}
