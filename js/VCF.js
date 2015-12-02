var IgnoreList = ['#CHROM', 'POS', 'ID', 'REF', 'ALT', 'QUAL', 'FILTER', 'INFO', 'FORMAT'];
var VariantIndices = {'chrom': 0, 'pos': 1, 'info': 7};
function VCF(vcf) {
	this.samples = {};
	this.variants = [];
	this.vcfHeader = [];
	this.vcfLines = [];
	this.parseVCF(vcf);
}

VCF.prototype.getVariants = function () { return this.variants; }
VCF.prototype.getHeader = function () { return this.vcfHeader; }
VCF.prototype.getLines = function () { return this.vcfLines; }

//'Allele | Annotation | Annotation_Impact | Gene_Name | Gene_ID | Feature_Type | Feature_ID | Transcript_BioType | Rank | HGVS.c | HGVS.p | cDNA.pos / cDNA.length | CDS.pos / CDS.length | AA.pos / AA.length | Distance | ERRORS / WARNINGS / INFO'
VCF.prototype.parseVCF = function (vcf) {
	var vcfLines = vcf.split('\n');
	var sampleIndices = {};
	for (var i = 0; i < vcfLines.length; ++i) {
		var line = vcfLines[i];
		if (line.charAt(0) == '#') {
			this.vcfHeader.push(line);
			if (line.slice(0, 6) == "#CHROM") {
				var headerSections = line.split('\t');
				for (var j = 0; j < headerSections.length; ++j) {
					if (IgnoreList.indexOf(headerSections[j]) >= 0) { continue; }
					var sampleName = headerSections[j];
					sampleIndices[sampleName] = j;
				}
			}
		}
		else {
			this.vcfLines.push(line);
			var variant = this.parseVariant(line, sampleIndices);
			if (!variant || line.length == 0) { continue; }
			this.variants.push(variant);
		}
	}
}

VCF.prototype.parseVariant = function(variantLine, sampleIndices) {
	var variantSplit = variantLine.split('\t');
	var chrom = variantSplit[VariantIndices.chrom];
	var pos = variantSplit[VariantIndices.pos];
	var info = parseInfo(variantSplit[VariantIndices.info]);
	var samples = {};
	for (var sampleName in sampleIndices) {
		var sampleIndex = sampleIndices[sampleName];
		var sampleString = variantSplit[sampleIndex];
		if (sampleString == undefined) { continue; }
		var referenceCount = this.getSampleReferenceCount(sampleString);
		var alternateCounts = this.getSampleAlternateCounts(sampleString);
		samples[sampleName] = new Sample(referenceCount, alternateCounts);
	}
	return new Variant(chrom, pos, info, samples);
}

VCF.prototype.getSampleDepthCount = function(sampleString) {
	var splitCounts = parseInt(sampleString.split('DP=')[1].split(';')[0]);
	return splitCounts;
}

VCF.prototype.getSampleReferenceCount = function(sampleString) {
	var value = {};
	var splitCounts = sampleString.split(';DP4=')[1].split(',');
	return parseInt(splitCounts[0]) + parseInt(splitCounts[1]);
}

VCF.prototype.getSampleAlternateCounts = function(sampleString) {
	var splitCounts = sampleString.split(';DP4=')[1].split(',');
	var alternateCounts = [];
	for (var i = 2; i < splitCounts.length; i += 2) {
		alternateCounts.push(parseInt(splitCounts[i]) + parseInt(splitCounts[i + 1]));
	}
	return alternateCounts;
}

VCF.prototype.getSamples = function (){
	return this.samples;
}

function parseReferenceValues(counts) {
	var value = {};
	var splitCounts = counts.split(';DP4=')[1].split(',');
	value.referenceCount = parseInt(splitCounts[0]) + parseInt(splitCounts[1]);
	value.alternateCounts = [];
	for (var i = 2; i < splitCounts.length; i += 2) {
		value.alternateCounts.push(parseInt(splitCounts[i]) + parseInt(splitCounts[i + 1]));
	}
	return value;
}

/*
function parseDepthCount(counts) {
	var value = {};
	var splitCount = counts.split('DP=')[1].split(';')[0];
	return parseInt(splitCount);
}
*/

function parseInfo(infoRaw) {
	var info = {};
	if (infoRaw != undefined && infoRaw.indexOf("ANN=") > -1) {
		var infoSplit = infoRaw.split("|");
		info.annotation = infoSplit[1];
		info.geneName = infoSplit[3];
	}
	return info;
}
