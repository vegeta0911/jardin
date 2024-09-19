<link rel="stylesheet" href="plugins/jardin/desktop/css/potager.css">

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

if (!isConnect('admin')) {
    throw new Exception('{{401 - Accès non autorisé}}');
}
$plugin = plugin::byId('jardin');
$eqLogics = jardin::byType($plugin->getId());
usort($eqLogics, array('jardin','cmp')); 
?>


<div id="filtre_potager_planning">
    <div class="label_filtre">Filtrer l'affichage </div>
    <select id="filtre_potager" class="un_filtre">
        <option value="">{{Tout afficher (semmées et non semées)}}</option>
        <option value="seme_only">{{Afficher uniquement les semences semées}}</option>
        <option value="non_seme_only">{{Afficher uniquement les semences non semées}}</option>
        <option value="rupture_only">{{Afficher uniquement les semences en rupture de stock}}</option>
    </select>

    <select id="filtre_potager_type" class="un_filtre">
        <option value="">{{Tout type}}</option>
        <option value="fruit">{{Fruit}}</option>
        <option value="legume">{{Légume}}</option>
        <option value="fleur">{{Fleur}}</option>
        <option value="plante">{{Plante}}</option>
        <option value="arbuste">{{Arbuste}}</option>
        <option value="autre">{{Autre}}</option>
    </select>

    <input id="filtre_recherche" type="text" class="un_filtre"  placeholder="{{Rechercher}}"/>
    <div id="bouton_print">Imprimer</div>
</div>




