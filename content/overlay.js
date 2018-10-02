/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.TatuDiff) === 'undefined') extensions.TatuDiff = {
	version: '1.0'
};

(function() {
	
   var 	$       	= require("ko/dom"),
		notify		= require("notify/notify"),
		clipboard 	= require("sdk/clipboard"),
		self		= this,
		uriParse	= ko.uriparse,
		Cc 			= Components.classes,
		prefs 		= require("ko/prefs"),
		schemeService = Cc['@activestate.com/koScintillaSchemeService;1'].getService();
		
	this.compareWithClipoard =  () => {
		var clipboardValue 	= clipboard.get(),
			currentView 	= require("ko/views").current(),
			d 				= currentView.get('koDoc'),
			file 			= d.file,
			buffer 			= d.buffer,
			path 			= (file) ? file.URI : null;
		
		if (!buffer) {
			return false;
		}
		
		self._openDiffWindow(clipboardValue, buffer, 'Clipboard', path);
	}
	
	this.compareWithDisk = () => {
		var currentView 	= require("ko/views").current(),
			d 				= currentView.get('koDoc'),
			file 			= d.file,
			buffer 			= d.buffer,
			path 			= (file) ? file.URI : null,
			diskContent 	= '';
		
		if (!file) {
			return false;
		}
		
		diskContent = self._readFile(path);
		
		self._openDiffWindow(buffer, diskContent, 'Current buffer', path);
	}
	
	this.compareFiles = () => {
		var features = "chrome,titlebar,toolbar,centerscreen,resizable";
		var windowVars = {
			ko: ko,
			overlay: self,
			notify: notify,
		};
		window.openDialog('chrome://TatuDiff/content/selectFilesForDiff.xul', "TatuDiff", features, windowVars);
	}
	
	this._openDiffWindow = (diff01, diff02, title01, title02) => {
		var win 		= require("ko/windows").getMostRecent(null),
			language 	= require("ko/views").current().get('language'),
			chromeURL 	= 'chrome://TatuDiff/content/wrapper.xul',
			features 	= "chrome,toolbar,centerscreen,resizable",
			windowVars 	= {
				ko: ko,
				schemeService: schemeService,
				prefs: prefs,
				overlay: self,
				diff01: diff01,
				diff02: diff02,
				language: language,
				title01: title01 === 'Clipboard' ? title01 : uriParse.displayPath(title01),
				title02: uriParse.displayPath(title02),
				clipboard: clipboard,
			};
			
		win.openDialog(chromeURL, 'diffWindow', features, windowVars);
	}
	
	this._readFile = (filepath) => {
		var reader = Components.classes["@activestate.com/koFileEx;1"]
			.createInstance(Components.interfaces.koIFileEx),
			placeholder;

		reader.path = filepath;

		try {
			reader.open("r");
			placeholder = reader.readfile();
			reader.close();
			
			return placeholder;

		} catch (e) {
			//alert('DIFF ERROR: Reading file: ' + filepath);
		}

		return false;
	}
	
	this._addDynamicToolbarButton = () => {
		const db = require('ko/dynamic-button');
		var currentView = require("ko/views").current();

		const view = () => {
			return currentView && currentView !== "New Tab";
		};

		const button = db.register({
			label: "Diff viewer",
			tooltip: "Diff viewer",
			icon: "eye",
			events: [
				"current_view_changed",
			],
			menuitems: [
				{
					label: "Compare with clipboard",
					name: "compare-clipboard",
					command: () => {
						extensions.TatuDiff.compareWithClipoard();
					}
				},
				{
					label: "Compare with file on disk",
					name: "compare-on-disk",
					command: () => {
						extensions.TatuDiff.compareWithDisk();
					}
				},
				{
					label: "Diff files",
					name: "diff-files",
					command: () => {
						extensions.TatuDiff.compareFiles();
					}
				}
			],
			isEnabled: () => {
				return view();
			},
		});
	};
	
	self._addDynamicToolbarButton();

}).apply(extensions.TatuDiff);
