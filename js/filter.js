(function ($) {
	function SlickGridFilter(dataView, grid, $container, data) {
		$filteredData = data;
		$data = data;
		$dataView = dataView;
		$grid = grid;
		function init(data) {
			constructFilterUI(data);
		}

		function constructFilterUI(data) {
			$container.empty();

			var chromosomes = getUniqueProperties(data, 'Chrom');
			var geneName = getUniqueProperties(data, 'Gene Name');
			var annotation = getUniqueProperties(data, 'Annotation');

			$(getSelector(chromosomes, "subclone-filter-chromosome", "Chrom")).appendTo($container);
			$(getSelector(geneName.sort(), "subclone-filter-gene-name", "Gene Name")).appendTo($container);
			$(getSelector(annotation.sort(), "subclone-filter-annotation", "Annotation")).appendTo($container);

			$('<button id="select-all-button">Select All</button>').appendTo($container);
			$('<button id="invert-selection-button" class="filter-buttons" disabled>Invert Selection</button>').appendTo($container);
			$('<button id="delete-selection-button" class="filter-buttons" disabled>Delete Selection</button>').appendTo($container);
			$('<button id="create-cluster-button" class="filter-buttons" disabled>Create Cluster</button>').appendTo($container);

			$('#subclone-filter-chromosome').change(updateFilteredData);
			$('#subclone-filter-gene-name').change(updateFilteredData);
			$('#subclone-filter-annotation').change(updateFilteredData);
			$('#select-all-button').click(selectAll);
			$('#create-cluster-button').click(createCluster);
			$('#invert-selection-button').click(invertSelection);
			$('#delete-selection-button').click(deleteSelection);
			$container.children().wrapAll("<div class='subclone-filter' />");

		}
		init(data);
	}

	function invertSelection() {
		console.log('started');
		var highlightedData = [];
		var selectedRows = $RowSelectionModel.getSelectedRows();
		var gridItems = $grid.getData().getItems();
		var tmpData = {};
		for (var i = 0; i < gridItems.length; ++i) {
			if (selectedRows.indexOf(i) < 0) {
				highlightedData.push(i);
			}
		}
		$RowSelectionModel.setSelectedRows(highlightedData);
		if (highlightedData.length == 0) { parcoords.unhighlight(); }
	}

	function deleteSelection() {
		var sparedData = [];
		var selectedRows = $RowSelectionModel.getSelectedRows();
		var gridItems = $grid.getData().getItems();
		var tmpData = {};
		for (var i = 0; i < selectedRows.length; ++i) {
			var gridItem = gridItems[selectedRows[i]];
			tmpData[gridItem.id] = true;
		}
		for (var i = 0; i < $data.length; ++i) {
			if (!tmpData[$data[i].id]) {
				sparedData.push($data[i]);
			}
		}
		$data = sparedData;
		$filteredData = $data;
		$dataView.beginUpdate();
		$dataView.setItems($data);
		$dataView.endUpdate();
		parcoords.data($data).render();
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
	}

	function selectAll() {
		var highlightedData = [];
		for (var i = 0; i < $grid.getData().getItems().length; ++i) {
			highlightedData.push(i);
		}
		$RowSelectionModel.setSelectedRows(highlightedData);
	}

	function updateFilteredData(event) {
		$('#select-all-toggle').attr('checked', false);
		var tmpData = $data;
		var filteredData = [];
		$.each($('select.filter'), function (i, el) {
			var selectedValue = $(el).val();
			if (selectedValue == '') { return; }
			filteredData = [];
			for (var i = 0; i < tmpData.length; ++i) {
				if (tmpData[i][$(el).attr('data')] == selectedValue) {
					filteredData.push(tmpData[i]);
				}
			}
			tmpData = filteredData;
		});
		if (tmpData.length == $data.length) {
			filteredData = $data;
		}
		$filteredData = filteredData;
		$dataView.beginUpdate();
		$dataView.setItems(filteredData);
		$dataView.endUpdate();
		parcoords.data(filteredData).render();
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
	}

	function getUniqueProperties(data, property) {
		var values = [];
		var dups = {};
		$.each(data, function (i, el) {
			if (!dups[el[property]]) {
				dups[el[property]] = true;
				values.push(el[property]);
			}
		});
		return values;
	}
	function getSelector(values, id, label) {
		var selector = '<label for="'+id+'">'+label+'</label><select id="'+id+'" class="filter" data="'+label+'"><option value="">[No Filter]</option>';
		$.each(values, function (i, el) {
				selector += '<option value="'+el+'">'+el+'</option>';
		});
		selector += '</select>';
		return selector
	}

	function createCluster(event) {
		var clusterItems = [];
		var gridItems = $grid.getData().getItems();
		var selectedRows = $RowSelectionModel.getSelectedRows();
		for (var i = 0; i < selectedRows.length; ++i) {
			clusterItems.push(gridItems[selectedRows[i]]);
		}
		var cluster = new Cluster(clusterItems);
		$ClusterManager.addCluster(cluster);
		console.log('cluster', clusterItems);
		parcoords.highlight(clusterItems);
		/*
		$dataView.beginUpdate();
		$dataView.setItems(clusterItems);
		$dataView.endUpdate();
		parcoords.data(clusterItems).render();
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
		*/
	}

	$.extend(true, window, { Slick:{ Controls:{ SlickGridFilter:SlickGridFilter }}});
})(jQuery);
