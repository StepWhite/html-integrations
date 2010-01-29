// Including core.js
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = CKEDITOR.basePath + '/plugins/ckeditor_wiris/core/core.js';
document.getElementsByTagName('head')[0].appendChild(script);

// Configuration
var _wrs_conf_editorEnabled = true;		// Specifies if fomula editor is enabled
var _wrs_conf_CASEnabled = true;		// Specifies if WIRIS CAS is enabled

var _wrs_conf_imageMathmlAttribute = 'alt';	// Specifies the image tag where we should save the formula editor mathml code
var _wrs_conf_CASMathmlAttribute = 'alt';	// Specifies the image tag where we should save the WIRIS CAS mathml code

var _wrs_conf_editorPath = CKEDITOR.basePath + '/plugins/ckeditor_wiris/integration/editor.php';			// Specifies where is the editor HTML code (for popup window)
var _wrs_conf_editorAttributes = 'width=500, height=400, scroll=no, resizable=yes';								// Specifies formula editor window options
var _wrs_conf_CASPath = CKEDITOR.basePath + '/plugins/ckeditor_wiris/integration/cas.php';					// Specifies where is the WIRIS CAS HTML code (for popup window)
var _wrs_conf_CASAttributes = 'width=640, height=480, scroll=no, resizable=yes';								// Specifies WIRIS CAS window options

var _wrs_conf_createimagePath = CKEDITOR.basePath + '/plugins/ckeditor_wiris/integration/createimage.php';			// Specifies where is createimage script
var _wrs_conf_createcasimagePath = CKEDITOR.basePath + '/plugins/ckeditor_wiris/integration/createcasimage.php';	// Specifies where is createcasimage script

// Vars
var _wrs_int_editorIcon = CKEDITOR.basePath + '/plugins/ckeditor_wiris/core/wiris-formula.gif';
var _wrs_int_CASIcon = CKEDITOR.basePath + '/plugins/ckeditor_wiris/core/wiris-cas.gif';
var _wrs_int_temporalIframe;
var _wrs_int_window;
var _wrs_int_window_opened = false;
var _wrs_int_temporalImageResizing;

// Plugin integration

CKEDITOR.plugins.add('ckeditor_wiris', {
	'init': function (editor) {
		var iframe;
		
		function whenDocReady() {
			var iframeContainer = document.getElementById('cke_' + editor.name);
			iframeContainer = document.getElementById('cke_example');
			
			if (window.wrs_initParse && iframeContainer != null) {
				alert('le fu');
				editor.setData(wrs_initParse(editor.getData()));
				iframe = iframeContainer.firstChild;
				wrs_addIframeEvents(iframe, wrs_int_doubleClickHandler, wrs_int_mousedownHandler, wrs_int_mouseupHandler);
			}
			else {
				setTimeout(whenDocReady, 50);
			}
		}
		
		whenDocReady();
		
		if (_wrs_conf_editorEnabled) {
			editor.addCommand('ckeditor_wiris_openFormulaEditor', {
				'async': false,								// The command need some time to complete after exec function returns.
				'canUndo': false,
				'editorFocus': false,
				
				'exec': function (editor) {
					/*var we = '';
					
					for (var i in iframe) {
						we += i + "\n";
					}
					
					alert(we);*/
					
					wrs_int_openNewFormulaEditor(iframe);
				}
			});
			
			editor.ui.addButton('ckeditor_wiris_formulaEditor', {
				'label': 'Formula Editor',
				'command': 'ckeditor_wiris_openFormulaEditor',
				'icon': _wrs_int_editorIcon
			});
		}
	}
});

/**
 * Opens formula editor.
 * @param object iframe Target
 */
function wrs_int_openNewFormulaEditor(iframe) {
	if (_wrs_int_window_opened) {
		_wrs_int_window.focus();
	}
	else {
		_wrs_int_window_opened = _wrs_isNewElement = true;
		_wrs_int_temporalIframe = iframe;
		_wrs_int_window = window.open(_wrs_conf_editorPath, 'WIRISFormulaEditor', _wrs_conf_editorAttributes);
	}
}

/**
 * Opens CAS.
 * @param object iframe Target
 */
function wrs_int_openNewCAS(iframe) {
	if (_wrs_int_window_opened) {
		_wrs_int_window.focus();
	}
	else {
		_wrs_int_window_opened = _wrs_isNewElement = true;
		_wrs_int_temporalIframe = iframe;
		_wrs_int_window = window.open(_wrs_conf_CASPath, 'WIRISCAS', _wrs_conf_CASAttributes);
	}
}

/**
 * Handles a double click on the iframe.
 * @param object iframe Target
 * @param object element Element double clicked
 */
function wrs_int_doubleClickHandler(iframe, element) {
	if (element.nodeName.toLowerCase() == 'img') {
		if (wrs_containsClass(element, 'Wirisformula')) {
			if (!_wrs_int_window_opened) {
				_wrs_temporalImage = element;
				wrs_int_openExistingFormulaEditor(iframe);
			}
			else {
				_wrs_int_window.focus();
			}
		}
		else if (wrs_containsClass(element, 'Wiriscas')) {
			if (!_wrs_int_window_opened) {
				_wrs_temporalImage = element;
				wrs_int_openExistingCAS(iframe);
			}
			else {
				_wrs_int_window.focus();
			}
		}
	}
}

/**
 * Opens formula editor to edit an existing formula.
 * @param object iframe Target
 */
function wrs_int_openExistingFormulaEditor(iframe) {
	_wrs_int_window_opened = true;
	_wrs_isNewElement = false;
	_wrs_int_temporalIframe = iframe;
	_wrs_int_window = window.open(_wrs_conf_editorPath, 'WIRISFormulaEditor', _wrs_conf_editorAttributes);
}

/**
 * Opens CAS to edit an existing formula.
 * @param object iframe Target
 */
function wrs_int_openExistingCAS(iframe) {
	_wrs_int_window_opened = true;
	_wrs_isNewElement = false;
	_wrs_int_temporalIframe = iframe;
	_wrs_int_window = window.open(_wrs_conf_CASPath, 'WIRISCAS', _wrs_conf_CASAttributes);
}

/**
 * Handles a mouse down event on the iframe.
 * @param object iframe Target
 * @param object element Element mouse downed
 */
function wrs_int_mousedownHandler(iframe, element) {
	if (element.nodeName.toLowerCase() == 'img') {
		if (wrs_containsClass(element, 'Wirisformula') || wrs_containsClass(element, 'Wiriscas')) {
			_wrs_int_temporalImageResizing = element;
		}
	}
}

/**
 * Handles a mouse up event on the iframe.
 */
function wrs_int_mouseupHandler() {
	if (_wrs_int_temporalImageResizing) {
		setTimeout(function () {
			_wrs_int_temporalImageResizing.removeAttribute('style');
			_wrs_int_temporalImageResizing.removeAttribute('width');
			_wrs_int_temporalImageResizing.removeAttribute('height');
		}, 10);
	}
}

/**
 * Calls wrs_updateFormula with well params.
 * @param string mathml
 */
function wrs_int_updateFormula(mathml) {
	wrs_updateFormula(_wrs_int_temporalIframe, mathml);
}

/**
 * Calls wrs_updateCAS with well params.
 * @param string appletCode
 * @param string image
 * @param int width
 * @param int height
 */
function wrs_int_updateCAS(appletCode, image, width, height) {
	wrs_updateCAS(_wrs_int_temporalIframe, appletCode, image, width, height);
}

/**
 * Handles window closing.
 */
function wrs_int_notifyWindowClosed() {
	_wrs_int_window_opened = false;
}