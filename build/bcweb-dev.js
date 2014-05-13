// bcweb.core
window.bcweb = Object()

// bcweb.dom
;(function(bcweb){
  var dom = Object()
  
  dom.Element = function(tagName) {
    if (tagName instanceof window.Element) {
      this.element = tagName
    } else {
      this.element = document.createElement(tagName)
    }
    this.element.bcwebDomElement = this
  }
  
  dom.Element.prototype = {
    getStyle: function(k) {
      return window.getComputedStyle(this.element)[k]
    },
    setStyle: function(obj) {
      for (var k in obj) {
        var v = obj[k]
        if (v === undefined) {
          this.element.style.removeProperty(k)
        } else {
          this.element.style.setProperty(k, v)
        }
      }
      return this
    },
    hide: function() {
      var display = this.getStyle('display')
      this._display = display
      this.setStyle({'display': 'none'})
      this.onHide()
      return this
    },
    onHide: function() {
    },
    show: function() {
      if (this._display) {
        this.setStyle({'display': this._display})
      } else {
        this.setStyle({'display': undefined})
      }
      this.onShow()
      return this
    },
    fadeout: function(time) {
      this.setStyle({
        'transition': 'opacity ' + time + 's',
        'opacity': '0',
      })
      var _this = this
      window.setTimeout(function() {
        _this.setStyle({
          'display': 'none',
        })
      }, time*1000)
      return this
    },
    fadein: function(time) {
      this.setStyle({'display': undefined})
      this.setStyle({
        'transition': 'opacity ' + time + 's',
        'opacity': '1',
      })
      return this
    },
    onShow: function() {
    },
    toggleHideShow: function() {
      this.getStyle('display') === 'none' ? this.show() : this.hide()
    },
    getWidth: function() {
      return this.element.getBoundingClientRect().width
    },
    getHeight: function() {
      return this.element.getBoundingClientRect().height
    },
    getZIndex: function() {
      return window.getComputedStyle(this.element)['z-index']
    },
    getAttr: function(k) {
      if (k === 'value') {
        return this.element.value
      } else {
        return this.element.getAttribute(k)
      }
    },
    setAttr: function(obj) {
      for (var k in obj) {
        var v = obj[k]
        if (v === undefined) {
          if (k === 'value') {
          } else {
            this.element.removeAttribute(k)
          }
        } else {
          if (k === 'value') {
            this.element.value = v
          } else {
            this.element.setAttribute(k, v)
          }
        }
      }
      return this
    },
    setHTML: function(html) {
      this.element.innerHTML = html
      return this
    },
    append: function(child) {
      this.element.appendChild(child.element)
      if (this.children === undefined) {
        this.children = []
      }
      this.children.push(child)
      return this
    },
    appendTo: function(parentElement) {
      parentElement.append(this)
      return this
    },
    empty: function() {
      this.element.innerHTML = ''
      return this
    },
    remove: function() {
      if (this.element.parentNode != null)
        this.element.parentNode.removeChild(this.element)
      return this
    },
    
    getChildren: function() {
      if (this.children === undefined) {
        return []
      }
      return this.children
    },
    
    
    offClick: function() {
      if (!this.bcwebOnClickHandler) {
        return
      }
      this.setStyle({
        'cursor': undefined
      })
      this.bcwebOnClickHandler = undefined
      this.element.removeEventListener('touchstart', this.bcwebTouchStartHandler)
      this.element.removeEventListener('touchend', this.bcwebTouchEndHandler)
      this.element.removeEventListener('mouseup', this.bcwebMouseUpHandler)
      this.element.removeEventListener('mousedown', this.bcwebMouseDownHandler)
      return this
    },
    onClick: function(handler) {
      /*
      if (this.bcwebOnClickHandler) {
        this.offClick()
        this.onClick(handler)
      }
      */
      this.setStyle({
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        'cursor': 'pointer'
      })
      this.bcwebOnClickHandler = handler
      
      this.bcwebMouseDownHandler = function(e) {
        if (this.bcwebOnClickEventType && this.bcwebOnClickEventType == 'touch') {
          return
        }
        //e.preventDefault()
        //e.stopPropagation()
      }
      this.element.addEventListener('mousedown', this.bcwebMouseDownHandler)
        
      this.bcwebMouseUpHandler = function(e) {
        if (this.bcwebDomElement.bcwebOnClickEventType && this.bcwebDomElement.bcwebOnClickEventType == 'touch') {
          return
        }
        var caught = this.bcwebDomElement.bcwebOnClickHandler.call(this.bcwebDomElement, e)
        if (caught) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
      this.element.addEventListener('mouseup', this.bcwebMouseUpHandler)
      
      this.bcwebTouchStartHandler = function(e) {
        this.bcwebDomElement.bcwebOnClickEventType = 'touch'
        this.bcwebDomElement.bcwebOnClickStartX = e.changedTouches[0].clientX
        this.bcwebDomElement.bcwebOnClickStartY = e.changedTouches[0].clientY
        this.bcwebDomElement.bcwebOnClickStartT = (new Date()).getTime()
      }
      this.element.addEventListener('touchstart', this.bcwebTouchStartHandler)
      
      this.bcwebTouchEndHandler = function(e) {
        var x = e.changedTouches[0].clientX
        var y = e.changedTouches[0].clientY
        var t = (new Date()).getTime()
        
        if (Math.abs(x - this.bcwebDomElement.bcwebOnClickStartX) > 5) {
          return
        }
        if (Math.abs(y - this.bcwebDomElement.bcwebOnClickStartY) > 5) {
          return
        }
        if (Math.abs(t - this.bcwebDomElement.bcwebOnClickStartT) > 300) {
          return
        }
        
        var caught = this.bcwebDomElement.bcwebOnClickHandler.call(this.bcwebDomElement, e)
        if (caught) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
      this.element.addEventListener('touchend', this.bcwebTouchEndHandler)
      
      return this
    },
    on: function(eventType, handler) {
      this.element.addEventListener(eventType, function(e) {
        handler.call(this.bcwebDomElement, e)
      })
      return this
    }
  }
  
  bcweb.dom = dom
})(window.bcweb)

// bcweb.loader
;(function(_){
  var ScriptLoader = function() {
    this.pathPrefix = '/static/main'
    this.successfulLoads = {}
    this.callbacks = {}
  }
  ScriptLoader.prototype = {
    // dynamic load with callback
    loadScript: function(name, path, callback) {
      if (this.successfulLoads[name]) {
        return
      }
      
      var path = this.makePath(path)
      
      this.callbacks[name] = callback
      
      var script = document.createElement('script')
      script.src = path
      document.body.appendChild(script)
    },

    // loaded scripts call this method to invoke callback
    afterLoad: function(name) {
      this.successfulLoads[name] = true
      this.callbacks[name] && this.callbacks[name]()
    },
    
    // client codes can set pathPrefix to address their layouts
    makePath: function(path) {
      var p = this.pathPrefix.slice(-1) == '/' || path.slice(0, 1) == '/' ?
        this.pathPrefix + path :
        this.pathPrefix + '/' + path
      
      if (p.slice(-3) != '.js')
        p = p + '.js'
      
      return p
    }
  }
  
  _.loader = new ScriptLoader()
})(bcweb)

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
    this.documentBody = new bcweb.dom.Element(document.body).setStyle({
      'margin': '0',
      'padding': '0',
      'font-family': '"Helvetica Neue",Helvetica,Arial,sans-serif'
    })
    
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
    console.log(this.dimensions)
  }
  
})(window.bcweb)

