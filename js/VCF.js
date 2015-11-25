var IgnoreList = ['#CHROM', 'POS', 'ID', 'REF', 'ALT', 'QUAL', 'FILTER', 'INFO', 'FORMAT'];
function VCF(vcf) {
	this.samples = {};
	this.parseVCF(vcf);
}

//'Allele | Annotation | Annotation_Impact | Gene_Name | Gene_ID | Feature_Type | Feature_ID | Transcript_BioType | Rank | HGVS.c | HGVS.p | cDNA.pos / cDNA.length | CDS.pos / CDS.length | AA.pos / AA.length | Distance | ERRORS / WARNINGS / INFO'
VCF.prototype.parseVCF = function (vcf){
	var vcfLines = vcf.split('\n');
	var sampleIndices = {};
	for (var i = 0; i < vcfLines.length; ++i) {
		var line = vcfLines[i];
		if (line.charAt(0) == '#') {
			if (line.slice(0, 6) == "#CHROM") {
				var headerSections = line.split('\t');
				for (var j = 0; j < headerSections.length; ++j) {
					if (IgnoreList.indexOf(headerSections[j]) >= 0) { continue; }
					var sampleName = headerSections[j];
					sampleIndices[sampleName] = j;
					this.samples[sampleName] = new Sample(sampleName);
				}
			}
		}
		else {
			var lineSections = line.split('\t');
			for (var sampleName in sampleIndices) {
				if (sampleIndices.hasOwnProperty(sampleName)) {
					var chromosome = lineSections[0];
					var position = parseInt(lineSections[1]);
					var parsedInfo = parseInfo(lineSections[7]);
					// console.log(infoRaw);
					var sampleIndex = sampleIndices[sampleName];
					var sampleCounts = lineSections[sampleIndex];
					if (sampleCounts == undefined) { continue; }
					var parsedCounts = parseReferenceValues(sampleCounts);
					var depthCount = parseDepthCount(sampleCounts);
					var variant = new Variant(chromosome, position, parsedCounts.referenceCount, parsedCounts.alternateCounts, depthCount, parsedInfo);
					this.samples[sampleName].addVariant(variant);
				}
			}
		}
	}
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

function parseDepthCount(counts) {
	var value = {};
	var splitCount = counts.split('DP=')[1].split(';')[0];
	return parseInt(splitCount);
}

function parseInfo(infoRaw) {
	var info = {};
	if (infoRaw != undefined && infoRaw.indexOf("ANN=") > -1) {
		var infoSplit = infoRaw.split("|");
		info.annotation = infoSplit[1];
		info.geneName = infoSplit[3];
	}
	return info;
}
