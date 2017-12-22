<!-- Modal for ajax crud -->
<div class="modal fade" id="modal-ajax-crud">
  <div class="modal-dialog">
    <div class="modal-content"></div>
  </div>
</div>

@section('after_scripts')
@parent
<script type="text/javascript">
  $(document).on('show.bs.modal', '.modal', function (event) {
    modalInvoker = $(event.relatedTarget);
  });
</script>
@endsection