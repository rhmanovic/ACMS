$(document).ready(function(){
  // Initialize the toast with automatic hide delay
  $('.toast').toast({
    delay: 5000 // Toast is displayed for 5 seconds
  });

  // Toggle form and span visibility on span click
  $('.clickable').click(function(event){
    event.stopPropagation();  // Prevent event from bubbling up to the document level
    var $clickedSpan = $(this);

    // Hide any visible forms and show their corresponding spans
    $('.update-price-form:visible, .update-stock-form:visible').each(function(){
      $(this).hide();  // Hide the form
      $(this).prev('span').show();  // Show the span
    });

    // Show the form related to the clicked span
    $clickedSpan.hide();  // Hide the clicked span
    $clickedSpan.next('form').show();  // Show the next form
  });

  // Handle form submissions for price and stock updates
  $('.update-price-form, .update-stock-form').submit(function(event){
    event.preventDefault();
    var form = $(this);
    var displaySpan = form.prev('span');
    
    var spinner1 = form.parent().find('.spinner1'); // select the spinner element under the same parent
    var pricespan = form.parent().find('.price-span'); // select the spinner element under the same parent
      

    $.ajax({
      url: form.attr('action'), // Dynamically get the form action attribute
      type: 'POST',
      data: form.serialize(),
      success: function(data){
        if (data.message === 'Product updated successfully') {
          // Show the spinner
          spinner1.css('display', 'inline-block');
          pricespan.hide();

          // Use setTimeout to delay the next actions for 1 second
          setTimeout(() => {
              // Hide the spinner
              spinner1.hide();
              displaySpan.show(); // Show the span again

              // Update the text of the span element based on the form's data type and received data
              displaySpan.text(`${form.data('type') === 'sale_price' ? '' : ''}${data.updatedValue}`);
             

              // Set the message in the toast body and show the toast
              $('#toastBody').text(data.message);
              $('.toast').toast('show');
          }, 1200); // Delay of 1 second
            
        } else {
          alert(`Error: ${data.message}`);
        }
        form.hide(); // Hide the form after update
        // displaySpan.show(); // Show the span again
        
      }
    });
  });

  // Hide form and show span when clicking anywhere else on the page
  $(document).click(function(event) {
    if (!$(event.target).closest('form, .clickable').length) {
      $('.form1').hide();  // Hide all forms
      $('.clickable').show();  // Show all spans
    }
  });

  // Prevent the form click from propagating to the document
  $('form').click(function(event) {
    event.stopPropagation();
  });
});
