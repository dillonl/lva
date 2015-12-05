/*
  This class represents a timepoint. I dropped this implementation for a better architecture.
 */
function Sample(referenceCount, alternateCounts) {
	this.referenceCount = referenceCount;
	this.alternateCounts = alternateCounts;
	var highestIndex = this.getHighestAlternate(alternateCounts);
	this.alternateCount = alternateCounts[highestIndex];
	this.depthCount = this.referenceCount + this.alternateCount;
	this.alleleFrequency = (this.depthCount > 0) ? parseFloat(this.alternateCount) / parseFloat(this.depthCount) : 0;
}

Sample.prototype.getDepthCount = function () { return this.depthCount; }
Sample.prototype.getReferenceCount = function () { return this.referenceCount; }
Sample.prototype.getAlternateCount = function () { return this.alternateCount; }
Sample.prototype.getAlternateCounts = function () { return this.alternateCounts; }
Sample.prototype.getAlleleFrequency = function () { return this.alleleFrequency; }

Sample.prototype.getHighestAlternate = function (alternateCounts) {
	var maximum = 0;
	var index = 0;
	for (var i = 0; i < alternateCounts.length; ++i) {
		if (alternateCounts[i] > maximum) {
			maximum = alternateCounts[i];
			index = i;
		}
	}
	return index;

}
