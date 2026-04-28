<?php
require_once('configuration_potager.php');
include_file('desktop', 'menu_top', 'css', 'jardin');
include_file('desktop', 'plan_potager', 'css', 'jardin');

if (!isConnect('admin')) {
    throw new Exception('{{401 - Accès non autorisé}}');
}

$internalAddr = config::byKey('internalAddr');
$internalComplement = config::byKey('internalComplement');
$externalAddr = config::byKey('externalAddr');
$externalComplement = config::byKey('externalComplement');

$base_url = '';
if ($_SERVER['SERVER_NAME'] == $internalAddr) {
    $base_url = $internalComplement;
}
if ($_SERVER['SERVER_NAME'] == $externalAddr) {
    $base_url = $externalComplement;
}
if ($base_url != '') {
    if (substr($base_url, 0, 1) != '/') {
        $base_url = '/' . $base_url;
    }
    if (substr($base_url, (strlen($base_url) - 1), 1) == '/') {
        $base_url = substr($base_url, 0, (strlen($base_url) - 1));
    }
}
$base_url = $conf_add_url_root . $base_url;
sendVarToJs('base_url', $base_url);

$plugin = plugin::byId('jardin');
sendVarToJs('id_plugin', $plugin->getId());
?>

<style>
.jardin-archives-page {
    padding-top: 6px;
    --jardin-card-bg: rgb(var(--defaultBkg-color));
    --jardin-card-border: rgba(var(--contrast-color), 0.12);
    --jardin-card-shadow: rgba(var(--contrast-color), 0.12);
    --jardin-header-start: rgba(var(--panel-bg-color), 0.95);
    --jardin-header-end: rgba(var(--bg-color), 0.95);
    --jardin-title-color: var(--link-color);
    --jardin-muted-color: var(--txt-color);
    --jardin-stat-bg: rgba(var(--panel-bg-color), 0.8);
    --jardin-empty-bg: rgba(var(--panel-bg-color), 0.45);
    --jardin-plan-border: var(--btn-default-color);
    --jardin-plan-bg: rgb(var(--cat-other-color));
}

.jardin-archives-menu {
    margin-bottom: 18px;
}

.jardin-archives-menu .eqLogicThumbnailContainer {
    margin-bottom: 0;
}

#div_historique {
    margin-top: 50px;
}

.jardin-archives {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 50px;
    clear: both;
}

.jardin-archive-card {
    background: var(--jardin-card-bg);
    border: 1px solid var(--jardin-card-border);
    border-radius: 14px;
    box-shadow: 0 10px 24px var(--jardin-card-shadow);
    overflow: hidden;
}

.jardin-archive-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    background: linear-gradient(135deg, var(--jardin-header-start) 0%, var(--jardin-header-end) 100%);
    border-bottom: 1px solid var(--jardin-card-border);
}

.jardin-archive-title {
    font-size: 19px;
    font-weight: 700;
    color: var(--jardin-title-color);
}

.jardin-archive-date {
    font-size: 12px;
    color: var(--jardin-muted-color);
}

.jardin-archive-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.jardin-archive-body {
    padding: 16px 18px 6px 18px;
}

.jardin-archive-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
}

.jardin-archive-stat {
    background: var(--jardin-stat-bg);
    border-radius: 12px;
    padding: 12px;
    text-align: center;
}

.jardin-archive-stat-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: var(--jardin-title-color);
}

.jardin-archive-stat-label {
    display: block;
    font-size: 12px;
    color: var(--jardin-muted-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.jardin-archive-section {
    margin-bottom: 18px;
}

.jardin-archive-section h4 {
    margin: 0 0 10px 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--jardin-title-color);
}

.jardin-archive-preview-cell {
    width: 140px;
}

.jardin-archive-empty {
    background: var(--jardin-empty-bg);
    border: 1px dashed var(--jardin-card-border);
    border-radius: 10px;
    padding: 12px;
    color: var(--jardin-muted-color);
}

.jardin-plan-preview-wrap {
    overflow: auto;
    margin: 12px 0 18px 0;
}

.jardin-plan-preview {
    position: relative;
    border: 4px solid var(--jardin-plan-border);
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35);
    background: var(--jardin-plan-bg);
    background-image:
        linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%, transparent),
        linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.04));
    background-size: 24px 24px, auto;
}

