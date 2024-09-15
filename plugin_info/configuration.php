<?php
/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

require_once dirname(__FILE__) . '/../../../core/php/core.inc.php';
include_file('core', 'authentification', 'php');
if (!isConnect()) {
  include_file('desktop', '404', 'php');
  die();
}
?>

<form class="form-horizontal parametre_app_potager">
<fieldset>
    <legend><i class="fas fa-exclamation-triangle"></i> {{License}}</legend>
    <p>Les images proviennent en partie de 'https://freeicons.io/' et d'autre conçues par Freepik from www.flaticon.com et d'autre par : https://fr.pngtree.com/ </p>
    <br/>
    <legend><i class="fas fa-comment-dots"></i> {{Communication}}</legend>

    <div class="form-group" style="">
        <label class="col-sm-4 control-label">{{Veuillez choisir la méthode de communication}}</label>
        <div class="col-sm-6">
            <div class="input-group">
                <input class="configKey form-control paramAttr" data-l1key="messagerie" />
                <span class="input-group-btn">
                    <a class="btn btn-default listCmdAction roundedRight"><i class="fas fa-list-alt"></i></a>
                </span>
            </div>
        </div>
    </div>

    <div class="form-group" style="">
        <label class="col-sm-4 control-label">{{Activer les rappels pour les semis}}</label>
        <div class="col-sm-6">
            <label class="checkbox-inline"><input type="checkbox" class="configKey" data-l1key="notif_semis" />{{Activer}}</label>
        </div>
    </div>

    <div class="form-group" style="">
        <label class="col-sm-4 control-label">{{Activer les rappels pour la mise en terre des semis}}</label>
        <div class="col-sm-6">
            <label class="checkbox-inline"><input type="checkbox" class="configKey" data-l1key="notif_semis_terre" />{{Activer}}</label>
        </div>
    </div>

    <div class="form-group" style="">
        <label class="col-sm-4 control-label">{{Activer les rappels pour la récolte}}</label>
        <div class="col-sm-6">
            <label class="checkbox-inline"><input type="checkbox" class="configKey" data-l1key="notif_recolte" />{{Activer}}</label>
        </div>
    </div>

    <div class="form-group" style="">
        <label class="col-sm-4 control-label">{{Activer les notifications de date de péremption atteinte }}</label>
        <div class="col-sm-6">
            <label class="checkbox-inline"><input type="checkbox" class="configKey" data-l1key="notif_peremption" />{{Activer}}</label>
        </div>

    </div>


<legend style="display:none"><i class="fas fa-exclamation-triangle" ></i> {{Actions spécifiques}}</legend>
    <div class="form-group" style="display:none">
        <label class="col-lg-4"></label>
        <div class="col-lg-8">
            <a class="btn btn-warning init_semis"><i class="fas fa-cogs"></i> {{Reinitialiser tous les Semis !}}</a>
        </div>
	</div>

    <div class="form-group" style="display:none">
        <label class="col-lg-4"></label>
        <div class="col-lg-8">
		<a class="btn btn-warning refresh_semis"><i class="fas fa-cogs"></i> {{Migrer les Semences en V2 !}}</a>
	</div>
	</div>
  <br>

  



</fieldset>
</form>

<script>
  $('.init_semis').on('click', function () {
	 $.ajax({// fonction permettant de faire de l'ajax
            type: "POST", // methode de transmission des données au fichier php
            url: "plugins/potager/core/ajax/potager.ajax.php", // url du fichier php
            data: {
                action: "init_all_semis"
            },
            dataType: 'json',
            error: function (request, status, error) {
                handleAjaxError(request, status, error);
            },
            success: function (data) { // si l'appel a bien fonctionné
                if (data.state != 'ok') {
                    $('#div_alert').showAlert({message: data.result, level: 'danger'});
                    return;
                }
                $('#div_alert').showAlert({message: '{{Réussie}}', level: 'success'});
            }
        });
    });

    $('.refresh_semis').on('click', function () {
	 $.ajax({// fonction permettant de faire de l'ajax
            type: "POST", // methode de transmission des données au fichier php
            url: "plugins/potager/core/ajax/potager.ajax.php", // url du fichier php
            data: {
                action: "refresh_all_semis"
            },
            dataType: 'json',
            error: function (request, status, error) {
                handleAjaxError(request, status, error);
            },
            success: function (data) { // si l'appel a bien fonctionné
                if (data.state != 'ok') {
                    $('#div_alert').showAlert({message: data.result, level: 'danger'});
                    return;
                }
                $('#div_alert').showAlert({message: '{{Réussie}}', level: 'success'});
            }
        });
    });

    $(".parametre_app_potager").off('click','.listCmdAction').on('click','.listCmdAction', function () {
    var el = $(this).closest('.form-group').find('.paramAttr');
    jeedom.cmd.getSelectModal({cmd: {type: 'action'}}, function (result) {
        if (el.attr('data-concat') == 1) {
        el.atCaret('insert', result.human);
        } else {
        el.value(result.human);
        }
        });
    });

//     $("body").off('click', '.listCmdInfoWindow').on('click', '.listCmdInfoWindow',function () {
//   var el = $(this).closest('.form-group').find('.expressionAttr[data-l1key=cmd]');
//   jeedom.cmd.getSelectModal({cmd: {type: 'info', subtype: 'binary'}}, function (result) {
//     el.value(result.human);
//   });
// });
</script>
