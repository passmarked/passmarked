/**
* snippet object to return
**/
SnippetManager = {}

/**
* returns the start line for the code snippet
**/
SnippetManager.getStart = function(lines, line, context) {

  var startLine = line - context - 1;
  if(startLine < 0) startLine = 0;
  return startLine;

};

/**
* returns the start line for the code snippet
**/
SnippetManager.getEnd = function(lines, line, context) {

  var endLine = line + context;
  if(endLine > lines) endLine = lines;
  return endLine;

};

/**
* returns the new array segment that we have available
**/
SnippetManager.slice = function(lines, start, end) {

  // parse out our slices
  try {
    return lines.slice(start, end);
  } catch (err) {
    return [];
  }

};

/**
* Get the lines in a document
**/
SnippetManager.getLines = function(content) { return (content || '').split('\n'); }

/**
* returns a piece of content
**/
SnippetManager.findLine = function(lines, last_current_line, criteria) {

  // handle the index
  var current_index = 0;

  // loop them
  for(var i = 0; i < lines.length; i++) {

    // local reference
    var line = (lines[i] || '').toLowerCase();

    // should not be blank
    if(!line) continue;
    if(i <= last_current_line) continue;

    // check the type
    if(typeof criteria == 'function' && 
        criteria(line) === true) return i;

    // check if we get the index ?
    if(line.indexOf( criteria ) != -1)
      return i;

  }

  // done
  return -1;

};

/**
* returns a piece of content
**/
SnippetManager.build = function(lines, last_current_line, criteria) {

  // handle the index
  var lineCurrent = SnippetManager.findLine(
    
    lines, 
    last_current_line, 
    criteria

  );

  // did we find a line here ...
  if(lineCurrent <= -1) return null;

  // handle the item
  var lineStart   = SnippetManager.getStart(lines.length, lineCurrent, 3);
  var lineEnd     = SnippetManager.getEnd(lines.length, lineCurrent, 3);
  var codeStrs    = SnippetManager.slice(lines, lineStart, lineEnd);

  // returns the block
  return {

    start: lineStart,
    end: lineEnd,
    subject: lineCurrent,
    text: codeStrs

  };

};

// expose it
module.exports = exports = SnippetManager
