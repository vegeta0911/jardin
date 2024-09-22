<?php 
  require_once('configuration_potager.php'); 

  echo '<script type="text/javascript" src="' . $conf_add_url_root . 'plugins/jardin/data/association.js"></script>';
  echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/jardin/desktop/css/planning.css">';
  echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/jardin/desktop/css/detail_semence.css">';
  echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/jardin/desktop/css/menu_top.css">';
  //echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'ressource/css/potager/menu_top.css">'
 
//<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    
$current_theme=jeedom::getThemeConfig()['current_desktop_theme'];
$dark_mode=false;
$add_img_dm='';
if(strpos($current_theme,'Dark') !==false){
    $dark_mode=true;
    $add_img_dm='_d';
}

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

$internalAddr=config::byKey('internalAddr');
$internalComplement=config::byKey('internalComplement');
$externalAddr=config::byKey('externalAddr');
$externalComplement=config::byKey('externalComplement');


$base_url='';
if($_SERVER['SERVER_NAME'] == $internalAddr){
    $base_url=$internalComplement;
}
if($_SERVER['SERVER_NAME'] == $externalAddr){
    $base_url=$externalComplement;
}
if($base_url != ''){
    if(substr($base_url,0,1) != '/'){
        $base_url='/' . $base_url;
    }
    if(substr($base_url,(strlen($base_url) -1),1) == '/'){
        $base_url=substr($base_url,0,(strlen($base_url) -1));
    }
}
$base_url=$conf_add_url_root . $base_url;
sendVarToJs('base_url', $base_url);


$plugin = plugin::byId('jardin');
sendVarToJs('id_plugin', $plugin->getId());
$eqLogics = jardin::byType($plugin->getId());
usort($eqLogics, array('jardin','cmp')); 
//usort($eqLogics, array('potager','cmp')); 
?>

<div id="conteneur_planning">
<div id="menu_top_potager">
        
        <div class="eqLogicThumbnailContainer">
        <div class="cursor eqLogicAction logoPrimary" id="add_item">
           <i class="fas fa-plus-circle"></i>
           
           <br>
		   <div class="hide_if_mobile">
             <span>{{Ajouter}}</span>
           </div>
        </div>
  
        <div class="cursor eqLogicAction logoSecondary">
        <a href=<?php echo $base_url.'/index.php?v=d&m=jardin&p=jardin';?> class="info">
           <i class="fas fa-tasks" style="font-size:270%;"></i>
            <br>
            <br>
			<div class="hide_if_mobile">
               <span>{{Gestion}}</span>
            </div> 
        </a>
    </div>
	<div class="cursor eqLogicAction logoSecondary">
		<a class="info" href='#'>
		    <i class="icon kiko-calendar" style="font-size:265%;"></i>
			<br>
            <br>
			<div class="hide_if_mobile">
               <span>{{Planning}}</span>
            </div>
        </a> 
    </div>
	<div class="cursor eqLogicAction logoSecondary ">
		<a class="info" href=<?php echo $base_url . "/index.php?v=d&m=jardin&p=panel";?>>
		    <i class="icon nature-plant30" style="font-size:265%;"></i>
			<br>
            <br>
			<div class="hide_if_mobile">
               <span>{{Potager}}</span>
            </div>
        </a> 
    </div>
</div>
          
<script>
$('#add_item').off('click').on('click', function () {
    setCookie('add_item', 'oui',1);
    window.open(base_url + "/index.php?v=d&m=jardin&p=jardin","_self")
//    $('#md_modal').dialog({title: "{{Configuration Plugin Potager}}"});
//    $('#md_modal').load('index.php?v=d&p=plugin&ajax=1&id=' + id_plugin).dialog('open');
});
</script>
  
<div id="g_date"><div id="b_date_moins">-</div><div id="g_date_d">...</div><div id="b_date_plus">+</div></div>
  <br>
    <br>
      <br>
       <br>
        <br>
         <br>
