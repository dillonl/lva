var clusterID = 0;
//rgba(164,202,209,255)
//rgba(219,186,202,255)
function Cluster(gridObjects) {
	this.color = pastelColors();
	for (var i = 0; i < gridObjects.length; ++i) {
		gridObjects[i].Color = this.color;
		gridObjects[i].ClusterID = clusterID;
	}
	this.clusterID = clusterID++;
	this.gridObjects = gridObjects;
}

function ClusterManager() {
	this.clusters = {};
}

ClusterManager.prototype.addCluster = function (cluster) {
	this.clusters[cluster.clusterID] = cluster;
}

ClusterManager.prototype.removeCluster = function (clusterID) {
	delete this.clusters[clusterID];
}

ClusterManager.prototype.getClusters = function (clusterID) {
	var clustersData = [];
	for (var clusterID in this.clusters) {
		clustersData.push(this.clusters[clusterID]);
	}
	return clustersData;
}

var ClusterManager = new ClusterManager();
