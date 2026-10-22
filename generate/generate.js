(function () {
  var KEY = 'genSelection';
  var boxes = {
    theme: document.getElementById('gen-theme'),
    idea: document.getElementById('gen-idea'),
    palette: document.getElementById('gen-palette')
  };

  document.getElementById('gen-start').addEventListener('click', function (e) {
    var selection = {
      theme: boxes.theme.checked,
      idea: boxes.idea.checked,
      palette: boxes.palette.checked
    };
    if (!selection.theme && !selection.idea && !selection.palette) {
      e.preventDefault();
      return;
    }
    try { sessionStorage.setItem(KEY, JSON.stringify(selection)); } catch (err) {}
  });
})();