// bcweb.group
;(function(_){
  var group = Object()
  
  var Group = function() {
    this.members = []
    this.memberMappings = {}
  }
  Group.prototype = {
    append: function(ele, name) {
      this.members.push(ele)
      if (name) {
        this.memberMappings[name] = ele
      }
    },
    get: function(name) {
      if (name in this.memberMappings) {
        return this.memberMappings[name]
      }
    },
    activate: function(name) {
      for (var k in this.memberMappings) {
        var member = this.memberMappings[k]
        if (k == name) {
          member.bcwebGroupOnActivate()
        } else {
          member.bcwebGroupOnDeactivate()
        }
      }
    }
  }
  group.Group = Group 
  
  _.group = group 
})(bcweb)

// bcweb.app
;(function(_){
  var app = Object()
  
  app.colors = {}
  app.getColor = function(name) {
    if (name in this.colors) {
      return this.colors[name]
    } else {
      return '#000000'
    }
  }
  app.putColor = function(name, value) {
    if (value) {
      this.colors[name] = value
    } else {
      // first argument will be a dictionary
      var dict = name
      for (var k in dict) {
        this.colors[k] = dict[k]
      }
    }
  }
  _.app = app
})(bcweb)

// bcweb.ua
;(function(_){
  var ua = Object()
  
  ua.touchable = true
  //ua.touchable = jQuery.os.phone || jQuery.os.tablet ? true : false
  
  _.ua = ua
})(bcweb)

