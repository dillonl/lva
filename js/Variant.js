var Variant = function (chromosome, position, info, samples) {
	this.chromosome = chromosome;
	this.position = position;
	this.parsedInfo = info;
	this.samples = samples;
}

Variant.prototype.getChromosome = function () { return this.chromosome; }
Variant.prototype.getPosition = function () { return this.position; }
Variant.prototype.getAnnotation = function () { return this.parsedInfo.annotation; }
Variant.prototype.getGeneName = function () { return this.parsedInfo.geneName; }
Variant.prototype.getSamples = function () { return this.samples; }

/*
var Variant = function (chromosome, position, referenceCount, alternateCounts, parsedInfo) {
	this.chromosome = chromosome;
	this.position = position;
	this.referenceCount = referenceCount;
	this.alternateCounts = alternateCounts;
	var depthCount = 0;
	$.each(this.alternateCounts, function(i,c) { depthCount += c; });
	this.depthCount = depthCount + referenceCount;
	this.parsedInfo = parsedInfo;
}
*/
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
	return '-';
}
