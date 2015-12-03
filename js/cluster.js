var clusterID = 1;
var presetColors = [
	'rgba(127,191,123,255)',
	'rgba(239,138,98,255)',
	'rgba(175,141,195,255)',
	'rgba(216,179,101,255)',
	'rgba(244,154,223,255)',
	'rgba(237,171,145,255)',
	'rgba(182,228,160,255)',
	'rgba(128,170,171,255)',
	'rgba(224,235,132,255)',
	'rgba(150,235,174,255)'
];
function Cluster(gridObjects) {
	this.color = ((clusterID - 1) < presetColors.length) ? presetColors[clusterID - 1] : pastelColors(); // the first 10 can use preset but after that just randomly generate one
	this.averages = {};
	this.select = false;
	for (var i = 0; i < gridObjects.length; ++i) {
		gridObjects[i].Color = this.color;
		gridObjects[i].ClusterID = clusterID;
		for (var j = 0; j < $SampleNames.length; ++j) {
			var sampleName = $SampleNames[j];
			// console.log(sampleName, parseFloat(gridObjects[i][sampleName]));
			if (!this.averages[sampleName + "AF"]) {
				this.averages[sampleName + "AF"] = 0;
			}
			this.averages[sampleName + "AF"] += parseFloat(gridObjects[i][sampleName]);
		}
	}

	for (var j = 0; j < $SampleNames.length; ++j) {
		var sampleName = $SampleNames[j];
		this.averages[sampleName + "AF"] = this.averages[sampleName + "AF"] / parseFloat(gridObjects.length);
	}
	this.clusterID = clusterID++;
	this.gridObjects = gridObjects;
	$('#clusters-container').append(createClusterHtml(this));
}

Cluster.prototype.getData = function () { return this.gridObjects; }

function selectCluster(hold, clusterID) {
	parcoords.unhighlight();
	var selectedItems = [];
	var selectedIndices = [];
	var currentlySelectedItems = $RowSelectionModel.getSelectedRows();

	// first set the indices of the selected rows so they stay selected
	for (var i = 0; i < currentlySelectedItems.length; ++i) {
		var selectedItem = $grid.getData().getItems()[currentlySelectedItems[i]];
		selectedIndices.push(currentlySelectedItems[i]);
		selectedItems.push(selectedItem);
	}

	// then create a map from item.id to row index so it can be looked up in constant time in the clusters loop below
	var tmpIDToRowIndex = {};
	for (var i = 0; i < $grid.getData().getItems().length; ++i) {
		tmpIDToRowIndex[$grid.getData().getItems()[i].id] = i;
	}
	var clusters = $ClusterManager.getClusters();

	// loop through the clusters and add all the cluster items and their row index (using map produced above)
	for (var i = 0; i < clusters.length; ++i) {
		for (var j = 0; j < clusters[i].getData().length; ++j) {
			var item = clusters[i].getData()[j];
			if (hold || clusters[i].selected || item.ClusterID == clusterID) {
				selectedItems.push(item);
				selectedIndices.push(tmpIDToRowIndex[item.id]);
				console.log(tmpIDToRowIndex[item.id]);
				clusters[i].selected = true;
			}
		}
	}
	$RowSelectionModel.setSelectedRows(selectedIndices);
	parcoords.highlight(selectedItems);
}

function mouseOverCluster(clusterID) {
	parcoords.unhighlight();
	var selectedItems = [];
	var selectedIndices = [];
	var currentlySelectedItems = $RowSelectionModel.getSelectedRows();
	for (var i = 0; i < currentlySelectedItems.length; ++i) {
		selectedIndices.push(currentlySelectedItems[i]);
	}
	for (var i = 0; i < $DataManager.getAllGridData().length; ++i) {
		if (currentlySelectedItems.indexOf($DataManager.getAllGridData()[i].id) >= 0) {
			selectedItems.push($DataManager.getAllGridData()[i]);
			selectedIndices.push($DataManager.getAllGridData()[i].id);
		}
	}
	var clusters = $ClusterManager.getClusters();
	for (var i = 0; i < clusters.length; ++i) {
		for (var j = 0; j < clusters[i].getData().length; ++j) {
			var item = clusters[i].getData()[j];
			if (clusters[i].selected || item.ClusterID == clusterID) {
				selectedItems.push(item);
				selectedIndices.push(item.id);
			}
		}
	}
	parcoords.highlight(selectedItems);
}

function createClusterHtml(cluster) {
	var html = '<span id="cluster-' + cluster.clusterID + '" class="cluster-item" onmouseover="mouseOverCluster('+cluster.clusterID+')" onmouseout="mouseOutCluster()" onclick="selectCluster(event.shiftKey, '+cluster.clusterID+')" >';
	html += '<span class="cluster-header">Variants Count: ' + cluster.gridObjects.length + '</span>';
	/*
	html += '<ul>';
	for (var j = 0; j < $SampleNames.length; ++j) {
		var sampleName = $SampleNames[j];
		html += "<li>" + sampleName + ": " + cluster.averages[sampleName + "AF"] + "</li>";
	}
	html += '</ul>'
	*/
	html += "</span>";
	return html;
}

function mouseOutCluster() {
	if ($RowSelectionModel.getSelectedRows().length == 0) {
		parcoords.unhighlight();
	}
	/*
	var selectedItems = [];
	var selectedIndices = [];
	var clusters = $ClusterManager.getClusters();
	for (var i = 0; i < clusters.length; ++i) {
		for (var j = 0; j < clusters[i].getData().length; ++j) {
			var item = clusters[i].getData()[j];
			if (clusters[i].selected) {
				selectedItems.push(item);
				selectedIndices.push(item.id);
			}
		}
	}
	$RowSelectionModel.setSelectedRows(selectedIndices);
	parcoords.highlight(selectedItems);
	*/
}

function SlickGridCluster(dataView, grid, $container, data) {
	// $('#grid-container').append('<div id="clusters"></div>');
	this.clusters = {};
	$('<span class="clusters-header">Clusters</span><span id="clusters-container"></span>').appendTo($container);
	$('<button id="create-cluster-button" class="filter-buttons" disabled>Create Cluster</button>').appendTo($container);
	$container.children().wrapAll("<div class='subclone-clusters' />");
	$('#create-cluster-button').click(this.createCluster);
}

SlickGridCluster.prototype.addCluster = function (cluster) {
	this.clusters[cluster.clusterID] = cluster;
	parcoords.render();
	setTimeout(function () {
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
	}, 100);
}

SlickGridCluster.prototype.removeCluster = function (clusterID) {
	delete this.clusters[clusterID];
}

SlickGridCluster.prototype.getClusters = function (clusterID) {
	var clustersData = [];
	for (var clusterID in this.clusters) {
		clustersData.push(this.clusters[clusterID]);
	}
	return clustersData;
}

SlickGridCluster.prototype.createCluster = function (event) {
	var clusterItems = [];
	var gridItems = $grid.getData().getItems();
	var selectedRows = $RowSelectionModel.getSelectedRows();
	for (var i = 0; i < selectedRows.length; ++i) {
		clusterItems.push(gridItems[selectedRows[i]]);
	}
	var cluster = new Cluster(clusterItems);
	$ClusterManager.addCluster(cluster);
	parcoords.highlight(clusterItems);
}
