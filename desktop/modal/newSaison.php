<?php
if (!isConnect('admin')) {
    throw new Exception('401 - Accès non autorisé');
}
?>

<div style="padding:15px;">

    <div class="alert alert-info">
        <b>Saison actuelle :</b>
        <?php echo config::byKey('saison_active', 'jardin', date('Y')); ?>
    </div>

    <div class="form-group">
        <label>Nouvelle saison</label>
        <input type="number" id="input_saison" class="form-control"
               value="<?php echo date('Y') + 1; ?>">
    </div>

    <div class="alert alert-warning">
        Le plan du jardin, les plantes et les arrosages de la saison actuelle seront archivés automatiquement.
    </div>

    <br>

    <button class="btn btn-success" id="bt_save_saison">
        <i class="fas fa-check"></i> Valider
    </button>

</div>

<script>
$('#bt_save_saison').on('click', function () {

    let saison = $('#input_saison').val();

    if (!saison || isNaN(saison)) {
        $('#div_alert').showAlert({
            message: "Saison invalide",
            level: 'danger'
        });
        return;
    }

    $.ajax({
        type: "POST",
        url: "plugins/jardin/core/ajax/jardin.ajax.php",
        data: {
            action: "newSaison",
            saison: saison
        },
        dataType: 'json',
        success: function (data) {
         console.log(data)
            if (data.state != 'ok') {
                $('#div_alert').showAlert({
                    message: data.result,
                    level: 'danger'
                });
                return;
            }

            $('#div_alert').showAlert({
                message: "Saison changée : " + data.result.old + " -> " + data.result.new,
                level: 'success'
            });

            jeeDialog.get('#md_new_saison').close();
            
        }
    });

});
</script>
