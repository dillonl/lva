var IgnoreList = ['#CHROM', 'POS', 'ID', 'REF', 'ALT', 'QUAL', 'FILTER', 'INFO', 'FORMAT'];
function VCF(vcf) {
	self = this;

	self.vcf = vcf;
	self.samples = {};
	self.parseVCF();
}

VCF.prototype.parseVCF = function (){
	var vcfLines = self.vcf.split('\n');
	var count = 0;
	for (var i = 0; i < vcfLines.length; ++i) {
		var line = vcfLines[i];
		if (line.charAt(0) == '#') {
			if (line.slice(0, 6) == "#CHROM") {
				var headerSections = line.split('\t');
				for (var j = 0; j < headerSections.length; ++j) {
					if (IgnoreList.indexOf(headerSections[j]) >= 0) { continue; }
					self.samples[headerSections[j]] = {};
				}
				return;
			}
		}
		++count;
	}
}

VCF.prototype.getSamples = function (){
	return self.samples;
}
