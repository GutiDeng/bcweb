// bcweb.dom
;(function(bcweb){
  var dom = Object()
  
  dom.Element = function(tagName) {
    
    // make sure a DOM element is available at `this.element'
    if (tagName instanceof window.Element) {
      // to use the given DOM element instead of creating a new one
      this.element = tagName
    } else {
      this.element = document.createElement(tagName)
    }
    this.element.bcwebDomElement = this
    
    this.eventHandlers = {}
    
    this.children = []
    
  }
  
  dom.Element.prototype = {
    propagate: function() {
      var eventName = arguments[0]
      var alteredArguments = arguments
      if (eventName in this.eventHandlers) {
        var result = this.trigger.apply(this, arguments)
        if (result === undefined) {
        } else if (result === null) {
          return
        } else {
          alteredArguments = result
        }
      }
      for (var i in this.children) {
        this.children[i].propagate.apply(this.children[i], alteredArguments)
      }
    },
    registerEventHandler: function(eventName, func) {
      this.eventHandlers[eventName] = func
    },
    trigger: function(eventName) {
      var func = undefined
      if (eventName in this.eventHandlers) {
        func = this.eventHandlers[eventName]
      } else {
        var funcName = 'defaultEventHandlerFor' + eventName
        if (funcName in this) {
          func = this[funcName]
        }
      }
      if (func) {
        return func.apply(this, arguments)
      }
    },
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

