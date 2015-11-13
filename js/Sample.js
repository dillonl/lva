function Sample(sampleName) {
	this.sampleName = sampleName;
	this.variants = [];
	this.minimum = undefined;
	this.maximum = undefined;
	this.countsAndFrequencies = undefined
}

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

Sample.prototype.getMaximumAlternateCount = function () {
	if (this.minimum == undefined) {
		this.maximum = 0;
		for (var i = 0; i < this.variants.length; ++i) {
			var v = this.variants[i];
			for (var j = 0; j < v.alternateCounts.length; ++j) {
				this.maximum = (v.alternateCounts[j] > this.maximum) ? v.alternateCounts[j] : this.maximum;
			}
		}
	}
	return this.maximum;

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
