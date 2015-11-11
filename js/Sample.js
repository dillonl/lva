function Sample(sampleName) {
	this.sampleName = sampleName;
	this.variant = [];
}

Sample.prototype.addVariant = function (variant) {
	this.variant.push(variant);
}
