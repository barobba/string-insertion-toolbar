// 
// Keyboard Toolbar
// 
// <div class="mytoolbar">
//   <div class="content"></div>
//   <script class="button-template" type="text/x-template">
//     <span title="@REPLACE">@DISPLAY</span>
//   </script>
//   <script class="data" type="text/javascript">
//     kbChars = [{"title":"Upper case","characters":["\u00c1","A\u019e","C\u0304","\u010a","\u00c9","\u0120","\u1e22","\u00cd","I\u019e","K\u0304","K\u0307","\u00d3","P\u0304","\u1e56","\u1e60","T\u0304","\u1e6a","\u00da","U\u019e"]},{"title":"Lower case","characters":["\u00e1","a\u019e","c\u0304","\u010b","\u00e9","\u0121","\u1e23","\u00ed","i\u019e","k\u0304","k\u0307","\u00f3","p\u0304","\u1e57","\u1e61","t\u0304","\u1e6b","\u00fa","u\u019e"]}];
//   </script>
// </div>
//

function kbToolbar(toolbarSelector, toolbarData) {
  jQuery(function($){

    // Prepare selectors
    var buttonTemplateSelector = toolbarSelector + ' .button-template';
    var contentSelector = toolbarSelector + ' .widget';
    var buttonSelector = contentSelector + ' .button';

    // Build toolbar FROM TEMPLATE
    for (groupIndex in toolbarData) {
      var toolbarGroup = toolbarData[groupIndex];
      for (charIndex in toolbarGroup['characters']) {

        // Prepare button for toolbar
        var ch = toolbarGroup['characters'][charIndex];
        var buttonTemplate = $($(buttonTemplateSelector).html());
        $(buttonTemplate).attr('title', ch);
        $(buttonTemplate).html(ch);
        
        // Place button in toolbar
        $(contentSelector).append(buttonTemplate);
        
      }
    }

    // Remember the most recent text input field that was given focus
    var kbLastFocused = undefined;
    $('textarea,input[type="text"]').focus(function() {
      kbLastFocused = this;
    });

    // For IE: Cache the selection for the text input fields when they are used
    var kbLastFocusedRange = undefined;
    var kbCacheEvents = [
      'keypress', 'keyup', 'keydown', 
      'click', 'mousedown', 'mouseup'
    ];
    for (var eventIndex in kbCacheEvents) {
      var eventName = kbCacheEvents[eventIndex];
      $('textarea,input[type="text"]').bind(eventName, function(){
        if (document.selection) {
          // Cache the selection
          kbLastFocusedRange = document.selection.createRange().duplicate();
        }
      });
    }
    
    // Respond to toolbar button presses
    $(buttonSelector).click(function(){
      if (kbLastFocused != undefined) {
        var insertThis = jQuery(this).attr('title');
        if (document.selection) {
          
          // IE
          kbLastFocusedRange.text = insertThis;
          
        }
        else {
          
          // CHROME
          // Substring before selection
          var startIndex = getSelectionStart(kbLastFocused);
          var a = (startIndex > 0) ? kbLastFocused.value.substring(0, startIndex).replace(/ /g, '\xa0') || '\xa0' : '';
          // Substring after selection
          var endIndex = getSelectionEnd(kbLastFocused);
          var endOfString = kbLastFocused.value.length;
          var b = (endIndex < endOfString) ? kbLastFocused.value.substring(endIndex, endOfString).replace(/ /g, '\xa0') || '\xa0' : '';
          // New string
          kbLastFocused.value = a + insertThis + b;
          // New cursor position
          setCursorPosition(kbLastFocused, a.length + insertThis.length);

        }
      }
      else {
        // Input box undefined; do nothing
      }
    });

  });
}  

// Author: Diego Perini <dperini@nwbox.com>
// http://javascript.nwbox.com/cursor_position/
function getSelectionStart(element) {
	if (element.createTextRange) {
		var range = document.selection.createRange().duplicate();
		range.moveEnd('character', element.value.length);
		if (range.text == '') {
      return element.value.length;
    }
    else {
  		return element.value.lastIndexOf(range.text);
    }
	} else {
    return element.selectionStart
  }
}

// Author: Diego Perini <dperini@nwbox.com>
// http://javascript.nwbox.com/cursor_position/
function getSelectionEnd(element) {
	if (element.createTextRange) {
		var range = document.selection.createRange().duplicate();
		range.moveStart('character', -element.value.length);
		return range.text.length;
	} else {
    return element.selectionEnd;
  }
}

// Modified from: http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
function setCursorPosition (element, position) {
  if (element.createTextRange) {
    var range = element.createTextRange();
    range.move('character', position);
    range.select();
  }
  else {
    element.focus();
    if (element.setSelectionRange) {
      element.setSelectionRange(position, position);
    }
  }
}