// bcweb.ui
;(function(_){
  var ui = Object()
  
  var RollingView = function(cfg) {
    var cfg = cfg || {}
    cfg.pagePctWidth = cfg.pagePctWidth || 60
    this.cfg = cfg
    
    this.container = undefined
    this.pages = new Array()
    this.coverLayers = new Array()
    this.contentLayers = new Array()
    
    this.activeIndex = 0
    this.offsets = []
    this.zindexes = []
    this.covers = []
  }
  RollingView.prototype = {
    setContainer: function(container) {
      container.setStyle({
        'overflow': 'hidden'
      })
      this.container = container
      return this
    },
    addCoverLayer: function(page) {
      var layer = new bcweb.dom.Element('div').setStyle({
        'position': 'absolute',
        'width': '100%',
        'height': '100%'
      }).appendTo(page)
      this.coverLayers.push(layer)
      return layer
    },
    addContentLayer: function(page) {
      var layer = new bcweb.dom.Element('div').setStyle({
        'overflow': 'auto',
        'position': 'absolute',
        'width': '100%',
        'height': '100%'
      }).appendTo(page)
      this.contentLayers.push(layer)
      return layer
    },
    addPage: function() {
      var page = new bcweb.dom.Element('div').setStyle({
        'background': 'white',
        'position': 'absolute',
        'width': this.cfg.pagePctWidth + '%',
        'height': this.containerHeight() + 'px'
      }).appendTo(this.container)
      this.pages.push(page)
      var coverLayer = this.addCoverLayer(page)
      var contentLayer = this.addContentLayer(page)
      return contentLayer
    },
    containerWidth: function() {
      return this.container.getWidth()
    },
    containerHeight: function() {
      return this.container.getHeight()
    },
    calculateOffsets: function() {
      this.offsets = new Array(this.pages.length)
      var containerWidth = this.containerWidth()
      var pageWidthRatio = this.cfg.pagePctWidth / 100
      var pageWidth = containerWidth * pageWidthRatio
      
      var step = (containerWidth - pageWidth) / (this.pages.length - 1)
      for (var i = 0; i < this.pages.length; i++) {
        this.offsets[i] = step * i
      }
    },
    applyOffsets: function() {
      for (var i = 0; i < this.pages.length; i++) {
        this.pages[i].setStyle({
          'left': this.offsets[i] + 'px'
        })
      }
    },
    calculateZIndexes: function() {
      var containerZIndex = this.container.getZIndex()
      for (var i = 0; i < this.pages.length; i++) {
        this.zindexes[i] = containerZIndex - Math.abs(this.activeIndex - i)
      }
    },
    applyZIndexes: function() {
      for (var i = 0; i < this.pages.length; i++) {
        this.pages[i].setStyle({
          'z-index': this.zindexes[i]
        })
      }
    },
    calculateCovers: function() {
      for (var i = 0; i < this.pages.length; i++) {
        if (i == this.activeIndex) {
          this.covers[i] = [undefined, undefined]
        } else {
          this.covers[i] = ['#000000', 0.4 + 0.1 * Math.abs(i - this.activeIndex)]
        }
      }
    },
    applyCovers: function() {
      for (var i = 0; i < this.pages.length; i++) {
        var background = this.covers[i][0], opacity = this.covers[i][1]
        this.coverLayers[i].setStyle({
          'background': background,
          'opacity': opacity
        })
      }
    },
    ensureClickHandlings: function() {
      var _ = this
      var handler = function(e) {
        _.activatePageByIndex(this.bcwebRollingViewIndex)
      }
      for (var i = 0; i < this.pages.length; i++) {
        this.pages[i].bcwebRollingViewIndex = i
        if (this.activeIndex == i) {
          this.pages[i].offClick()
        } else {
          this.pages[i].onClick(handler)
        }
      }
    },
    render: function() {
      this.calculateOffsets()
      this.applyOffsets()
      this.calculateZIndexes()
      this.applyZIndexes()
      this.calculateCovers()
      this.applyCovers()
      this.ensureClickHandlings()
    },
    activatePageByIndex: function(index) {
      if (index >= this.pages.length || index < 0 || index === undefined) {
        return
      }
      this.activeIndex = index
      this.render()
    },
    activatePageNext: function() {
      this.activatePageByIndex(this.activeIndex + 1)
    },
    activatePagePrevious: function() {
      this.activatePageByIndex(this.activeIndex - 1)
    }
  }
  ui.RollingView = RollingView
  
  _.ui = ui
})(bcweb)