.jardin-plan-preview-item {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 11px;
    line-height: 1.1;
    border-radius: 4px;
    padding: 2px;
    overflow: hidden;
}

@media (max-width: 768px) {
    .jardin-archive-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>

<div class="jardin-archives-page">
<div id="menu_top_potager" class="jardin-archives-menu">
    <div class="eqLogicThumbnailContainer">
        <div class="cursor eqLogicAction logoPrimary" id="add_item">
            <i class="fas fa-plus-circle"></i>
            <br>
            <div class="hide_if_mobile">
                <span>{{Ajouter}}</span>
            </div>
        </div>

        <!--div class="cursor eqLogicAction logoPrimary" id="bt_new_saison">
            <i class="fas fa-leaf"></i>
            <br>
            <div class="hide_if_mobile">
                <span>{{Nouvelle saison}}</span>
            </div>
        </div-->

        <div class="cursor eqLogicAction logoPrimary" id="bt_takeSnapshot">
            <a class="info" href="#">
                <i class="fas fa-archive" style="font-size:250%;"></i>
                <br>
                <br>
                <div class="hide_if_mobile">
                    <span>{{Rapport}}</span>
                </div>
            </a>
        </div>

        <div class="cursor eqLogicAction logoSecondary">
            <a href="<?php echo $base_url; ?>/index.php?v=d&m=jardin&p=jardin" class="info">
                <i class="fas fa-tasks" style="font-size:270%;"></i>
                <br>
                <br>
                <div class="hide_if_mobile">
                    <span>{{Gestion}}</span>
                </div>
            </a>
        </div>

        <div class="cursor eqLogicAction logoSecondary">
            <a class="info" href="<?php echo $base_url; ?>/index.php?v=d&m=jardin&p=planning">
                <i class="icon kiko-calendar" style="font-size:265%;"></i>
                <br>
                <br>
                <div class="hide_if_mobile">
                    <span>{{Planning}}</span>
                </div>
            </a>
        </div>

        <div class="cursor eqLogicAction logoSecondary">
            <a class="info" href="<?php echo $base_url; ?>/index.php?v=d&m=jardin&p=panel">
                <i class="icon nature-plant30" style="font-size:265%;"></i>
                <br>
                <br>
                <div class="hide_if_mobile">
                    <span>{{Potager}}</span>
                </div>
            </a>
        </div>
    </div>
</div>

<div id="div_historique"></div>
</div>
<?php include_file('desktop', 'plan_potager_shared', 'js', 'jardin'); ?>

<script>

$.ajax({
    type: "POST",
    url: "plugins/jardin/core/ajax/jardin.ajax.php",
    data: { action: "getHistorique" },
    dataType: 'json',
    success: function (data) {
        if (data.state != 'ok') {
            $('#div_alert').showAlert({
                message: data.result,
                level: 'danger'
            });
            return;
        }

        const archives = data.result || {};
        let html = '<div class="jardin-archives">';

        if (Object.keys(archives).length === 0) {
            $('#div_historique').html('<div class="alert alert-info">Aucune archive de saison disponible pour le moment.</div>');
            return;
        }

        Object.keys(archives).forEach(function(saison){
            const archive = archives[saison] || {};
            const arrosages = archive.arrosages || [];
            const plans = archive.plans || [];
            const plantes = archive.plantes || [];
            const stats = archive.stats || {};

            html += `<section class="jardin-archive-card">`;
            html += `<div class="jardin-archive-header">`;
            html += `<div>`;
            //html += `<div class="jardin-archive-title">Saison ${jardinEscapeHtml(saison)}</div>`;
            html += `<div class="jardin-archive-title">Rapport</div>`;
            //html += `<div class="jardin-archive-date">${archive.date_archive ? 'Archivée le ' + jardinEscapeHtml(archive.date_archive) : ''}</div>`;
            html += `</div>`;
            html += `<div class="jardin-archive-header-actions">`;
            //html += `<div class="jardin-archive-date">${archive.source_saison_suivante ? 'Saison suivante : ' + jardinEscapeHtml(archive.source_saison_suivante) : ''}</div>`;
            html += `<button type="button" class="btn btn-xs btn-danger bt_delete_archive_saison" data-saison="${jardinEscapeHtml(saison)}">Actualiser</button>`;
            html += `</div>`;
            html += `</div>`;
            html += `<div class="jardin-archive-body">`;
            html += `<div class="jardin-archive-stats">`;
            html += `<div class="jardin-archive-stat"><span class="jardin-archive-stat-value">${stats.plans || plans.length}</span><span class="jardin-archive-stat-label">Plans</span></div>`;
            html += `<div class="jardin-archive-stat"><span class="jardin-archive-stat-value">${stats.plantes || plantes.length}</span><span class="jardin-archive-stat-label">Plantes</span></div>`;
            html += `<div class="jardin-archive-stat"><span class="jardin-archive-stat-value">${stats.arrosages || arrosages.length}</span><span class="jardin-archive-stat-label">Arrosages</span></div>`;
            html += `<div class="jardin-archive-stat"><span class="jardin-archive-stat-value">${parseFloat(stats.conso_totale || 0).toFixed(2)}</span><span class="jardin-archive-stat-label">Conso eau</span></div>`;
            html += `</div>`;

            if (plans.length > 0) {
                html += `<div class="jardin-archive-section">`;
                html += `<h4>Plans du jardin</h4>`;
                html += `<table class="table table-condensed">`;
                html += `<tr><th>Nom</th><th>Taille</th><th>Eléments</th><th>Aperçu</th></tr>`;
                plans.forEach(function(plan, index){
                    const previewId = `rapport_plan_${saison}_${index}`;
                    html += `<tr>
                        <td>${jardinEscapeHtml(plan.nom || '')}</td>
                        <td>${plan.width || 0} x ${plan.height || 0}</td>
                        <td>${(plan.elements || []).length}</td>
                        <td class="jardin-archive-preview-cell"><button type="button" class="btn btn-xs btn-info bt_show_archive_plan" data-target="${previewId}">Voir le plan</button></td>
                    </tr>`;
                    html += `<tr id="${previewId}" style="display:none"><td colspan="4">${jardinRenderPlan(plan, plantes)}</td></tr>`;
                });
                html += `</table>`;
                html += `</div>`;
            } else {
                html += `<div class="jardin-archive-section"><h4>Plans du jardin</h4><div class="jardin-archive-empty">Aucun plan archivé pour cette saison.</div></div>`;
            }

            if (plantes.length > 0) {
                html += `<div class="jardin-archive-section">`;
                html += `<h4>Plantes / semis</h4>`;
                html += `<table class="table table-condensed">`;
                html += `<tr><th>Nom</th><th>Type</th><th>Variété</th><th>Semis</th><th>Détail</th></tr>`;
                plantes.forEach(function(plante, index){
                    const semisId = `archive_semis_${saison}_${index}`;
                    html += `<tr>
                        <td>${jardinEscapeHtml(plante.nom || '')}</td>
                        <td>${jardinEscapeHtml(plante.categorie || plante.type || '')}</td>
                        <td>${jardinEscapeHtml(plante.variete || '')}</td>
                        <td>${(plante.liste_semis || []).length}</td>
                        <td class="jardin-archive-preview-cell"><button type="button" class="btn btn-xs btn-success bt_show_archive_semis" data-target="${semisId}">Voir mes semences</button></td>
                    </tr>`;
                    html += `<tr id="${semisId}" style="display:none"><td colspan="5">${jardinRenderSemisDetails(plante)}</td></tr>`;
                });
                html += `</table>`;
                html += `</div>`;
            } else {
                html += `<div class="jardin-archive-section"><h4>Plantes / semis</h4><div class="jardin-archive-empty">Aucune plante archivée pour cette saison.</div></div>`;
            }

            html += `<div class="jardin-archive-section"><h4>Arrosage</h4>`;
            if (arrosages.length === 0) {
                html += `<div class="jardin-archive-empty">Aucun arrosage archivé pour cette saison.</div>`;
            } else {
                html += `<table class="table table-condensed">`;
                html += `<tr><th>Potager</th><th>Nom</th><th>Durée</th><th>Conso</th><th>Date</th></tr>`;
                arrosages.forEach(function(a){
                    html += `<tr>
                        <td>${a.potager_nom || ''}</td>
                        <td>${a.nom || ''}</td>
                        <td>${a.duree || 0}</td>
                        <td>${a.conso || 0}</td>
                        <td>${a.date_archive || a.date || ''}</td>
                    </tr>`;
                });
                html += `</table>`;
            }
            html += `</div>`;
            html += `</div>`;
            html += `</section>`;
        });

        html += `</div>`;

        $('#div_historique').html(html);

        $('.bt_show_archive_plan').off('click').on('click', function () {
            const target = $('#' + $(this).attr('data-target'));
            if (target.is(':visible')) {
                target.hide();
                $(this).text('Voir le plan');
            } else {
                target.show();
                $(this).text('Masquer le plan');
            }
        });

        $('.bt_show_archive_semis').off('click').on('click', function () {
            const target = $('#' + $(this).attr('data-target'));
            if (target.is(':visible')) {
                target.hide();
                $(this).text('Voir mes semences');
            } else {
                target.show();
                $(this).text('Masquer mes semences');
            }
        });

        $('.bt_delete_archive_saison').off('click').on('click', function () {
            const saison = $(this).attr('data-saison');
            const button = $(this);
            bootbox.confirm('Supprimer définitivement l\'archive de la saison ' + saison + ' ?', function (result) {
                if (!result) {
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: "plugins/jardin/core/ajax/jardin.ajax.php",
                    data: {
                        action: "deleteArchiveSaison",
                        saison: saison
                    },
                    dataType: 'json',
                    success: function (response) {
                        if (response.state != 'ok') {
                            $('#div_alert').showAlert({
                                message: response.result,
                                level: 'danger'
                            });
                            return;
                        }

                        $('#div_alert').showAlert({
                            message: 'Archive de la saison ' + saison + ' supprimée',
                            level: 'success'
                        });
                        button.closest('.jardin-archive-card').remove();
                        if ($('.jardin-archive-card').length === 0) {
                            $('#div_historique').html('<div class="alert alert-info">Aucune archive de saison disponible pour le moment.</div>');
                        }
                    },
                    error: function (request, status, error) {
                        handleAjaxError(request, status, error);
                    }
                });
            });
        });
    }
});

$('#add_item').off('click').on('click', function () {
    setCookie('add_item', 'oui', 1);
    window.open(base_url + "/index.php?v=d&m=jardin&p=jardin", "_self");
});

/*$('#bt_new_saison').off('click').on('click', function () {
    jeeDialog.dialog({
        id: 'md_new_saison',
        title: 'Nouvelle saison',
        contentUrl: 'index.php?v=d&plugin=jardin&modal=newSaison'
    });
});*/
$('#bt_takeSnapshot').on('click', function() {
                $.ajax({
                    type: "POST",
                    url: "plugins/jardin/core/ajax/jardin.ajax.php",
                    data: {
                        action: "takeSnapshot"
                    },
                    dataType: 'json',
                    error: function (request, status, error) {
                    handleAjaxError(request, status, error);
                },
                success: function (data) {
                if (data.state != 'ok') {
                    message: 'error' + data.result;
                    return;
                }
                message: 'success' + "{{Le snapshot a été généré et les anciennes données ont été écrasées.}}";
                setTimeout(function() {
                location.reload();
            }, 500);            
        }
    });
});   
</script>
