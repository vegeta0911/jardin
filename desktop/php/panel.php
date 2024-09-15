<?php require_once('configuration_potager.php'); ?>
<?php echo '<script type="text/javascript" src="' . $conf_add_url_root . 'plugins/potager/data/association.js"></script>'?>
<?php  echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/potager/desktop/css/plan_potager.css">'?>
<?php  echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/potager/desktop/css/menu_top.css">'?>
<?php  echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/potager/desktop/css/detail_semence.css">'?>
<?php  echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'ressource/css/potager/menu_top.css">'?>

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<?php

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

//externalComplement //externalAddr //internalAddr



// if($_GET['option'] == 'planning'){
//     header('Location: /index.php?v=d&m=potager&p=planning'); 
// }



$plugin = plugin::byId('potager');
sendVarToJs('id_plugin', $plugin->getId());
$eqLogics = potager::byType($plugin->getId());
function filtre_potager($var)
{
    if($var->getIsEnable() == false){
        return false;
    }
    if($var->getConfiguration('type') != 'potager'){
        return false;
    }
    return true;
}
$eqLogics=array_filter($eqLogics, "filtre_potager");
?>

<div id="menu_top_potager">
<?php
echo '<i id=\'add_item\' class="menu_top_potager_bouton  fas fa-plus-circle"></i>';
echo '<a class="menu_top_potager_bouton " href="' . $base_url . '/index.php?v=d&m=potager&p=potager"><i class="fas fa-th-large"></i><div class="hide_if_mobile">&nbsp;&nbsp;Gestion</div></a>';
echo '<a class="menu_top_potager_bouton" href="' . $base_url . '/index.php?v=d&m=potager&p=planning" ><i class="fas fa-calendar-alt"></i><div class="hide_if_mobile">&nbsp;&nbsp;Planning</div></a>';
echo '<a class="menu_top_potager_bouton menu_top_potager_bouton_select" href="#"><i class="far fa-map"></i><div class="hide_if_mobile">&nbsp;&nbsp;Potager</div></a>';
echo '<i id=\'gotoconf\' class="hide_standalone_mode menu_top_potager_bouton  fas fa-wrench"></i>';
?>

<script>
$('#gotoconf').off('click').on('click', function () {
   $('#md_modal').dialog({title: "{{Configuration Plugin Potager}}"});
   $('#md_modal').load('index.php?v=d&p=plugin&ajax=1&id=' + id_plugin).dialog('open');
});
$('#add_item').off('click').on('click', function () {
    setCookie('add_item', 'oui',1);
    window.open(base_url + "/index.php?v=d&m=potager&p=potager","_self")
//    $('#md_modal').dialog({title: "{{Configuration Plugin Potager}}"});
//    $('#md_modal').load('index.php?v=d&p=plugin&ajax=1&id=' + id_plugin).dialog('open');
});
</script>

</div>
<div id="les_potagers" style="display:none">


<?php
foreach ($eqLogics as $eqLogic) {
    if($eqLogic->getIsEnable() == false){
        continue;
    }
    if($eqLogic->getConfiguration('type') != 'potager'){
        continue;
    }



    

    $height=$eqLogic->getConfiguration('height');
    if($height == ''){
        $height='300';
        $eqLogic->setConfiguration('height','300');
        $eqLogic->save();
    }
    $width=$eqLogic->getConfiguration('width');
    if($width == ''){
        $width='300';
        $eqLogic->setConfiguration('width','300');
        $eqLogic->save();
    }

    $lock='non';
    if(strstr($eqLogic->getConfiguration('options'),'lock#oui#') !== false){
        $lock='oui';
    }
    $lock_s='non';
    if(strstr($eqLogic->getConfiguration('options'),'lock_s#oui#') !== false){
        $lock_s='oui';
    }
    

    echo '<div class="un_plan_potager_father" lock="' . $lock . '" lock_s="' . $lock_s . '" id_plan="' . $eqLogic->getId() . '" nom_plan="' . $eqLogic->getName() . '">';
        echo '<div height="' . $height . 'px" width="' . $width . '"  style="display:none" class="un_plan_potager_bk_terre un_plan_potager" id_plan="' . $eqLogic->getId() . '">';
        echo '</div>';
    echo '</div>';


}
?>

