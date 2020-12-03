const constants = {
	emptyGeojson: {
		type: "FeatureCollection",
		features: [],
	},
	mapStyle: {
		arrows: {
			direction: {
				forward: "> ",
				back: " <",
			},

			side: {
				right: [
					[16, [0, 1]],
					[22, [0, 10]],
				],
				left: [
					[16, [0, -1]],
					[22, [0, -10]],
				],
			},
		}
	}
}

export default constants;