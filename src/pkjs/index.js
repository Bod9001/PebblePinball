Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready');
});

Pebble.addEventListener('showConfiguration', function() {
  Pebble.openURL('local://configuration/index.html');
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response == null || e.response === '') return;
  console.log('webviewclosed');
  const configString = decodeURIComponent(e.response);
  console.log('configString', configString);
  Pebble.sendAppMessage(
    { layoutConfig: configString },
    function() { console.log('Send success'); },
    function(e) { console.log('Send failed: ' + e); }
  );
});