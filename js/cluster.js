var clusterID = 0;
var presetColors = [
	'rgba(164,202,209,255)',
	'rgba(219,186,202,255)',
	'rgba(200,158,141,255)',
	'rgba(200,132,203,255)',
	'rgba(131,138,196,255)',
	'rgba(244,154,223,255)',
	'rgba(237,171,145,255)',
	'rgba(182,228,160,255)',
	'rgba(128,170,171,255)',
	'rgba(224,235,132,255)',
	'rgba(150,235,174,255)'
];
function Cluster(gridObjects) {
	this.color = (clusterID < presetColors.length) ? presetColors[clusterID] : pastelColors(); // the first 10 can use preset but after that just randomly generate one
	this.averages = {};
	for (var i = 0; i < gridObjects.length; ++i) {
		gridObjects[i].Color = this.color;
		gridObjects[i].ClusterID = clusterID;
		for (var j = 0; j < $SampleNames.length; ++j) {
			var sampleName = $SampleNames[j];
			console.log(sampleName, parseFloat(gridObjects[i][sampleName]));
			if (!this.averages[sampleName + "AF"]) {
				this.averages[sampleName + "AF"] = 0;
			}
			this.averages[sampleName + "AF"] += parseFloat(gridObjects[i][sampleName]);
		}
	}
	// console.log(gridObjects);

	for (var j = 0; j < $SampleNames.length; ++j) {
		var sampleName = $SampleNames[j];
		console.log(this.averages[sampleName + "AF"]);
		this.averages[sampleName + "AF"] = this.averages[sampleName + "AF"] / parseFloat(gridObjects.length);
	}
	this.clusterID = clusterID++;
	this.gridObjects = gridObjects;
	$('#clusters-container').append(createClusterHtml(this));
}

function createClusterHtml(cluster) {
	var html = '<span>' + cluster.gridObjects.length + '</span>';
	html += '<ul>';
	for (var j = 0; j < $SampleNames.length; ++j) {
		var sampleName = $SampleNames[j];
		html += "<li>" + sampleName + ": " + cluster.averages[sampleName + "AF"] + "</li>";
	}
	html += '</ul>'
	return html;
}

function SlickGridCluster(dataView, grid, $container, data) {
	// $('#grid-container').append('<div id="clusters"></div>');
	this.clusters = {};
	$('<span class="clusters-header">Clusters</span><span id="clusters-container"></span>').appendTo($container);
	$container.children().wrapAll("<div class='subclone-clusters' />");
}

SlickGridCluster.prototype.addCluster = function (cluster) {
	this.clusters[cluster.clusterID] = cluster;
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
