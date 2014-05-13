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