<div id="filtre_potager_planning">
    <div class="label_filtre">Filtrer l&apos;affichage </div>
    <select id="filtre_potager" class="un_filtre" style="width:150px">
        <option value="">{{Tout afficher}}</option>
        <option value="seme_only">{{Afficher uniquement les semences semées}}</option>
        <option value="plante_only">{{Afficher uniquement les semences plantées}}</option>
        <option value="plante_seme_only">{{Afficher uniquement les semences semées et/ou plantées}}</option>
        <option value="plante_seme_only_non_germe">{{Afficher uniquement les semences semées et/ou plantées mais NON germées}}</option>
        <option value="non_seme_only">{{Afficher uniquement les semences non semées ni plantées}}</option>
        <option value="rupture_only">{{Afficher uniquement les semences en rupture de stock}}</option>
    </select>

    <select id="filtre_potager_type" class="un_filtre" style="width:150px">
        <option value="">{{Tout type}}</option>
        <option value="fruit">{{Fruit}}</option>
        <option value="legume">{{Légume}}</option>
        <option value="plante">{{Plante}}</option>
        <option value="fleur">{{Fleur}}</option>
        <option value="arbuste">{{Arbuste}}</option>
        <option value="arbre">{{Arbre}}</option>
        <option value="aromate">{{Aromates}}</option>
        <option value="condiment">{{Condiment}}</option>
        <option value="autre">{{Autre}}</option>
    </select>

    

    
    
        <input id="filtre_recherche" type="text" class="un_filtre_i"  placeholder="{{Rechercher}}"/>
        <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" onclick="$('#filtre_recherche').val('');filter_affichage();refresh_all_point();">X</button>
        </div>
    <div id="b_more_filtre">Autres filtres</div>
    <div id="b_selection_multiple" title="Activer le mode sélection multiple (pour effectuer une déclaration sur un ensemble de semis sélectionné au préalable)"><i class="fas fa-check"></i></div>
    
    <div id="bouton_open_all" openO="non" title="Consulter tous les semis de toutes les semences"><i id="bouton_open_all_c" class="fas fa-angle-double-down"></i></div>
    
    <div id="bouton_print">Imprimer</div>
