function loadSampleData() {
	$.get('data/somatic.graphite.vcf', function (vcfString) {
		var vcf = new VCF(vcfString);
		console.log(vcf.getSamples());
	});
}
