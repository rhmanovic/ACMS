document.addEventListener('DOMContentLoaded', function() {
  const quills = [
    { editor: '#editor32', toolbar: '#toolbar-container32', hiddenInput: '#hiddenDescriptionAr' },
    { editor: '#editor33', toolbar: '#toolbar-container33', hiddenInput: '#hiddenDescriptionEn' }
  ];

  quills.forEach(({ editor, toolbar, hiddenInput }) => {
    const quill = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: toolbar
      }
    });

    quill.clipboard.dangerouslyPasteHTML(document.querySelector(hiddenInput).value);

    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      document.querySelector(hiddenInput).value = quill.root.innerHTML;
    });
  });
});
