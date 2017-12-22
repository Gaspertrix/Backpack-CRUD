$(document).on('hidden.bs.modal', '.modal', function (event) {
    var modalData = $(this).data('bs.modal');

    if (modalData && modalData.options.remote) {
        $(this).removeData('bs.modal');
        $(this).find(".modal-content").empty();
    }
});

crudForm.submit(function(event) {
    event.preventDefault();

    $(this).ajaxSubmit({
        dataType: 'json',
        success: function(response, statusText, xhr, form) {
            if (xhr.status == 200 && !$.isEmptyObject(response))
            {
                new PNotify({
                    text: response.message,
                    type: 'success'
                });

                // Reload data table if it is present
                if (jQuery.isFunction($('#crudTable').dataTable))
                {
                    $('#crudTable').dataTable().api().ajax.reload();
                }

                // Insert new item if it was added on the fly
                if (modalInvoker && modalInvoker.data('field'))
                {
                    var formInvoker = modalInvoker.closest('form');
                    var field = formInvoker.find('[name="' + modalInvoker.data('field') + '[]"]').length ?
                                formInvoker.find('[name="' + modalInvoker.data('field') + '[]"]') :
                                formInvoker.find('[name="' + modalInvoker.data('field') + '"]');

                    var attribute = modalInvoker.data('attribute');
                    var text = '';

                    // If there are not translatable fields
                    if (!response.language)
                    {
                        text = response.item[attribute];
                    }
                    else
                    {
                        // There are translatable fields, check if this field is translatable
                        if (response.item[attribute][response.language])
                        {
                            text = response.item[attribute][response.language];
                        }
                        else
                        {
                            text = response.item[attribute];
                        }
                    }

                    field.append($('<option>', {value: response.item[modalInvoker.data('key')], text: text}));
                }

                switch (saveActionField.val()) {
                    case 'save_and_new':
                    case 'save_and_edit':
                        $("#modal-ajax-crud .modal-content").load(response.redirect_url, function() {
                            $("#modal-ajax-crud").modal("show"); 
                        });
                        break;
                    case 'save_and_back':
                    default:
                        $("#modal-ajax-crud").modal("hide");
                        break;
                }
            }
            else
            {
                new PNotify({
                    text: 'Unknow error',
                    type: 'error'
                });
            }
        },
        error: function(xhr, statusText, error, form) {
            if (xhr.status == 422)
            {
                if (!$.isEmptyObject(xhr.responseJSON))
                {
                    if (!$.isEmptyObject(xhr.responseJSON.errors))
                    {
                        $.each(xhr.responseJSON.errors, function(property, messages) {
                            var normalizedProperty = property.split('.').map(function(item, index) {
                                    return index === 0 ? item : '['+item+']';
                                }).join('');

                            var field = form.find('[name="' + normalizedProperty + '[]"]').length ?
                                        form.find('[name="' + normalizedProperty + '[]"]') :
                                        form.find('[name="' + normalizedProperty + '"]'),
                                        container = field.parents('.form-group');

                            container.addClass('has-error');

                            $.each(messages, function(key, msg) {
                                // highlight the input that errored
                                var row = $('<div class="help-block">' + msg + '</div>');
                                row.appendTo(container);

                                // highlight its parent tab
                                var tab_id = $(container).parent().attr('id');
                                $("#form_tabs [aria-controls="+tab_id+"]").addClass('text-red');
                            });
                        });
                    }
                    else if (!$.isEmptyObject(xhr.responseJSON.message))
                    {
                        new PNotify({
                            text: xhr.responseJSON.message,
                            type: 'error'
                        });
                    }
                }
                else
                {
                    new PNotify({
                        text: error,
                        type: 'error'
                    });
                }
            }
            else
            {
                new PNotify({
                    text: 'Unknow error',
                    type: 'error'
                });
            }
        }
    }); 

    return false;
});