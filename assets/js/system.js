/* Visualization functions */
var eventGuideOffered = false;
var eventGuideAccepted = false;

guideTexts = {
  A: 'To get the sum of two numbers, use the <span class=\'code-text\'>+</span> operator. You can assign the result to a variable using the <span class=\'code-text\'>=</span> operator.',
  B: 'Use the <span class=\'code-text\'>return</span> keyword to return a value or a variable.'
};
expandNode = function(event) {
  var target = guideTexts[event];
  $('#div-visualization-text-panel p').html(target);
}

sessionId = data_sessionId;
testEnabled = true;
submitEnabled = true;

function flushLog() {
  var toSend = sessionLog.splice(0, sessionLog.length);
  $.ajax({
    url: data_baseUrl + 'services/log',
    data: {log_data: toSend, session_id: sessionId},
    type: 'POST',
    success: function(data) {
      //console.log('Data logged');
    },
    error: function(data) {
      //console.log('Error occurred');
    }
  })
}

function initSession() {
  sessionLog = [{type: 'start', timestamp: Date.now()}];
  flushLog();
  setInterval(function() {
    flushLog();
  }, 2000);
}

function clearTestOutput() {
  $('#div-console-panel').css('display', 'none');
  $('#div-console-panel').removeClass(['success', 'error', 'failure']);
  for (var i = 0; i < editor.lineCount(); i++) {
    editor.removeLineClass(i, 'background', 'line-error');
  }
}

function triggerRun(type) {
  testEnabled = false;
  submitEnabled = false;
  $('#test-button').addClass('disabled');
  $('#submit-button').addClass('disabled');
  if (type == 'test') $('#test-loading-icon').css('visibility', 'visible');
  else $('#submit-loading-icon').css('visibility', 'visible');
}

function endRun(type) {
  testEnabled = true;
  submitEnabled = true;
  $('#test-button').removeClass('disabled');
  $('#submit-button').removeClass('disabled');
  if (type == 'test') $('#test-loading-icon').css('visibility', 'hidden');
  else $('#submit-loading-icon').css('visibility', 'hidden');
}

function triggerPassed() {
  $('#div-nav').css('display', 'block');
  $('#submission-modal-image').attr('src', data_baseUrl + 'images/circle.png');
  $('#submission-modal-text').text('Congratulations! Your code is correct.');
  $('#submission-modal').foundation('open');
  $('#solved-callout').css('display', 'block');
}

function triggerFailed() {
  $('#div-nav').css('display', 'none');
  $('#submission-modal-image').attr('src', data_baseUrl + 'images/x.png');
  $('#submission-modal-text').text('Your code is wrong. Please try again. ');
  $('#submission-modal').foundation('open');
}

function logEditorChangeToHistory(timestamp, changeObj) {
  sessionLog.push({type: "document", timestamp: timestamp, changeObj: changeObj});
  if (sessionLog.length > 50) {
    flushLog();
  }
}

function offerGuide() {
  if (eventGuideOffered) return;
  eventGuideOffered = true;
  $('#div-guide-panel').slideDown(175);
}

function displayVisualization() {
  if (eventGuideAccepted) return;
  eventGuideAccepted = true;
  $('#div-guide-panel').hide();
  $('#div-visualization-panel').css('visibility', 'visible');
  $('#div-visualization-text-panel').css('visibility', 'visible');
}

var editor = CodeMirror(document.getElementById('editor'), {
  mode: 'text/x-java',
  lineNumbers: true,
  theme: 'base16-light'
});

editor.on('change', function(instance, changeObj) {
  var timestamp = Date.now();
  logEditorChangeToHistory(timestamp, changeObj);
  clearTestOutput();
});

function initializeSystem() {
  $('.test-input-field').focus(function() {
    $(this).select();
  });

  $('.test-input-field').on('input propertychange paste', function() {
    clearTestOutput();
  });

  $('#test-button').click(function() {
    if (!testEnabled) return;
    clearTestOutput();
    triggerRun('test');
    var editorValue = editor.getValue();
    var testValues = [];
    $('#div-test-panel').find('.test-input-field').each(function() {
      testValues.push($(this).val());
    });
    $.ajax({
      url: data_baseUrl + 'services/test',
      type: 'post',
      data: {
        problem_id: data_problemId,
        user_id: data_userId,
        code: editorValue,
        test_case: testValues
      },
      dataType: 'json',
      success: function(data) {
        endRun('test');
        $('#div-console-panel').css('display', 'block');
        if (data.type == 'no_error') {
          $('#div-console-panel').addClass('success');
          $('#test-status-text').html('Function returned: <span id=\'test-return-value\'>' + data.message + '</span>');
        }
        else if (data.type == 'no_output') {
          $('#div-console-panel').addClass('error');
          $('#test-status-text').html('Function did not return any value (possible infinite loop).');
        }
        else if (data.type == 'failed') {
          $('#div-console-panel').addClass('failure');
          $('#test-status-text').html('Failed to run code. Please try again.');
        }
        else if (data.type == 'error') {
          $('#div-console-panel').addClass('error');
          var lineNumber = data.lineNumber - data.offset - 1;
          editor.addLineClass(lineNumber, 'background', 'line-error');
          $('#test-status-text').html('<span id=\'test-return-value\'>' + data.message.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/' '/g, '&nbsp') + '</span>');
        }
      },
      error: function() {
        endRun('test');
        $('#div-console-panel').addClass('failure');
        $('#test-status-text').css('visibility', 'visible');
        $('#test-status-text').html('Failed to run code. Please try again.');
      }
    });
  });

  $('#submit-button').click(function() {
    if (!submitEnabled) return;
    triggerRun('submit');
    var editorValue = editor.getValue();
    $.ajax({
      url: data_baseUrl + 'services/submit',
      type: 'post',
      data: {
        problem_id: data_problemId,
        user_id: data_userId,
        code: editorValue
      },
      dataType: 'json',
      success: function(data) {
        endRun('submit');
        if (data.type == 'passed') triggerPassed();
        else triggerFailed();
      },
      error: function(data) {
        console.log('error');
        endRun('submit');
        triggerFailed();
      }
    });
  });

  $('#guide-accept-button').on('click', function() {
    displayVisualization();
  });

  $('#guide-deny-button').on('click', function() {
    $('#div-guide-panel').css('display', 'none');
    eventGuideOffered = false;
  });

  mermaid.initialize({startOnLoad:true});
  initSession();
}
