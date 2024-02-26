export default function updateMap(map, name, start, newName = null) {
	if (map.has(name)) {
		const mapItem = map.get(name);
		if (!mapItem.positions.includes(start)) {
			mapItem.positions.push(start);
		}
		map.set(name, mapItem);
		return;
	}

	map.set(name, {
		name: newName ?? name,
		positions: [start],
	});
}
