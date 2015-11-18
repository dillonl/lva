var Variant = function (chromosome, position, referenceCount, alternateCounts) {
	this.chromosome = chromosome;
	this.position = position;
	this.referenceCount = referenceCount;
	this.alternateCounts = alternateCounts;
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
