$(document).ready(function(){
  // Function to add a new variation row
  function addVariationRow(variation) {
    var newRow = `<table class="table table-bordered table-striped table-hover mt-2">
                    <tbody>
                      <tr class="align-middle">
                        <td colspan="2">
                          <span>الاسم انجليزي</span>
                          <div>
                            <input type="text" class="form-control" name="v_name_en[]" placeholder="الاسم انجليزي" required itsTab="tab3" value="${variation ? variation.v_name_en : ''}">
                            <span class="spanLocalError bg-danger text-white hidden">*إجباري</span>
                          </div>
                          <span>الاسم عربي</span>
                          <div>
                            <input type="text" class="form-control" name="v_name_ar[]" placeholder="الاسم عربي" required itsTab="tab3" value="${variation ? variation.v_name_ar : ''}">
                            <span class="spanLocalError bg-danger text-white hidden">*إجباري</span>
                          </div>
                          <span>اسم العلامة التجارية</span>
                          <div>
                            <input type="text" class="form-control" name="v_brand[]" placeholder="اسم العلامة التجارية" required itsTab="tab3" value="${variation ? variation.v_brand : ''}">
                            <span class="spanLocalError bg-danger text-white hidden">*إجباري</span>
                          </div>
                          <span>الضمان</span>
                          <div>
                            <input type="text" class="form-control" name="v_warranty[]" placeholder="الضمان" value="${variation ? variation.v_warranty : ''}">
                          </div>
                        </td>
                        <td>
                          <span>سعر البيع</span>
                          <div>
                            <input type="number" class="form-control" name="v_sale_price[]" placeholder="سعر البيع" step="0.001" required itsTab="tab3" value="${variation ? variation.v_sale_price : ''}">
                            <span class="spanLocalError bg-danger text-white hidden">*إجباري</span>
                          </div>
                          <span>تكلفة المنتج (إن وجدت)</span>
                          <input type="number" class="form-control" name="v_purchase_price[]" placeholder="تكلفة المنتج (إن وجدت)" step="0.001" value="${variation ? variation.v_purchase_price : ''}">
                        </td>
                        <td>
                          <span>كمية المخزون</span>
                          <input type="number" class="form-control" name="v_available_quantity[]" placeholder="الكمية المتاحة" value="${variation ? variation.v_available_quantity : ''}">
                          <span>حد الشراء</span>
                          <input type="number" class="form-control" name="v_purchase_limit[]" placeholder="حد الشراء" value="${variation ? variation.v_purchase_limit : ''}">
                          <span>باركود</span>
                          <input type="text" class="form-control" name="v_barcode[]" placeholder="باركود" value="${variation ? variation.v_barcode : ''}">
                          <span>المخزون في المستودع</span>
                          <input type="number" class="form-control" name="v_warehouse_stock[]" placeholder="المخزون في المستودع" value="${variation ? variation.v_warehouse_stock : ''}">
                        </td>
                        <td>
                          <button type="button" class="btn btn-danger removeRow">حذف</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>`;
    $("#variationsContainer").append(newRow);
  }

  // Automatically add rows for existing variations
  if (productVariations && productVariations.length > 0) {
    productVariations.forEach(function(variation) {
      addVariationRow(variation);
    });
  }

  // Add row on button click
  $("#addRow").click(function(){
    addVariationRow();
  });

  // Function to remove a table
  $(document).on('click', '.removeRow', function(){
    $(this).closest('table').remove();
  });
});
