(function ($) {
	function SlickGridFilter(dataView, grid, $container, data) {
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
			$('<button id="deselect-all-button">Deselect All</button>').appendTo($container);
			$('<button id="invert-selection-button" class="filter-buttons" disabled>Invert Selection</button>').appendTo($container);
			$('<button id="delete-selection-button" class="filter-buttons" disabled>Delete Selection</button>').appendTo($container);
			$('<button id="save-selected-button" class="filter-buttons" disabled>Export Selected</button>').appendTo($container);

			$('#subclone-filter-chromosome').change(updateFilteredData);
			$('#subclone-filter-gene-name').change(updateFilteredData);
			$('#subclone-filter-annotation').change(updateFilteredData);
			$('#select-all-button').click(selectAll);
			$('#deselect-all-button').click(deselectAll);
			$('#delete-selection-button').click(deleteSelection);
			$('#save-selected-button').click(saveSelected);
			$container.children().wrapAll("<div class='subclone-filter' />");

		}
		init(data);
	}

	function saveSelected() {
		var fileName = prompt("Enter the filename", "");
		if (fileName == null) { return; }
		var vcfFile = $DataManager.getVCF();
		var header = vcfFile.getHeader();
		var lines = vcfFile.getLines();
		var vcf = "";
		for (var i = 0; i < header.length; ++i) {
			vcf += header[i] + "\n";
		}
		var currentlySelectedItems = $RowSelectionModel.getSelectedRows();

		currentlySelectedItems.sort();
		var added = {};
		for (var i = 0; i < currentlySelectedItems.length; ++i) {
			if (!added[currentlySelectedItems[i]]) {
				vcf += lines[currentlySelectedItems[i]] + "\n";
				added[currentlySelectedItems[i]] = true;
			}
		}
		var blob = new Blob([vcf], {type: "text/plain;charset=utf-8"});
		fileName = (fileName.endsWith(".vcf")) ? fileName : fileName + ".vcf";
		saveAs(blob, fileName);
	}

	function invertSelection() {
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

	function deselectAll() {
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
		$dataView.beginUpdate();
		$dataView.setItems($DataManager.getAllGridData());
		$dataView.endUpdate();
		parcoords.data($DataManager.getAllGridData()).render();
		parcoords.brushReset();
	}

	function deleteSelection() {
		var sparedData = [];
		var selectedRows = $RowSelectionModel.getSelectedRows();
		var gridItems = $grid.getData().getItems();
		var deletedItems = {};
		for (var i = 0; i < selectedRows.length; ++i) {
			var gridItem = gridItems[selectedRows[i]];
			deletedItems[gridItem.id] = true;
		}
		for (var i = 0; i < $DataManager.getAllGridData().length; ++i) {
			if (!deletedItems[$DataManager.getAllGridData()[i].id]) {
				sparedData.push($DataManager.getAllGridData()[i]);
			}
		}
		$DataManager.setAllGridData(sparedData);
		$dataView.beginUpdate();
		$dataView.setItems(sparedData);
		$dataView.endUpdate();
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
		updateFilteredData();
		parcoords.brushReset();
	}

	function selectAll() {
		var highlightedData = [];
		for (var i = 0; i < $grid.getData().getItems().length; ++i) {
			highlightedData.push(i);
		}
		$RowSelectionModel.setSelectedRows(highlightedData);
	}

	function updateFilteredData(event) {
		var tmpData = $DataManager.getAllGridData();
		var filteredData = [];
		$.each($('select.filter'), function (i, el) {
			var selectedValue = $(el).val();
			if (selectedValue == '[]') { return; }
			filteredData = [];
			for (var i = 0; i < tmpData.length; ++i) {
				if (tmpData[i][$(el).attr('data')] == selectedValue) {
					filteredData.push(tmpData[i]);
				}
			}
			tmpData = filteredData;
		});

		$dataView.beginUpdate();
		$dataView.setItems(tmpData);
		$dataView.endUpdate();
		parcoords.data(tmpData).render();
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
		var selector = '<label for="'+id+'">'+label+'</label><select id="'+id+'" class="filter" data="'+label+'"><option value="[]">[No Filter]</option>';
		$.each(values, function (i, el) {
				selector += '<option value="'+el+'">'+el+'</option>';
		});
		selector += '</select>';
		return selector
	}

	$.extend(true, window, { Slick:{ Controls:{ SlickGridFilter:SlickGridFilter }}});
})(jQuery);
