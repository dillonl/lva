function DataManager() {
	this.vcf;
	this.allGridData = [];
}

DataManager.prototype.getVCF = function () { return this.vcf; }
DataManager.prototype.getAllGridData = function () { return this.allGridData; }
DataManager.prototype.setAllGridData = function (newGridData) { this.allGridData = newGridData; }
DataManager.prototype.setVCF = function (vcf) { this.vcf = vcf; }

var $DataManager = new DataManager();