<?php
    $couleur_ligne='couleur1';
    $jour_s= intval(date('d'));
    $mois= intval(date('m'));
    $nb_jour_mois_max=31;
    if($mois==4 or $mois == 6 or $mois==9 or $mois==11){
        $nb_jour_mois_max=30;
    }
    if($mois==2){
        $nb_jour_mois_max=28; //fuck le bisextile
    }
    
    echo '<div class="ligne_date" style="left:calc(310px + (100% - 300px) / 12 * ' . ($mois -1) . ' + (100% - 300px) / 12 * ' . $jour_s . '/' . $nb_jour_mois_max . ')"></div>';
    echo '<div id="potager_planning">';
    foreach ($eqLogics as $eqLogic) {
        if($eqLogic->getIsEnable() == false){
            continue;
        }
        if($eqLogic->getConfiguration('type') == 'potager'){
            continue;
        }

        $date_cmd = $eqLogic->getCmd('info', 'date_semis');
        $date_semis='';
        if (is_object($date_cmd)) {
            $date_semis = $date_cmd->execCmd();
        }

        $date_cmd = $eqLogic->getCmd('info', 'date_mise_en_terre');
        $date_semis_terre='';
        if (is_object($date_cmd)) {
            $date_semis_terre = $date_cmd->execCmd();
        }

        $date_cmd = $eqLogic->getCmd('info', 'date_eclaircissage');
        $date_eclaircissage='';
        if (is_object($date_cmd)) {
            $date_eclaircissage = $date_cmd->execCmd();
        }

        $date_cmd = $eqLogic->getCmd('info', 'date_recolte');
        $date_recolte='';
        if (is_object($date_cmd)) {
            $date_recolte = $date_cmd->execCmd();
        }

        $type_semis=$eqLogic->getConfiguration('l_semis');
        $type_s=$eqLogic->getConfiguration('l_type');
        $qte=$eqLogic->getConfiguration('quantite');
        if($qte == ''){
            $qte='0';
        }

        $l_rupture=$eqLogic->getConfiguration('l_rupture');

        $type=$eqLogic->getConfiguration('l_type');
        $type_t=$type;
        if($type == 'fruit'){
            $type='/plugins/jardin/data/img/fruit.png';
        }
        if($type == 'legume'){
            $type='/plugins/jardin/data/img/legume.png';
        }
        if($type == 'plante'){
            $type='/plugins/jardin/data/img/plante.png';
        }
        if($type == 'fleur'){
            $type='/plugins/jardin/data/img/fleur.png';
        }
        if($type == 'arbuste'){
            $type='/plugins/jardin/data/img/arbuste.png';
        }
        if($type == 'autre'){
            $type='/plugins/jardin/data/img/autre.png';
        }

        $type_semis_aide='';
        if($type_semis == 'godet'){
            $type_semis='/plugins/jardin/data/img/semis_godet.png';
            $type_semis_aide='Semis en godet';
        }
        if($type_semis == 'terre'){
            $type_semis='/plugins/jardin/data/img/semis_terre.png';
            $type_semis_aide='Semis en pleine terre';
        }

        

        echo '<div class="potager_ligne ' . $couleur_ligne . '" rupture="' . $l_rupture . '" type_s="' . $type_s . '" qte="' . $qte . '" dt_semis="'. $date_semis .'" dt_semis_terre="'. $date_semis_terre .'" dt_eclaircissage="'. $date_eclaircissage .'" dt_recolte="'. $date_recolte .'" semence="' . $eqLogic->getId() . '">';
        
        if($couleur_ligne=='couleur1'){
            $couleur_ligne='couleur2';
        }else{
            $couleur_ligne='couleur1';
        }

        echo '<div class="potager_ligne_semence"  onClick="location.href=\'./index.php?v=d&m=jardin&p=jardin&id=' . $eqLogic->getId() . '\'">' ;
        
        
        echo '<img class="potager_ligne_semence_img" title="' . $type_t . '" src="' . $type . '"/>';

        echo '<img class="potager_ligne_semence_img" title="' . $type_semis_aide. '" src="' . $type_semis . '"/>';

        if($qte != ''){
            echo '<div class="potager_ligne_semence_qte">' .  $qte . '</div>';
        }

        if($l_rupture == 'oui'){
            echo '<div class="rupture_semence" title="Plus de semence en stock !">!</div>';
        }


        echo '<div title="' . $eqLogic->getName(true) . '" class="nom_semence">' .  $eqLogic->getName(true) . '</div>';
        echo '<div class="detail_semence">' .  $eqLogic->getConfiguration('detail') . '</div>';

        echo '</div>';
            echo '<div class="potager_ligne_planning">';
            
            $mois=array('J','F','M','A','M','J','J','A','S','O','N','D');
            foreach ($mois as $key => $mois_u) {
                echo '<div class="potager_ligne_planning_mois">';
                if ($eqLogic->getConfiguration('semis_' . $key) == 1){
                    echo '<div title="Semis sous abris conseillé" class="mois_generique mois_semis" style="top:calc(100%/3*0)"></div>';
                }
                if ($eqLogic->getConfiguration('semis_terre_' . $key) == 1){
                    echo '<div title="Semis en terre conseillé"  class="mois_generique mois_semis_terre" style="top:calc(100%/3*1)"></div>';
                }
                if ($eqLogic->getConfiguration('recolte_' . $key) == 1){
                    echo '<div title="Récolte conseillée" class="mois_generique mois_recolte" style="top:calc(100%/3*2)"></div>';
                }
                echo   $mois_u . '</div>';
            }

            echo '</div>';
        echo '</div>';
    }

