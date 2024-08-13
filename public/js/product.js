// Function to open the delete confirmation modal with product details
function DeleteModalTrigger(productId, productName) {
  document.getElementById('productToDelete').textContent = productName;
  document.getElementById('productToDeleteID').value = productId;
  $('#deleteConfirmationModal').modal('show');
}


// Add event listener for all product switches
document.addEventListener('change', async (event) => {
  if (event.target.classList.contains('product-switch')) {
    const productId = event.target.dataset.id; // Get the product ID from the data-id attribute
    const newStatus = event.target.checked; // Get the new status from the checked property of the switch

    try {
      // Disable the switch element and add a class to set opacity to the parent label element
      event.target.disabled = true;
      const labelElement = event.target.closest('label');
      labelElement.classList.add('disabled-opacity');

      console.log("labelElement.classList:: " + labelElement.classList)

      // Send a POST request to update the product status
      const response = await fetch('/manager/product/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: productId, status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      // Update the product status on the frontend if the request is successful
      const productRow = event.target.closest('tr');
      productRow.querySelector('.checkmark').style.display = newStatus ? 'block' : 'none'; // Show/hide the checkmark span based on the new status

      // Show toast notification
      const toast = new bootstrap.Toast(document.querySelector('.toast'));
       $('#toastBody').text("Product updated successfully");
      toast.show();

      // Re-enable the switch element after 8 seconds and remove the opacity class
      setTimeout(() => {
        labelElement.classList.remove('disabled-opacity');
        event.target.disabled = false;

      }, 5000);
    } catch (error) {
      console.error('Error updating product status:', error);
      event.target.disabled = false;
      // Re-enable the switch element and remove the opacity class in case of error
      labelElement.classList.remove('disabled-opacity');
    }
  }
});


