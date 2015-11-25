var Variant = function (chromosome, position, referenceCount, alternateCounts, depthCount, parsedInfo) {
	this.chromosome = chromosome;
	this.position = position;
	this.referenceCount = referenceCount;
	this.alternateCounts = alternateCounts;
	this.depthCount = depthCount;
	this.parsedInfo = parsedInfo;
}

Variant.prototype.getDepthCount = function () {
	return this.depthCount;
}

Variant.prototype.getAlternateAlleleFrequency = function () {
	var maxAlternateCount = this.getMaxAlternateCount();
	var totalCounts = this.referenceCount + maxAlternateCount;
	return (totalCounts == 0) ? 0 : maxAlternateCount / totalCounts;
}

Variant.prototype.getReferenceAlleleFrequency = function() {
	var maxAlternateCount = this.getMaxAlternateCount();
	var totalCounts = this.referenceCount + maxAlternateCount;
	return (totalCounts == 0) ? 0 : this.referenceCount / totalCounts;
}

Variant.prototype.getMaxAlternateCount = function () {
	var maxAlternateCount = 0;
	for (var i = 0; i < this.alternateCounts; ++i) {
		maxAlternateCount = (maxAlternateCount < this.alternateCounts[i]) ? this.alternateCounts[i] : maxAlternateCount;
	}
	return maxAlternateCount;
}

Variant.prototype.getInfo = function (key) {
	if (key in this.parsedInfo) {
		return this.parsedInfo[key];
	}
	return '';
}
