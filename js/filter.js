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

			$('<input type="checkbox" id="select-all-toggle" /><label for="select-all-toggle">Select All</label>').appendTo($container);

			$('<button id="create-cluster">Create Cluster</button>').appendTo($container);

			$('#subclone-filter-chromosome').change(updateFilteredData);
			$('#subclone-filter-gene-name').change(updateFilteredData);
			$('#subclone-filter-annotation').change(updateFilteredData);
			$('#select-all-toggle').change(toggleSelection);
			$('#create-cluster').click(createCluster);
			$container.children().wrapAll("<div class='subclone-filter' />");

		}
		init(data);
	}

	function toggleSelection(event) {
		if ($('#select-all-toggle').is(":checked")) {
			var highlightedData = [];
			for (var i = 0; i < $grid.getData().getItems().length; ++i) {
				highlightedData.push(i);
			}
			$RowSelectionModel.setSelectedRows(highlightedData);
			// parcoords.highlight($filteredData);
			// $RowSelectionModel.setSelectedRows($filteredData);
			// for (var i = 0; i < $CurrentData.length; ++i) { indices.push($CurrentData[i].id); }
			// $RowSelectionModel.setSelectedRows($CurrentRows);
			console.log('checked', $grid.getData().getItems());
		}
		else {
			$RowSelectionModel.setSelectedRows([]);
			parcoords.unhighlight();
			// console.log('unchecked');
		}
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
		ClusterManager.addCluster(cluster);
		$dataView.beginUpdate();
		$dataView.setItems(clusterItems);
		$dataView.endUpdate();
		parcoords.data(clusterItems).render();
		parcoords.unhighlight();
	}

	$.extend(true, window, { Slick:{ Controls:{ SlickGridFilter:SlickGridFilter }}});
})(jQuery);
