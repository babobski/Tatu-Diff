if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.TatuDiff) === 'undefined') extensions.TatuDiff = {
	version: '1.3'
};

(function() {
	var self 	= window.arguments[0],
		ko 		= self.ko,
		scope 	= this,
		notify 	= self.notify,
		parser 	= ko.uriparse,
		overlay = self.overlay;


	if (!('TatuDiff' in ko)) ko.extensions = {};

	this._selectLocalFile = (node) => {
		var input = node.parentNode.parentNode.childNodes[0].childNodes[0];

		try {
			var path = ko.filepicker.browseForFile();
			window.focus();
			if (path) {
				input.value = path;
				window.focus();
			}
		} catch (e) {
			alert('Error: ' + e.message);
		}

	};
	
	this._selectRemoteFile = (node) => {
		var input = node.parentNode.parentNode.childNodes[0].childNodes[0],
			defaultUrl = false,
			currentProject = ko.projects.manager.currentProject,
			projectPref = currentProject.prefset,
			projectFileDir = 
			ko.interpolate.activeProjectPath().replace(/[\/\\][^\/\\]+$/, ''),
			liveImportDir = projectPref.hasStringPref('import_dirname') ? projectPref.getStringPref('import_dirname') : '',
			projectDir = liveImportDir ? (liveImportDir.match(/(\/\/|[a-zA-Z])/) ? liveImportDir : (projectFileDir + '/' + liveImportDir)) : projectFileDir;
		
		if (currentProject !== null && scope.isRemote(projectDir)) {
			defaultUrl = parser.displayPath(projectDir);
		}
		
		try {
			
			var path = ko.filepicker.remoteFileBrowser(defaultUrl);
			window.focus();
			if (path) {
				path = path.file;
				input.value = path;
				window.focus();
			}
		} catch (e) {
			alert('Error: ' + e.message);
		}

	};
	
	this._openDiff = ($file01, $file02) => {
		var diff01 = scope._readFile($file01),
			diff02 = scope._readFile($file02);
		
		overlay._openDiffWindow(diff01, diff02, $file01, $file02);
	};
	
	this._init = () => {
		var d = ko.views.manager.currentView.document || ko.views.manager.currentView.koDoc,
			file = d.file,
			path = (file) ? file.URI : null;
			
		if (path !== null) {
			document.getElementById('file01').value = parser.displayPath(path);
			document.getElementById('file02').focus();
		}
	};
	
	this._swapFiles = () => {
		var file01 = document.getElementById('file01'),
			file02 = document.getElementById('file02'),
			file01Val = file01.value,
			file02Val = file02.value;
		
		file01.value = file02Val;
		file02.value = file01Val;
	};

	

	this.focus = () => {
		var wenum = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
			.getService(Components.interfaces.nsIWindowWatcher)
			.getWindowEnumerator();
		var index = 1;
		var windowName = "TatuDiff-filescope-prefs";
		while (wenum.hasMoreElements()) {
			var win = wenum.getNext();
			if (win.name == windowName) {
				win.focus();
				return;
			}
			index++;
		}
	};


	this.isRemote = (url) => {
		if (/^ftp:\/\//i.test(url)) {
			return true;
		} else if (/^sftp:\/\//i.test(url)) {
			return true;
		} else if (/[a-z0-9\-_]+@/i.test(url)) {
			return true;
		}

		return false;
	};

	this._in_array = (search, array) => {
		for (i = 0; i < array.length; i++) {
			if (array[i] == search) {
				return true;
			}
		}
		return false;
	};

	this._last_slash = (uri) => {
		if (/\//.test(uri)) {
			return uri.lastIndexOf('/');
		} else {
			return uri.lastIndexOf('\\');
		}
	};
	
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
	};

}).apply(extensions.TatuDiff);