// bcweb.cookie
;(function(_){
  var cookie = Object()
  
  cookie.set = function (name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();
    } else {
      var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }
  cookie.get = function getCookie(c_name) {
    if (document.cookie.length > 0) {
      c_start = document.cookie.indexOf(c_name + "=");
      if (c_start != -1) {
        c_start = c_start + c_name.length + 1;
        c_end = document.cookie.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = document.cookie.length;
        }
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return "";
  }
  
  _.cookie = cookie
})(bcweb)

// bcweb.ajax
;(function(bcweb){
  var ajax = Object()
  var emptyFunction = function() {}
  
  var cfgDefault = {
    method: 'GET',
    url: '',
    query: {},
    data: undefined,
    parseAs: 'JSON',
    callback: undefined,
    callbackOnError: undefined
  }
  
  ajax.go = function(cfg) {
    for (var k in cfgDefault) {
      if (! (k in cfg)) {
        cfg[k] = cfgDefault[k]
      }
    }
    
    cfg.requestURI = encodeURI(cfg.url)
    if (cfg.query) {
      var uri = cfg.url + '?'
      for (var k in cfg.query) {
        uri += encodeURIComponent(k) + '=' + encodeURIComponent(cfg.query[k]) + '&'
      }
      cfg.requestURI = uri
    }
    
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = ajax.emptyFunction;
        
        var responseParsed, error
        
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
          try {
            if (cfg.parseAs == 'JSON') {
              responseParsed = JSON.parse(xhr.responseText)
            }
          } catch (e) { error = e }
          
          if (error) {
            cfg.callbackOnError && cfg.callbackOnError.call(null, 'parse', cfg, xhr)
          }
          else {
            cfg.callback && cfg.callback.call(null, responseParsed, cfg, xhr)
          }
        } else {
          cfg.callbackOnError && cfg.callbackOnError.call(null, 'status', cfg, xhr)
        }
      }
    }
    xhr.open(cfg.method, cfg.requestURI, true)
    cfg.data && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(cfg.data || null)
  }
  
  bcweb.ajax = ajax
})(bcweb)

