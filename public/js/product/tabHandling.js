document.addEventListener('DOMContentLoaded', function() {
  const activateTabAndPane = (tabId) => {
    const targetId = tabId.replace('-tab', '');
    document.querySelectorAll('.theTab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));

    document.getElementById(tabId).classList.add('active');
    document.getElementById(targetId).classList.add('show', 'active');
  };

  document.querySelectorAll('.theTab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.id;
      history.pushState(null, null, `#${tabId.replace('-tab', '')}`);
      activateTabAndPane(tabId);
    });
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) activateTabAndPane(`${initialHash}-tab`);
});