?>
<script>
    function date_ligne_semis(une_ligne,date_point,class_s){
        une_ligne.find('.' + class_s).remove();
        if(date_point == ''){
            return false;
        }
        mois=parseInt(date_point.substr(3,2));
        jour_s=parseInt(date_point.substr(0,2));
        nb_jour_mois_max=31;
        if(mois==4 || mois==6 ||mois==9 ||mois==11){
            nb_jour_mois_max=30;
        }
        if(mois==2){
            nb_jour_mois_max=28;
        }

        pl='calc(100% / 12 * ' + (mois-1) + ' + 100%/12 * ' + (jour_s) + '/' + (nb_jour_mois_max) + ' - 6px)';
        $('<div title="' + date_point + '" class="date_point ' + class_s + '" style="left:' + pl + '">'+ '</div>').appendTo($(une_ligne.find('.potager_ligne_planning')[0]));
    }
    function generer_date_ligne_semis(une_ligne){
        une_ligne=$(une_ligne);
        
        une_ligne.find('.date_point').remove();

        var dt_semis=une_ligne.attr('dt_semis');
        date_ligne_semis(une_ligne,dt_semis,'dt_semis');

        var dt_semis=une_ligne.attr('dt_semis_terre');
        date_ligne_semis(une_ligne,dt_semis,'dt_semis_terre');

        var dt_semis=une_ligne.attr('dt_eclaircissage');
        date_ligne_semis(une_ligne,dt_semis,'dt_eclaircissage');

        var dt_semis=une_ligne.attr('dt_recolte');
        date_ligne_semis(une_ligne,dt_semis,'dt_recolte');
    }

    $('.potager_ligne').each(function() {
        generer_date_ligne_semis(this);
    });

    $('#potager_planning').on( "click",  function(e) {
        $('#menu_potager').remove();
        e.stopPropagation();
    });

function menu_clic_droit(element,id_semence){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 
    if(mm<10) 
    {
        mm='0'+mm;
    } 
    var date_s=dd + '/' + mm + '/' + yyyy

    //alert('Context Menu event has fired! ' + id_semence);
    $('#menu_potager').remove();
    $('<div id="menu_potager"></div>').appendTo($('#potager_planning').parent());
    var l_seme=$('<div class="menu_potager_ligne" title="Appuyer sur CTRL pour entrer la date de votre choix !">Marquer comme semée</div>').appendTo('#menu_potager');
    var l_seme_terre=$('<div class="menu_potager_ligne" title="Appuyer sur CTRL pour entrer la date de votre choix !">Marquer comme semée en terre</div>').appendTo('#menu_potager');
    var l_seme_eclairci=$('<div class="menu_potager_ligne" title="Appuyer sur CTRL pour entrer la date de votre choix !">Marquer comme eclaircie</div>').appendTo('#menu_potager');
    var l_seme_recolte=$('<div class="menu_potager_ligne" title="Appuyer sur CTRL pour entrer la date de votre choix !">Marquer comme récoltée</div>').appendTo('#menu_potager');

    l_seme.on( "click",  function(e) {
        if(e.ctrlKey){
            date_s = prompt("Veuillez saisir la date au format dd/mm/yyyy", date_s);
            if(date_s.length != 10){
                alert ('foramt date incorrect')
                return false
            }
        }

        $('#menu_potager').remove();
        if(element.attr('dt_semis') == date_s){
            date_s='';
        }
        element.attr('dt_semis',date_s);
        date_ligne_semis(element,date_s,'dt_semis');

        

        $.ajax({
        type: 'POST',
        url: 'plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'set_seme',
            object_id: init(id_semence),
            date_s:init(date_s)
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
        }
        });
    });

    l_seme_terre.on( "click",  function(e) {
        if(e.ctrlKey){
            date_s = prompt("Veuillez saisir la date au format dd/mm/yyyy", date_s);
            if(date_s.length != 10){
                alert ('foramt date incorrect')
                return false
            }
        }

        $('#menu_potager').remove();
        if(element.attr('dt_semis_terre') == date_s){
            date_s='';
        }
        element.attr('dt_semis_terre',date_s);
        date_ligne_semis(element,date_s,'dt_semis_terre');

        $.ajax({
        type: 'POST',
        url: 'plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'set_seme_terre',
            object_id: init(id_semence),
            date_s:init(date_s)
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
        }
        });
    });

    l_seme_eclairci.on( "click",  function(e) {
        if(e.ctrlKey){
            date_s = prompt("Veuillez saisir la date au format dd/mm/yyyy", date_s);
            if(date_s.length != 10){
                alert ('foramt date incorrect')
                return false
            }
        }

        $('#menu_potager').remove();
        if(element.attr('dt_eclaircissage') == date_s){
            date_s='';
        }
        element.attr('dt_eclaircissage',date_s);
        date_ligne_semis(element,date_s,'dt_eclaircissage');

        $.ajax({
        type: 'POST',
        url: 'plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'set_eclairci',
            object_id: init(id_semence),
            date_s:init(date_s)
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
        }
        });
    });

    l_seme_recolte.on( "click",  function(e) {
        if(e.ctrlKey){
            date_s = prompt("Veuillez saisir la date au format dd/mm/yyyy", date_s);
            if(date_s.length != 10){
                alert ('foramt date incorrect')
                return false
            }
        }

        $('#menu_potager').remove();
        if(element.attr('dt_recolte') == date_s){
            date_s='';
        }
        element.attr('dt_recolte',date_s);
        date_ligne_semis(element,date_s,'dt_recolte');

        $.ajax({
        type: 'POST',
        url: 'plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'set_recolte',
            object_id: init(id_semence),
            date_s:init(date_s)
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
        }
        });
    });

    
    //alert(element.offset().top+'-' + element.position().top)
    $('#menu_potager').css('top',(element.position().top+75) + 'px');
    
}

