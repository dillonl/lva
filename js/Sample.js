function Sample(sampleName) {
	this.sampleName = sampleName;
	this.variants = [];
}

Sample.prototype.addVariant = function (variant) {
	this.variants.push(variant);
}
