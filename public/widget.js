(function() {
  var container = document.getElementById('trustflow-widget');
  if (!container) {
    console.error('TrustFlow Widget: Could not find element with id "trustflow-widget".');
    return;
  }

  var spaceId = container.getAttribute('data-space');
  if (!spaceId) {
    console.error('TrustFlow Widget: Missing "data-space" attribute on container.');
    return;
  }
  
  // Find the host url from the script tag
  var scripts = document.getElementsByTagName('script');
  var scriptUrl = '';
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) {
      scriptUrl = scripts[i].src;
      break;
    }
  }
  
  var origin = '';
  try {
    var url = new URL(scriptUrl);
    origin = url.origin;
  } catch (e) {
    // Fallback if parsing fails (e.g. testing locally)
    origin = 'http://localhost:3000';
  }
  
  var iframe = document.createElement('iframe');
  iframe.src = origin + '/w/' + spaceId;
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.minHeight = '600px';
  iframe.title = 'TrustFlow Testimonial Widget';
  
  container.appendChild(iframe);
})();
