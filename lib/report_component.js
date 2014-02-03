var ReportComponent = (function() {

  function ReportComponent() {}

  ReportComponent.prototype.process = function() {};

  ReportComponent.prototype.traverse = function(object, visitor, prev) {
    var child, key;
    if (visitor.call(null, object, prev) === false) return;
    for (key in object) {
      if (!object.hasOwnProperty(key)) continue;
      child = object[key];
      if (typeof child === "object" && (child != null)) {
        this.traverse(child, visitor, object);
      }
    }
  };

  return ReportComponent;

})();

exports.ReportComponent = ReportComponent;