$('.potager_ligne').bind("contextmenu",function(e){

    menu_clic_droit($(e.currentTarget),$(e.currentTarget).attr('semence'));
    e.stopPropagation();
    return false;
}); 

$('#potager_planning').bind("contextmenu",function(e){
    return false;
});


function filter_affichage(){
    $('#menu_potager').remove();
    $('.potager_ligne').show();
    if($('#filtre_potager').val() =='seme_only'){
        $('.potager_ligne[qte=\'0\']').hide();
    }
    if($('#filtre_potager').val() =='non_seme_only'){
        $('.potager_ligne').hide();
        $('.potager_ligne[qte=\'0\']').show();
    }

    if($('#filtre_potager').val() =='rupture_only'){
        $('.potager_ligne').hide();
        $('.potager_ligne[rupture=\'oui\']').show();
    }

    

    var lignes=$('.potager_ligne');
    $('.potager_ligne').each(function() {
        if(!$($(this).children()[0]).text().toLowerCase().includes($('#filtre_recherche').val().toLowerCase())){
            $(this).hide();
        }

        if($('#filtre_potager_type').val() != '' && $('#filtre_potager_type').val() != $(this).attr('type_s')){
            $(this).hide();
        }


    });
}

$('#filtre_potager').on('change',function(e){
    filter_affichage();
});

$('#filtre_recherche').on('input',function(e){
    filter_affichage();
});

$('#filtre_potager_type').on('change',function(e){
    filter_affichage();
});

$('#bouton_print').on('click',function(){print_liste()});

 function print_liste(){
  var content=$('#potager_planning').html();
  var strWindowFeatures = "menubar=no,location=yes,resizable=yes,scrollbars=no,status=no,height=600,width=600";

  var mywindow = window.open( "#Print potager", "new div",strWindowFeatures );
  mywindow.document.write( "<!DOCTYPE html><html><head><title></title>" );
  mywindow.document.write( "<link rel=\"stylesheet\" href=\"/plugins/jardin/desktop/css/potager_print.css\" type=\"text/css\"/><style type=\"text/css\" media=\"print\">*{-webkit-print-color-adjust: exact !important; /*Chrome, Safari */ color-adjust: exact !important;  /*Firefox*/}</style>" );
  mywindow.document.write( "</head><body><h1>Planning de mes semences</h1><br/>" );
  mywindow.document.write(content);
  mywindow.document.write( "</body></html>" );

   setTimeout(() => {
      mywindow.self.focus();  
      mywindow.self.print();
   }, 1000);                      
     

  
  //mywindow.close();

  return true;

 }

</script>