</div>
<div id="more_filtre" style="display:none">
    <select class="un_filtre2" id="filtre_trie" style="width:180px;margin-right:10px">
        <option value="qte_puis_alpha">Trier par Qté</option>
        <option value="alpha_puis_qte">Trier par Nom</option>
    </select>


    <input  list="ensoleillement" id="filtre_potager_enso" type="text" class="un_filtre"  placeholder="{{ensoleillement}}" style="width:150px;margin-right:10px"/>
    <datalist id="ensoleillement">
            <option value="Soleil"></option>
            <option value="Mi-Ombre"></option>
            <option value="Ombre"></option>
            <option value="Soleil / Mi-ombre"></option>
            <option value="Mi-ombre / Ombre"></option>
            <option value="Soleil / Mi-ombre / Ombre"></option>
    </datalist>

    <select class="un_filtre" id="filtre_eclaircissage" style="width:150px;margin-right:10px">
        <option value="">-- Eclaircissage --</option>
        <option value="non">{{Non}}</option>
		<option value="oui">{{Oui}}</option>
    </select>

    <select class="un_filtre" id="filtre_semis" style="width:180px;margin-right:10px">
        <option value="">-- Filtre Semis --</option>
        <option value="semis_annee">{{Semis année en cours}}</option>
    </select>

    <input type="text" list="comestible" class="un_filtre" id="filtre_comestible" placeholder="{{Comestible}}"/>
        <datalist id="comestible">
                <option value="Non"></option>
                <option value="Feuilles"></option>
                <option value="Fleurs"></option>
                <option value="Fruits"></option>
                <option value="Graines"></option>
                <option value="Legume"></option>
                <option value="Pétales"></option>
                <option value="Racines"></option>
                <option value="Tige"></option>
                <option value="Tout"></option>
        </datalist>

    <select class="un_filtre" id="filtre_rupture" style="width:150px;margin-right:10px">
        <option value="">-- Rupture --</option>
        <option value="masquer">{{Masquer les semences en rupture}}</option>
		<option value="afficher">{{Afficher QUE les semences en rupture}}</option>
    </select>
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
    
    echo '<div id="ligne_date" class="ligne_date" style="left:calc(400px - 2px + (100% - 400px) / 12 * ' . ($mois -1) . ' + (100% - 400px) / 12 * ' . $jour_s . '/' . $nb_jour_mois_max . ')"></div>';
    echo '<div id="potager_planning">';
    foreach ($eqLogics as $eqLogic) {
        if($eqLogic->getIsEnable() == false){
            continue;
        }
        if($eqLogic->getConfiguration('type') != 'semence'){
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

        //date_peremption
        $date_peremption='';
        $liste_achat = $eqLogic->getConfiguration('liste_achat');
        if($liste_achat != ''){
            foreach ($liste_achat as $key => $un_achat) {
                $date_peremption_tmp=$un_achat['date_peremption'];
                if(strlen($date_peremption_tmp) == 10){
                    $date_peremption=$date_peremption . '|' . $date_peremption_tmp;

                }
            }
        }
        // $date_peremption=$eqLogic->getConfiguration('date_peremption');
        
        // if(strlen($date_peremption) != 10){
        //     //$date_peremption='vide ' . $date_peremption;
        //     $date_peremption='';
        // }else{
        //     if(substr($date_peremption,0,4) != date('Y')){
        //         $date_peremption='';
        //     }
        // }
        


        $type_semis=$eqLogic->getConfiguration('l_semis');
        $type_s=$eqLogic->getConfiguration('l_type');
        $qte=$eqLogic->getConfiguration('quantite');
        $qte_total=$eqLogic->getConfiguration('quantite_totale');
        if($qte == ''){
            $qte='0';
        }

        $l_rupture=$eqLogic->getConfiguration('l_rupture');

        $type=$eqLogic->getConfiguration('l_type');
        $type_t=$type;
        if($type == 'fruit'){
            $type='plugins/jardin/data/img/fruit' . $add_img_dm . '.png';
        }
        if($type == 'legume'){
            $type='plugins/jardin/data/img/legume' . $add_img_dm . '.png';
        }
        if($type == 'plante'){
            $type='plugins/jardin/data/img/plante' . $add_img_dm . '.png';
        }
        if($type == 'fleur'){
            $type='plugins/jardin/data/img/fleur' . $add_img_dm . '.png';
        }
        if($type == 'arbuste'){
            $type='plugins/jardin/data/img/arbuste' . $add_img_dm . '.png';
        }
        if($type == 'arbre'){
            $type='plugins/jardin/data/img/arbre2' . $add_img_dm . '.png';
        }
        if($type == 'autre'){
            $type='plugins/jardin/data/img/autre' . $add_img_dm . '.png';
        }
        if($type == 'aromate' || $type == 'condiment'){
            $type='plugins/jardin/data/img/plante' . $add_img_dm . '.png';
        }

        $type_semis_aide='';
        if($type_semis == 'godet'){
            $type_semis='plugins/jardin/data/img/semis_godet' . $add_img_dm . '.png';
            $type_semis_aide='Semis en godet';
        }
        if($type_semis == 'terre'){
            $type_semis='plugins/jardin/data/img/semis_terre' . $add_img_dm . '.png';
            $type_semis_aide='Semis en pleine terre';
        }

        

        echo '<div style="display:none" class="potager_ligne ' . $couleur_ligne . '" eclaircissage="' . $eqLogic->getConfiguration('l_eclaircissage') . '" comestible="' . $eqLogic->getConfiguration('comestible') . '" ensoleillement="' . $eqLogic->getConfiguration('ensoleillement') . '" rupture="' . $l_rupture . '" type_s="' . $type_s . '" qte="' . $qte . '" dt_semis="'. $date_semis .'" dt_semis_terre="'. $date_semis_terre .'" dt_eclaircissage="'. $date_eclaircissage .'" dt_recolte="'. $date_recolte .'" date_peremption="' . $date_peremption . '" semence="' . $eqLogic->getId() . '">';
        echo '<div class="potager_ligne_principale">';

        if($couleur_ligne=='couleur1'){
            $couleur_ligne='couleur2';
        }else{
            $couleur_ligne='couleur1';
        }

        echo '<div class="potager_ligne_semence" >';//  href=\'' . $base_url . '/index.php?v=d&m=potager&p=potager&id=' . $eqLogic->getId() . '\'">' ;
        
        
        echo '<img class="potager_ligne_semence_img" title="' . $type_t . '" src="' . $type . '"/>';

        echo '<img class="potager_ligne_semence_img" title="' . $type_semis_aide. '" src="' . $type_semis . '"/>';


        echo '<div class="potager_ligne_semence_qte" qte_total="' . $qte_total . '">' .  $qte . '</div>';
        

        if($l_rupture == 'oui'){
            echo '<div class="rupture_semence" title="Plus de semence en stock !">!</div>';
        }else{
            echo '<div style="display:none" class="rupture_semence" title="Plus de semence en stock !">!</div>';
        }


        echo '<div title="' . $eqLogic->getName(true) . '" class="nom_semence">' .  $eqLogic->getName(true) . '</div>';
        echo '<div class="detail_semence" title="' .  $eqLogic->getConfiguration('detail') . ' ' . $eqLogic->getConfiguration('couleur') . ' ' . $eqLogic->getConfiguration('culture') . '">' .  $eqLogic->getConfiguration('detail') . ' ' . $eqLogic->getConfiguration('couleur') . ' ' . $eqLogic->getConfiguration('culture') . '</div>';

        echo '</div>';
            echo '<div class="potager_ligne_planning">';
            
            $mois=array('J','F','M','A','M','J','J','A','S','O','N','D');
            foreach ($mois as $key => $mois_u) {
                echo '<div class="potager_ligne_planning_mois">';
                if ($eqLogic->getConfiguration('semis_' . $key) == 1){
                    echo '<div title="Semis sous abris conseillé" class="mois_generique mois_semis" style="top:calc(100%/3*0)"></div>';
                }
                if ($eqLogic->getConfiguration('semis_terre_' . $key) == 1){
                    echo '<div title="Plantation conseillé"  class="mois_generique mois_semis_terre" style="top:calc(100%/3*1)"></div>';
                }
                if ($eqLogic->getConfiguration('recolte_' . $key) == 1){
                    echo '<div title="Récolte/Floraison conseillée" class="mois_generique mois_recolte" style="top:calc(100%/3*2)"></div>';
                }
                echo   $mois_u . '</div>';
            }

            echo '</div>';

        echo '</div>';

        echo '<div style="display:none" class="liste_semis">';
        $liste_semis=$eqLogic->getConfiguration('liste_semis');
        $i=0;
        foreach($liste_semis as $un_semis){
            echo '<div semence="' . $eqLogic->getId() . '" index_semis="' . $i . '"  class="un_semis" nom="' . $un_semis['nom'] . '" d_semis="' . $un_semis['d_semis'] . '" d_eclaircissage="' . $un_semis['d_eclaircissage'] . '" d_germination="' . $un_semis['d_germination'] . '" d_plantation="' . $un_semis['d_plantation'] . '" d_recolte="' . $un_semis['d_recolte'] . '"  d_rempotage="' . $un_semis['d_rempotage'] . '">';
                echo '<div  class="case_selection_semis" style="display:none"></div>';

                echo '<div title="' . $un_semis['commentaire'] . '" class="un_semis_nom">' . $un_semis['nom'];
                echo '</div>';

                echo '<div index_semis="' . $i . '" class="potager_ligne_planning">';
                foreach ($mois as $key => $mois_u) {
                    echo '<div class="potager_ligne_planning_mois">';
                    echo '</div>';
                }
                echo '</div>';
            echo '</div>';
            $i++;
        }
        echo '</div>';

        echo '<div style="display:none" class="liste_tache">';
        $liste_tache=$eqLogic->getConfiguration('liste_tache');
        $i=0;
        if($liste_tache != ''){
            foreach($liste_tache as $une_tache){
                if($une_tache['vue_planning']==false){
                    continue;
                }
                
                echo '<div semence="' . $eqLogic->getId() . '" index_tache="' . $i . '"  class="une_tache" nom="' . $une_tache['nom'] . '" date="' . $une_tache['date'] . '" type="' . $une_tache['type_plan_tache'] . '"  couleur="' . $une_tache['couleur'] . '" commentaire="' . $une_tache['commentaire'] . '"></div>';
                   
                $i++;
            }
        }
        
        echo '</div>';


        echo '</div>';
    }

    echo '<div class="potager_ligne_fin"></div>';

include_file('desktop', 'lune', 'js', 'jardin');
include_file('desktop', 'potager_commun', 'js', 'jardin');
include_file('desktop', 'potager_class', 'js', 'jardin');
include_file('desktop', 'association', 'js', 'jardin');
include_file('desktop', 'planning', 'js', 'jardin');
?>
