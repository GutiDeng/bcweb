// bcweb.viewport
;(function(bcweb){
  var viewport = bcweb.viewport = Object()
  
  // a dict holds all stylesheets
  viewport.cssRefs = {}
  
  // get a stylesheet by name or create a new one if it doesn't exist
  viewport.getCSS = function(cssName) {
    if (cssName in this.cssRefs) {
      return this.cssRefs[cssName]
    } else {
      var css = new bcweb.dom.Element('style')
      this.cssRefs[cssName] = css
      document.head.appendChild(css)
    }
  }
  viewport.insertCSSRule = function(cssName, ruleText) {
    this.getCSS(cssName).insertRule(ruleText)
  }
  
  viewport.prepare = function() {
    var documentBody = new bcweb.dom.Element(document.body).setStyle({
      'margin': '0',
      'padding': '0',
      'font-family': '"Helvetica Neue",Helvetica,Arial,sans-serif'
    })
    this.documentBody = documentBody
    
    // create a div as the container of the app
    this.appContainer = new bcweb.dom.Element('div').setStyle({
      'position': 'absolute',
      'margin': '0',
      'padding': '0',
      'width': '100%',
      'height': '100%',
      'background': 'gray',
      'overflow': 'auto'
    }).appendTo(this.documentBody)
    
    // store the dimensions
    this.dimensions = {
      appContainerWidth: this.appContainer.getWidth(),
      appContainerHeight: this.appContainer.getHeight(),
      screenWidth: screen.width,
      screenHeight: screen.height
    }
    
    window.onresize = function() {
      documentBody.propagate('Resize')
    }
    
    console.log(this.dimensions)
  }
  
})(window.bcweb)

