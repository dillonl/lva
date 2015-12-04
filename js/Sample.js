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

/*
Sample.prototype.addVariant = function (variant) {
	this.variants.push(variant);
}

Sample.prototype.getMinimumAlternateCount = function () {
	if (this.minimum == undefined) {
		this.minimum = 0;
		for (var i = 0; i < this.variants.length; ++i) {
			var v = this.variants[i];
			for (var j = 0; j < v.alternateCounts.length; ++j) {
				this.minimum = (v.alternateCounts[j] < this.minimum) ? v.alternateCounts[j] : this.minimum;
			}
		}
	}
	return this.minimum;
}

Sample.prototype.getFrequenciesAndCounts = function () {
	if (this.countsAndFrequencies == undefined) {
		var maxAF = this.getMaximumAlternateCount();
		var afCounts = {};
		for (var i = 0; i < this.variants.length; ++i) {
			var v = this.variants[i];
			for (var j = 0; j < v.alternateCounts.length; ++j) {
				if (!afCounts.hasOwnProperty(v.alternateCounts[j])) {
					afCounts[v.alternateCounts[j]] = 1;
				}
				else {
					afCounts[v.alternateCounts[j]] += 1;
				}
			}
		}
		this.countsAndFrequencies = [];
		for (var afCount in afCounts) {
			if (afCounts.hasOwnProperty(afCount)) {
				this.countsAndFrequencies.push([parseInt(afCount), afCounts[afCount]]);
			}
		}
	}
	return this.countsAndFrequencies;
}
*/
