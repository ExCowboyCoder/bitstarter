#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var URL_DEFAULT = "";
var CHECKSFILE_DEFAULT = "checks.json";


var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(htmlfile);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <remote_url>', 'Url path to check', clone(function(u){return u;}),URL_DEFAULT)
        .parse(process.argv);
    
    var checkCall = function(html){
	var checkJson = checkHtmlFile(html, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	
	console.log(outJson);
    };


    if (program.url != ""){
	restler.get(program.url).on('complete',checkCall);
    } else{
	checkCall(fs.readFileSync(program.file));
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