</div>
<div id="b_fs" class="fas fa-expand-alt" fs="non" title="Plein écran"></div>
<div id="b_set" class="fas fa-screwdriver" fs="non" title="Paramètres potager"></div>
<select title="la liste de vos potagers sont ici !" id="nom_potager" class="un_plan_potager_info" style="display:none"></select>
<div id="load_wait">
    Chargement des potagers...
</div>
<div id="aucun_potager" style="color:red;display:none">
    Vous n'avez pas encore créé de potager ! Pour ce faire, cliquez sur le bouton '+' ci-dessus , créez un élément de TYPE  'POTAGER' !
</div>

<div class="plan_potager_bouton" style="display:none">
<input type="text" spellcheck="false" class="recherche_semence" placeholder="Rechercher et ajouter une semence"/>


<div class="plan_potager_un_ensemble_bouton b_add_equipement hide_standalone_mode" type_bouton="">
    <div class="plan_potager_un_ensemble_bouton_img equipement_img" style="background-color:none">
    </div>
    <div class="plan_potager_un_ensemble_bouton_txt hide_if_mobile">Un équipement</div>
</div>

<div class="plan_potager_un_ensemble_bouton b_add_cmd hide_standalone_mode" type_bouton="">
    <div class="plan_potager_un_ensemble_bouton_img cmd_img" style="background-color:none">
    </div>
    <div class="plan_potager_un_ensemble_bouton_txt hide_if_mobile">Une Commande/Info</div>
</div>

<div class="plan_potager_liste_element" type_bouton=""><i class="far fa-plus-square"></i><p class="plan_potager_liste_element_titre hide_if_mobile">Ajouter un élément</p></div>

<div title="Verrouiller tous les éléments du potager sauf les semences" class="plan_potager_btn_element lock_background"><i class="fas fa-lock"></i><p class="plan_potager_liste_element_titre hide_if_mobile">Déverrouiller l'arrière plan</p></div>
<div title="Verrouiller les semences" class="plan_potager_btn_element lock_semence"><i class="fas fa-lock"></i><p class="plan_potager_liste_element_titre hide_if_mobile">Déverrouiller les semences</p></div>


<div class="plan_potager_un_ensemble_bouton bouton_print" type_bouton="">
    <div class="plan_potager_un_ensemble_bouton_img bouton_print_img">
    </div>
    <div class="plan_potager_un_ensemble_bouton_txt">Imprimer</div>
    </div>
</div>




<div class="plan_potager" id="id_plan_potager" style="display:none">
    
    <?php
        
        if(count($eqLogics) == 0){
            echo '<a href="/index.php?v=d&m=potager&p=potager&option=add" id="start_help">Pour commencer , veuillez créer un (ou plus) potager <br/><br/>(Cliquez sur ajouter, et définissez le type "Potager" (et activez le))</a>';
        }

        


    


     ?>   
    
    <div class="marge_scroll">
    
    </div>
</div>

<!-- Inclusion du fichier javascript du plugin (dossier, nom_du_fichier, extension_du_fichier, id_du_plugin) -->

<?php
include_file('desktop', 'lune', 'js', 'potager');
include_file('desktop', 'potager_commun', 'js', 'potager');
include_file('desktop', 'potager_class', 'js', 'potager');
include_file('desktop', 'association', 'js', 'potager');
include_file('desktop', 'equipement_class', 'js', 'potager');
include_file('desktop', 'cmd_class', 'js', 'potager');
include_file('desktop', 'plan_potager', 'js', 'potager');
include_file('desktop', 'cancel_plan_potager', 'js', 'potager');

?>
<div id="debug" style="display:none"></div>
<!-- <script type="text/javascript" src="plugins/potager/desktop/js/potager_class.js"></script>
<script type="text/javascript" src="plugins/potager/desktop/js/association.js"></script>
<script type="text/javascript" src="plugins/potager/desktop/js/plan_potager.js"></script> -->