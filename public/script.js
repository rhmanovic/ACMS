document.querySelector('span.nav-item.nav-link.mt-1').addEventListener('click', function() {
  console.log('Collapse button clicked');
  sidebar.classList.toggle('collapsed');
  if (sidebar.classList.contains('collapsed')) {
    sidebar.style.width = '0';
    sidebar.style.padding = '0';
    sidebar.style.border = 'none';
  } else {
    sidebar.style.width = '18rem';
    sidebar.style.padding = '';
    sidebar.style.border = '';
  }
});