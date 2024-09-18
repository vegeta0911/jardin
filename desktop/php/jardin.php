<?php 
  
require_once('configuration_potager.php');



	if($conf_mode_potager == 'jeedom'){
		// echo '<script type="text/javascript" src="core/php/downloadFile.php?pathfile=/var/www/html/plugins/potager/data/association.json"></script>';
		// echo '<script type="text/javascript" src="core/php/downloadFile.php?pathfile=/var/www/html/plugins/potager/data/pays.json"></script>';
		echo '<script type="text/javascript" src="plugins/potager/data/association.js"></script>';
		echo '<script type="text/javascript" src="plugins/potager/data/pays.js"></script>';
	}else{
		echo '<script type="text/javascript" src="plugins/potager/data/association.js"></script>';
		echo '<script type="text/javascript" src="plugins/potager/data/pays.js"></script>';
	}



echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/potager/desktop/css/potager_main.css">';
//echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'ressources/css/potager/potager_main.css">';
//echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'ressources/css/potager/menu_top.css">';
echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/potager/desktop/css/menu_top.css">';
echo '<link rel="stylesheet" href="' . $conf_add_url_root . 'plugins/potager/desktop/css/animate.min.css"/>'; ?>
  
<!--meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /-->

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

// Déclaration des variables obligatoires
$plugin = plugin::byId('potager');
sendVarToJs('id_plugin', $plugin->getId());
sendVarToJS('eqType', $plugin->getId());
$version_potager_mig=config::byKey('version_potager_mig', 'potager');
sendVarToJS('version_potager_mig', $version_potager_mig);
$eqLogics = eqLogic::byType($plugin->getId());
usort($eqLogics, array('potager','cmp')); 
log::add('potager','debug', 'essai '.print_r(sendVarToJs('id_plugin', $plugin->getId()),true));
?>

<div class="row row-overflow">
	<!-- Page accueil du plugin -->
	<div class="col-xs-12 eqLogicThumbnailDisplay">


	<div class="eqLogicThumbnailContainer" id="menu_top_potager">
        <div class="cursor eqLogicAction logoPrimary" id="add_item">
           <i class="fas fa-plus-circle"></i>
           
           <br>
		   <div class="hide_if_mobile">
             <span>{{Ajouter}}</span>
           </div>
        </div>
 
 
    <div class="cursor eqLogicAction logoSecondary">
        <a href="#" class="info">
           <i class="fas fa-tasks" style="font-size:270%;"></i>
            <br>
            <br>
			<div class="hide_if_mobile">
               <span>{{Gestion}}</span>
            </div> 
        </a>
    </div>
	<div class="cursor eqLogicAction logoSecondary">
		<a class="info" href=<?php echo $base_url.'/index.php?v=d&m=potager&p=planning';?>>
		    <i class="icon kiko-calendar" style="font-size:265%;"></i>
			<br>
            <br>
			<div class="hide_if_mobile">
               <span>{{Planning}}</span>
            </div>
        </a> 
    </div>
	<div class="cursor eqLogicAction logoSecondary ">
		<a class="info" href=<?php echo $base_url . "/index.php?v=d&m=potager&p=panel";?>>
		    <i class="icon nature-plant30" style="font-size:265%;"></i>
			<br>
            <br>
			<div class="hide_if_mobile">
               <span>{{Potager}}</span>
            </div>
        </a> 
    </div>
	<div class="cursor eqLogicAction logoSecondary warning" data-action="gotoPluginConf">
			<i class="fas fa-wrench"></i>
			<br>
			<div class="hide_if_mobile">
				<span>{{Configuration Plugin Potager}}</span>
            </div>
</div>
          
<script>
	$('#add_item').off('click').on('click', function () {
		$("div[data-action='add']")[0].click();
	});
</script>

<div style="display:none">
		<legend><i class="fas fa-cog"></i>  {{Gestion}}</legend>
		<!-- Boutons de gestion du plugin -->
		<div class="eqLogicThumbnailContainer">
			<div class="cursor eqLogicAction logoPrimary" data-action="add">
				<i class="fas fa-plus-circle"></i>
				<br>
				<span>{{Ajouter}}</span>
			</div>

			<div class="cursor eqLogicAction logoSecondary" id="bt_voirplpotager">
				<i class="fas fa-calendar-alt"></i>
				<br>
				<span>{{Planning}}</span>
			</div>

			<div class="cursor eqLogicAction logoSecondary" id="bt_potager_plan">
				<i class="far fa-map"></i>
				<br>
				<span>{{Gérer mes potagers}}</span>
			</div>

			<div class="cursor eqLogicAction logoSecondary" data-action="gotoPluginConf">
				<i class="fas fa-wrench"></i>
				<br>
				<span>{{Configuration}}</span>
			</div>
		</div>
	</div>
</div>
  
		<legend><i class="fas fa-table"></i> {{Mes semences}}</legend>
		<!-- Champ de recherche -->
		<div class="input-group" style="margin:5px;" >
			<input class="form-control roundedLeft" placeholder="{{Rechercher}}" id="in_searchEqlogic"/>
			<div class="input-group-btn">
				<a id="bt_resetSearch" class="btn roundedRight" style="width:30px"><i class="fas fa-times"></i></a>
			</div>
		</div>

<!-- Liste des équipements du plugin -->
    
		<div class="eqLogicThumbnailContainer">
        
			<?php
  
			foreach ($eqLogics as $eqLogic) {
				$opacity = ($eqLogic->getIsEnable()) ? '' : 'disableCard';
				$detail=$eqLogic->getConfiguration('detail');
				echo '<div class="eqLogicDisplayCard cursor '.$opacity.'" data-eqLogic_id="' . $eqLogic->getId() . '">';
                echo '<br>';
				$type_s=$eqLogic->getConfiguration('type');
				if($type_s == ''){
					$type_s='semence';
				}
				$addStyle='';
				if($type_s=='semence'){
					if($eqLogic->getConfiguration('l_rupture')=='oui'){
						//$addClass+=' rupture_icone_semence ';
						echo '<div title="En rupture" style="background-color:red !important" class="rupture_icone_semence"></div>';
						$addStyle='opacity:0.3';
					}
				}
				$url_img_ia=$eqLogic->getConfiguration('url_img_ia');
				echo '<img style="' . $addStyle . '" url_img_ia="' . $url_img_ia . '" type_semence="'. $eqLogic->getConfiguration('l_type') .'" ia="' . $eqLogic->getConfiguration('ia') . '" type_s="' . $type_s . '"  nom_espece="' . $eqLogic->getName(false,false) . '" src="' . $eqLogic->getPathImgIcon() . '"/>';
				
				echo '<br>';
				echo '<span class="name" >' . $eqLogic->getName(true,true) . '</span>';
				echo '</div>';
			}
			?>
		</div>
	</div> <!-- /.eqLogicThumbnailDisplay -->

	<!-- Page de présentation de l'équipement -->
	<div class="col-xs-12 eqLogic" style="display: none;">
		<!-- barre de gestion de l'équipement -->
		<div class="input-group pull-right" style="display:inline-flex;">
			<span class="input-group-btn">
				<!-- Les balises <a></a> sont volontairement fermées à la ligne suivante pour éviter les espaces entre les boutons. Ne pas modifier -->
				<a id="b_debug" class="btn btn-sm btn-default eqLogicAction roundedLeft" style="display:none"><i class="fas fa-cogs"></i><span class="hidden-xs"> {{Debug}}</span>
				</a><a class="btn btn-sm btn-default eqLogicAction roundedLeft" id="b_print"><i class="fas fa-print"></i><span class="hidden-xs"> {{Imprimer}}</span>
				</a><a class="hide_standalone_mode btn btn-sm btn-default eqLogicAction roundedLeft" data-action="configure"><i class="fas fa-cogs"></i><span class="hidden-xs"> {{Configuration avancée}}</span>
				</a><a class="btn btn-sm btn-default eqLogicAction" data-action="copy"><i class="fas fa-copy"></i><span class="hidden-xs">  {{Dupliquer}}</span>
				</a><a class="btn btn-sm btn-success eqLogicAction" data-action="save"><i class="fas fa-check-circle"></i> {{Sauvegarder}}
				</a><a class="btn btn-sm btn-danger eqLogicAction roundedRight" data-action="remove"><i class="fas fa-minus-circle"></i> {{Supprimer}}
				</a>
			</span>
		</div>
		<!-- Onglets  -->
		<ul class="nav nav-tabs" role="tablist">
			<li id="fleche_retour" role="presentation"><a href="#" class="eqLogicAction" aria-controls="home" role="tab" data-toggle="tab" data-action="returnToThumbnailDisplay"><i class="fas fa-arrow-circle-left"></i></a></li>
			<li role="presentation" class="active"><a href="#eqlogictab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-tachometer-alt"></i><span class="hidden-xs"> {{Informations}}</span></a></li>
			<li id="tab_achat" role="presentation" style="display:none" ><a href="#achattab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-shopping-basket"></i><span class="hidden-xs"> {{Achats}}</span></a></li>
			<li id="tab_semis" role="presentation" style="display:none" ><a href="#datestab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-list"></i><span class="hidden-xs"> {{Semis / Cultures}}</span></a></li>
			<li class="hide_standalone_mode" id="tab_arrosage" role="presentation" style="display:normal" ><a href="#arrosagetab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-faucet"></i><span class="hidden-xs"> {{Arrosage}}</span></a></li>
			<li class="" id="tab_tache" role="presentation" style="display:normal" ><a href="#tachetab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-clipboard-list"></i><span class="hidden-xs"> {{Taches}}</span></a></li>
			<li class="hide_standalone_mode" role="presentation" style="display:normal"><a href="#commandtab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-list"></i><span class="hidden-xs"> {{Commandes}}</span></a></li>
			
		</ul>
		<div class="tab-content" id="page_edition">
			<!-- Onglet de configuration de l'équipement -->
			<div role="tabpanel" class="tab-pane active" id="eqlogictab">
				<!-- Partie gauche de l'onglet "Equipements" -->
				<!-- Paramètres généraux de l'équipement -->
				<form class="form-horizontal">
					<fieldset>
					<div class="col-lg-12 hide_print detect_as" style="display:flex;justify-content: center;align-items: center;">
						<div class="encadre_img_semence" title="L'IA a détecté la semence !">
							<img class="img_semence" style="height:100px"/>	
						</div>
						<div id="detect_as_nom_and_widget">
							<div class="nom_detect nom_detect_haut"></div>
							<div class="ia_aide_haut">
								<img class="img_arrosage ia_aide_haut_img" style="display:none"/>
								<img class="img_ensoleillement ia_aide_haut_img" style="display:none"/>
								<div class="grp_img_distance_plantation" style="display:none;position:relative;flex-direction:column">
									<img class="img_distance_plantation ia_aide_haut_img" style="display:none"/>
									<div class="txt_img_distance_plantation" style="position: absolute;margin-left: auto;margin-right: auto;left: 0px;right: 0px;width: fit-content;font-size: 9px;font-weight: bold;top: 24px;max-width:26px;overflow:hidden;white-space: nowrap;"></div>
								</div>
							</div>
							<a id="a_detect_as" href="#detect_as" style="font-size:9px;text-align:center;font-style:italic">Lire plus d'infos & conseils</a>
						</div>
					</div>
						<div class="col-lg-10">
							<legend><i class="fas fa-wrench"></i> {{Général}}</legend>
							<div class="form-group">
								<label class="col-sm-3 control-label">{{Nom de la semence}}</label>
								<div class="col-sm-9">
									<input type="text" class="eqLogicAttr form-control" data-l1key="id" style="display : none;"/>
									<input id="nom_semence" type="text" class="eqLogicAttr form-control" data-l1key="name" placeholder="{{Nom de la semence}}"/>
								</div>
								
								<label class="col-sm-3 control-label">{{ }}</label>
								<label class="hide_standalone_mode hide_print col-sm-9" style="font-style:italic">{{Astuce, ajouter '@1' ou '@2' ou '@3' etc... en fin de nom (ex : Tomate @1) pour éviter d'avoir la restriction Jeedom sur les doublon de nom , le plugin POTAGER le masquera par la suite}}</label>
							</div>
							<br/>
							<div class="hide_standalone_mode form-group" id="main_form">
								<label class="col-sm-3 control-label" >{{Objet parent}}</label>
								<div class="col-sm-9">
									<select id="sel_object" class="eqLogicAttr form-control" data-l1key="object_id">
										<option value="">{{Aucun}}</option>
										<?php
										$options = '';
										foreach ((jeeObject::buildTree(null, false)) as $object) {
											$options .= '<option value="' . $object->getId() . '">' . str_repeat('&nbsp;&nbsp;', $object->getConfiguration('parentNumber')) . $object->getName() . '</option>';
										}
										echo $options;
										?>
									</select>
								</div>
							</div>
							
							<div class="hide_standalone_mode form-group">
								<label class="col-sm-3 control-label">{{Options}}</label>
								<div class="col-sm-9">
									<label class="checkbox-inline"><input type="checkbox" class="eqLogicAttr" data-l1key="isEnable" checked/>Activer</label>
									<label id="is_visible_ckb" class="checkbox-inline"><input id="is_visible_2" type="checkbox" class="eqLogicAttr" data-l1key="isVisible" checked/>{{Visible}}</label>
								</div>
							</div>

							<br>
							<legend><i class="fas fa-cogs"></i> {{Détails}}</legend>
							<div class="form-group" style="background-color:rgba(255,0,0,0.1);padding:5px;margin-bottom:15px !important;border:solid 1px rgba(255,0,0,0.3)">
								<label class="col-sm-3 control-label">{{Type}}</label>
								<div class="col-sm-2" >
										<select id="sel_type" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="type">
											<option value="semence">{{Semence}}</option>
											<option value="potager">{{Potager}}</option>
											<?php  
												if($conf_mode_potager == 'jeedom'){
													echo '<option value="lune">{{Lune}}</option>';
												}
											?>
											
										</select>
								</div>
							</div>

							<?php
								$mois=array('Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre');
							?>

							<div id="detail_semence">
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Type de semence}}</label>
									<div class="col-sm-2">
											<select id="sel_type_semence" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="l_type">
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
									</div>

									
									<div class="col-sm-5">
										<label class="checkbox-inline"><input type="checkbox" class="eqLogicAttr" data-l1key="configuration" data-l2key="p_mellifere"/>Plante mélifère</label>
									</div>
								</div>
								<div class="form-group" id="cb_ia_g">
									<label class="col-sm-3 control-label">{{Détection automatique}}</label>
									<div class="col-sm-9">
										<label class="checkbox-inline"><input id="cb_ia" type="checkbox" class="eqLogicAttr" data-l1key="configuration" data-l2key="ia"/>{{Désactiver la détection automatique pour cette semence}}</label>
									</div>
								</div>

								<br>
								<legend><i class="far fa-edit"></i> {{Identité}}</legend>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Variété / Détails}}</label>
									<div class="col-sm-9" >
										<input type="text" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="detail" placeholder="{{Variété / Détails}}"/>
									</div>
								</div>
								<input id="url_img_ia" style="display:none" type="text" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="url_img_ia"/>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Nom latin}}</label>
									<div class="col-sm-9" >
										<input type="text" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="latin" placeholder="{{Nom latin}}"/>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Famille}}</label>
									<div class="col-sm-2" >
										<input type="text" list="famille" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="famille" placeholder="{{}}"/>
										<datalist id="famille">
											<option value="Amaranthacée"></option>
											<option value="Amaryllidacée"></option>
											<option value="Apiacée"></option>
											<option value="Apocynacée"></option>
											<option value="Astéracée"></option>
											<option value="Boraginacée"></option>
											<option value="Brassicacée"></option>
											<option value="Cannacée"></option>
											<option value="Caryophyllacée"></option>
											<option value="Chénopodiacée"></option>
											<option value="Convolvulacée"></option>
											<option value="Cucurbitacée"></option>
											<option value="Eléagnacée"></option>
											<option value="Equitaceae"></option>
											<option value="Fabacée"></option>
											<option value="Graminée"></option>
											<option value="Hydrophyllacée"></option>
											<option value="Lamiacée"></option>
											<option value="Liliacée"></option>
											<option value="Linacée"></option>
											<option value="Malvacée"></option>
											<option value="Nelumbonacée"></option>
											<option value="Opiacée"></option>
											<option value="Papaveracée"></option>
											<option value="Passifloracée"></option>
											<option value="Plantaginacée"></option>
											<option value="Poacée"></option>
											<option value="Polygonacée"></option>
											<option value="Renonculacée"></option>
											<option value="Rosaceae"></option>
											<option value="Salicacée"></option>
											<option value="Scrophulariacee"></option>
											<option value="Solanacée"></option>
											<option value="Strelitziacée"></option>
											<option value="Tropæloacée"></option>
											<option value="Violacée"></option>
										</datalist>
									</div>
								

									<label class="col-sm-5 control-label">{{Culture d'origine}}</label>
									<div class="col-sm-2">
										<input type="text" list="culture" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="culture" placeholder="{{F1 / Bio / Maison}}"/>
										<datalist id="culture">
												<option value="Non Bio"></option>
												<option value="F1 (hybride)"></option>
												<option value="Bio"></option>
												<option value="Non traité"></option>
										</datalist>
									</div>
								</div>


								<div class="form-group">
									<label class="col-sm-3 control-label">{{Couleur(s) fruits/fleurs}}</label>
									<div class="col-sm-2"  >
										<input type="text" list="couleurs" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="couleur" placeholder="{{Couleur fruits/fleurs}}"/>
										<datalist id="couleurs">
											<option value="Blanc"></option>
											<option value="Bleu"></option>
											<option value="Gris"></option>
											<option value="Jaune"></option>
											<option value="Marron"></option>
											<option value="Mauve"></option>
											<option value="Noir"></option>
											<option value="Orange"></option>
											<option value="Pourpre"></option>
											<option value="Rose"></option>
											<option value="Rouge"></option>
											<option value="Vert"></option>
											<option value="Violet"></option>
										</datalist>
									</div>
									<label class="col-sm-5 control-label">{{Pays d'origine / Région}}</label>
									<div class="col-sm-2" >
											<select id="l_pays" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="pays">
												<option value=""></option>
											</select>
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Couleur(s) feuillage}}</label>
									<div class="col-sm-2"  >
										<input type="text" list="couleurs" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="couleur_feuillage" placeholder="{{Couleur feuillage}}"/>
										
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Forme}}</label>
									<div class="col-sm-2"  >
										<input type="text" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="forme" placeholder="{{Forme}}"/>
										
									</div>
								</div>
								
								<br>
								<legend><i class="far fa-calendar-alt"></i> {{Calendrier}}</legend>
								<div class="form-group hide_standalone_mode">
									<p class="col-sm-12 aide_champ hide_print ">Vous pourrez ainsi être prévenu par message (si configuré dans les paramètres du plugin) de l'entrée en période de semis/plantation/récolte de la semence.</p>
								</div>

								<div class="form-group">
								<label class="col-sm-3 control-label">{{Semis sous abris}}</label>
									<?php
										foreach ($mois as $key => $u_mois) {
											echo '<label class="checkbox-inline">';
											echo '<input type="checkbox" class="eqLogicAttr" data-l1key="configuration" data-l2key="semis_' . $key . '" />' . $u_mois;
											echo '</label>';
										}
									?>
								</div>
								<br>

								<div class="form-group">
								<label class="col-sm-3 control-label">{{Semis/Plantation en pleine terre}}</label>
									<?php
										foreach ($mois as $key => $u_mois) {
											echo '<label class="checkbox-inline">';
											echo '<input type="checkbox" class="eqLogicAttr" data-l1key="configuration" data-l2key="semis_terre_' . $key . '" />' . $u_mois;
											echo '</label>';
										}
									?>
								</div>
								<br>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Récolte / Floraison}}</label>
									<?php
										foreach ($mois as $key => $u_mois) {
											echo '<label class="checkbox-inline">';
											echo '<input type="checkbox" class="eqLogicAttr" data-l1key="configuration" data-l2key="recolte_' . $key . '" />' . $u_mois;
											echo '</label>';
										}
									?>
								</div>

								<br>
								

								

								<br>
								<legend><i class="fas fa-globe-americas"></i> {{Environnement de culture}}</legend>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Lieu de culture habituel}}</label>
									<div class="col-sm-2" >
										<input type="text" list="lieu" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="lieu_culture" placeholder="{{}}"/>
										<datalist id="lieu">
												<option value="Jardin tempéré"></option>
												<option value="Serre non chauffée"></option>
												<option value="Serre/jardin tropical"></option>
												<option value="Appartement"></option>
												<option value="Maison"></option>
												<option value="Véranda"></option>
												<option value="Pergola"></option>
												<option value="Mur"></option>
												<option value="Autour d’un point d’eau"></option>
												<option value="Dans la marre/étang"></option>
												<option value="Jardin sauvage"></option>
												<option value="En pot"></option>
												<option value="Jarfin fleuri"></option>
												<option value="Terrasse et balcon"></option>
										</datalist>
									</div>

									<label class="col-sm-5 control-label">{{Nature du sol}}</label>
									<div class="col-sm-2" >
											<select class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="nature_sol">
												<option value=""></option>
												<option value="humifere">{{Humifère}}</option>
												<option value="calcaire">{{Calcaire}}</option>
												<option value="argileux">{{Argileux}}</option>
												<option value="sableux">{{Sableux}}</option>
												<option value="acide">{{Acide}}</option>
												<option value="leger">{{Léger}}</option>
												<option value="pauvre">{{Pauvre}}</option>
												<option value="pierre">{{Pierre}}</option>
												<option value="ordinaire">{{Ordinaire}}</option>
												<option value="tous">{{Tous}}</option>
											</select>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Ensoleillement}}</label>
									<div class="col-sm-2" >
										<input type="text" list="ensoleillement" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="ensoleillement" placeholder="{{}}"/>
										<datalist id="ensoleillement">
												<option value="Soleil"></option>
												<option value="Mi-Ombre"></option>
												<option value="Ombre"></option>
												<option value="Soleil / Mi-ombre"></option>
												<option value="Mi-ombre / Ombre"></option>
												<option value="Soleil / Mi-ombre / Ombre"></option>
										</datalist>
									</div>

									<label class="col-sm-5 control-label">{{PH du sol}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="ph_sol">
												<option value=""></option>
												<option value="basic">{{Basic}}</option>
												<option value="basic_a_neutre">{{Basic à Neutre}}</option>
												<option value="neutre">{{Neutre}}</option>
												<option value="neutre_a_acide">{{Neutre à Acide}}</option>
												<option value="acide">{{Acide}}</option>
												<option value="tous">{{Tous}}</option>
											</select>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Chaleur appréciée}}</label>
									<div class="col-sm-2"  >
										<input type="text" list="chaleur" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="chaleur" placeholder="{{}}"/>
										<datalist id="chaleur">
												<option value="Polaire"></option>
												<option value="Froid"></option>
												<option value="Faible"></option>
												<option value="Normal"></option>
												<option value="Fort"></option>
												<option value="Intense"></option>
												<option value="Tropical"></option>
										</datalist>
									</div>
									<label class="col-sm-5 control-label">{{Arrosage}}</label>
									<div class="col-sm-2"  >
										<input type="text" list="arrosage" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="arrosage" placeholder="{{}}"/>
										<datalist id="arrosage">
												<option value="Léger"></option>
												<option value="Moyen"></option>
												<option value="Abondant"></option>
												<option value="Aquatique"></option>
												 
										</datalist>
									</div>
								</div>

								<br>
								<legend><i class="far fa-edit"></i> {{Caractéristiques}}</legend>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Cycle de vie}}</label>
									<div class="col-sm-2" >
											<select  class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="cycle_vie">
												<option value=""></option>
												<option value="vivace">{{Vivace (pluriannuelle)}}</option>
												<option value="annuelle">{{Annuelle}}</option>
												<option value="bisannuelle">{{Bisannuelle}}</option>
											</select>
									</div>

									<label class="col-sm-5 control-label">{{Bulbe}}</label>
									<div class="col-sm-2"  >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="bulbe">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Comestible}}</label>
									<div class="col-sm-2" >
										<input type="text" list="comestible" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="comestible" placeholder="{{}}"/>
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
									</div>
									<label class="col-sm-5 control-label">{{Précocité}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="v_precoce">
											<option value=""></option>
												<option value="tres_precode">{{Très Précoce}}</option>
												<option value="precode">{{Précoce}}</option>
												<option value="hative">{{Hâtive}}</option>
												<option value="tres_hative">{{Très Hâtive}}</option>
												<option value="normale">{{Normale}}</option>
												<option value="mi_saison">{{Mi-Saison}}</option>
												<option value="tardive">{{Tardive}}</option>
											</select>
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Parfumée}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="parfumee">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
									<label class="col-sm-5 control-label">{{Croissance}}</label>
									<div class="col-sm-2"  >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="croissance">
												<option value=""></option>
												<option value="lente">{{Lente}}</option>
												<option value="normale">{{Normale}}</option>
												<option value="rapide">{{Rapide}}</option>
												<option value="determine">{{Déterminé}}</option>
												<option value="indetermine">{{Indéterminé}}</option>
											</select>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Feuillage}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="feuillage">
											<option value=""></option>
												<option value="caduc">{{Caduque}}</option>
												<option value="semi_persistant">{{Semi-Persistant}}</option>
												<option value="persistant">{{Persistant}}</option>
											</select>
									</div>
									<label class="col-sm-5 control-label">{{Variété coureuse}}</label>
									<div class="col-sm-2"  >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="v_coureuse">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Rhizome}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="rhizome">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
									<label class="col-sm-5 control-label">{{Grimpant}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="grimpant">
											<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Résistance aux maladies}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="resistant_maladie">
												<option value=""></option>
												<option value="tres_resistant">{{Très résistant}}</option>
												<option value="resistant">{{Résistant}}</option>
												<option value="peu_resistant">{{peu résistant}}</option>
												<option value="sensible">{{Sensible}}</option>
												<option value="tres_sensible">{{Très sensible}}</option>
											</select>
									</div>
								</div>

								<br>
								<legend><i class="fas fa-cloud-sun"></i> {{Climat}}</legend>
								<div class="form-group">
								<label class="col-sm-3 control-label">{{Type de climat}}</label>
								<div class="col-sm-2" >
										<select class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="climat">
											<option value=""></option>
											<option value="douceur_ocean">{{Douceur océan}}</option>
											<option value="tempere">{{Tempéré}}</option>
											<option value="montagne">{{Montagne}}</option>
										</select>
								</div>
								<label class="col-sm-5 control-label">{{Rusticité}}</label>
								<div class="col-sm-2" >
										<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="rusticite">
											<option value=""></option>
											<option value="non">{{Non}}</option>
											<option value="oui">{{Oui}}</option>
											<option value="faible">{{Faible}}</option>
											<option value="moyenne">{{Moyenne}}</option>
											<option value="forte">{{Forte}}</option>
										</select>
								</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Protection hivers}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="protection_hivers">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
									<label class="col-sm-5 control-label">{{T° de rusticité}}</label>
									<div class="col-sm-2" style="display:flex;align-items:center">
										<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="t_rusticite" placeholder="{{}}"/><div style="margin-left :5px">°c</div>
									</div>
								</div>

								<div class="form-group">
									<div class="col-sm-5"></div>
									<label class="col-sm-5 control-label">{{T° min supportée}}</label>
									<div class="col-sm-2" style="display:flex;align-items:center">
										<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="t_min_supporte" placeholder="{{}}"/><div style="margin-left :5px">°c</div>
									</div>
								</div>

								

								<br>
								<legend><i class="fas fa-seedling"></i> {{Semis}}</legend>
								<div class="form-group">
								<label class="col-sm-3 control-label">{{Niveau de soin/difficulté}}</label>
								<div class="col-sm-2" >
										<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="niveau">
											<option value=""></option>
											<option value="t_facile">{{Très facile}}</option>
											<option value="facile">{{Facile}}</option>
											<option value="moyen">{{Moyen}}</option>
											<option value="difficile">{{Difficile}}</option>
											<option value="t_difficile">{{Très difficile}}</option>
										</select>
								</div>

								<label class="col-sm-5 control-label">{{Distance de plantation}}</label>
									<div class="col-sm-2" >
										<input type="text" list="distance_plantation" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="distance_plantation" placeholder="{{}}"/>
										<datalist id="distance_plantation">
												<option value="2 cm"></option>
												<option value="5 cm"></option>
												<option value="10 cm"></option>
												<option value="20 cm"></option>
												<option value="30 cm"></option>
												<option value="40 cm"></option>
												<option value="50 cm"></option>
												<option value="60 cm"></option>
												<option value="80 cm"></option>
												<option value="100 cm"></option>
												<option value="150 cm"></option>
												<option value="200 cm"></option>
										</datalist>
									</div>

								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Reproduction/Multiplication}}</label>
									<div class="col-sm-2"  >
										<input type="text" list="reproduction" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="reproduction" placeholder="{{}}"/>
										<datalist id="reproduction">
												<option value="Semis"></option>
												<option value="Végétative"></option>
												<option value="Greffe"></option>
												<option value="Marcottage"></option>
												<option value="Bouturage"></option>
												<option value="Division"></option>
												<option value="Stumping"></option>
												<option value="Tubering"></option>
										</datalist>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Type de semis}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="l_semis">
												<option value="godet">{{Semis en godet}}</option>
												<option value="terre">{{Plantation en pleine terre}}</option>
											</select>
									</div>

									<label class="col-sm-5 control-label">{{Hauteur de la plante}}</label>
									<div class="col-sm-2">
										<input type="text" list="hauteur" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="hauteur" placeholder="{{}}"/>
										<datalist id="hauteur">
												<option value="2 cm"></option>
												<option value="5 cm"></option>
												<option value="10 cm"></option>
												<option value="20 cm"></option>
												<option value="30 cm"></option>
												<option value="40 cm"></option>
												<option value="50 cm"></option>
												<option value="60 cm"></option>
												<option value="80 cm"></option>
												<option value="100 cm"></option>
												<option value="150 cm"></option>
												<option value="200 cm"></option>
										</datalist>
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Quantité semée}}
										<sup><i class="fas fa-question-circle tooltips" title="{{Editable librement si pas de semis, sinon ce champ vaut la somme de toutes les quantités semées des semis}}"></i></sup>
									</label>

									<!-- <label class="col-sm-3 control-label" title="Editable librement si pas de semis, sinon ce champ vaut la somme de toutes les quantités semées des semis" >{{Quantité semée (?)}}</label> -->
									<div class="col-sm-2" >
										<input type="number"  id="qte_seme" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="quantite" placeholder="{{Quantité}}"/>
									</div>

									<label class="col-sm-5 control-label">{{Quantité germée}}
										<sup><i class="fas fa-question-circle tooltips" title="{{Editable librement si pas de semis, sinon ce champ vaut la somme de toutes les quantités germées des semis}}"></i></sup>
									</label>

									<div class="col-sm-2"  >
										<input type="number" id="qte_germe" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="quantite_germe" placeholder="{{Quantité germée}}"/>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Quantité plantée}}
										<sup><i class="fas fa-question-circle tooltips" title="{{Editable librement si pas de semis, sinon ce champ vaut la somme de toutes les quantités semées des semis}}"></i></sup>
									</label>


									<div class="col-sm-2" >
										<input type="number"  id="qte_plante" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="quantite_plante" placeholder="{{Quantité plantée}}"/>
									</div>

									<label class="col-sm-5 control-label">{{Quantité rempotée}}
										<sup><i class="fas fa-question-circle tooltips" title="{{Editable librement si pas de semis, sinon ce champ vaut la somme de toutes les quantités germées des semis}}"></i></sup>
									</label>

									<div class="col-sm-2"  >
										<input type="number" id="qte_rempote" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="quantite_rempote" placeholder="{{Quantité rempotée}}"/>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Température de germination Min}}
									</label>

									<div class="col-sm-2" style="display:flex;align-items:center">
										<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="temperature_germination_min" placeholder="{{}}"/><div style="margin-left :5px">°c</div>
									</div>
									

									<label class="col-sm-5 control-label">{{Levée de graines Min}}</label>
									<div class="col-sm-2" style="display:flex;align-items:center">
										<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="nbr_jour_leve_graine_min" placeholder="{{}}"/><div style="margin-left :5px">Jours</div>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Température de germination Max}}
									</label>

									<div class="col-sm-2" style="display:flex;align-items:center">
										<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="temperature_germination_max" placeholder="{{}}"/><div style="margin-left :5px">°c</div>
									</div>
									

									<label class="col-sm-5 control-label">{{Levée de graines Max}}</label>
									<div class="col-sm-2" style="display:flex;align-items:center">
										<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="nbr_jour_leve_graine_max" placeholder="{{}}"/><div style="margin-left :5px">Jours</div>
									</div>
								</div>

								<br>
								<legend><i class="fas fa-feather-alt"></i> {{Opérations spécifiques}}</legend>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Eclaircissage}}</label>
									<div class="col-sm-2"  >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="l_eclaircissage">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
									<label class="col-sm-5 control-label">{{Palissage}}</label>
									<div class="col-sm-2">
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="palissage">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Scarification}}</label>
									<div class="col-sm-2"  >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="scarification">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
									<label class="col-sm-5 control-label">{{Pincer}}</label>
									<div class="col-sm-2" >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="pincer">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Vernalisation / stratification froide}}</label>
									<div class="col-sm-2"  >
											<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="vernalisation">
												<option value=""></option>
												<option value="non">{{Non}}</option>
												<option value="oui">{{Oui}}</option>
											</select>
									</div>
								
									<label class="col-sm-5 control-label">{{Butter}}</label>
									<div class="col-sm-2"  >
										<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="buter">
											<option value=""></option>
											<option value="non">{{Non}}</option>
											<option value="oui">{{Oui}}</option>
										</select>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Mettre la Graine à tremper qq heures}}</label>
									<div class="col-sm-2"  >
										<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="tremper_graine">
											<option value=""></option>
											<option value="non">{{Non}}</option>
											<option value="oui">{{Oui}}</option>
										</select>
									</div>

									<label class="col-sm-5 control-label">{{Tailler}}</label>
									<div class="col-sm-2"  >
										<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="tailler">
											<option value=""></option>
											<option value="non">{{Non}}</option>
											<option value="oui">{{Oui}}</option>
										</select>
									</div>
								</div>

								<br>
								<legend><i class="fas fa-shopping-basket"></i> {{Autre}}</legend>
								<div class="form-group" >
									<label class="col-sm-3 control-label">{{}}</label>
									<div class="col-sm-2">
										<label class="checkbox-inline"><input type="checkbox" class="eqLogicAttr" data-l1key="configuration" data-l2key="semence_reproductible"/>Semence reproductible</label>
									</div>
									<br>
								</div>
								

								
								
								<br>

								
								<br>
								<legend><i class="fas fa-align-justify"></i> {{Autres}}</legend>
								<div class="form-group">
									<label class="col-sm-3 control-label">{{Poids de la récolte totale}}
										<sup><i class="fas fa-question-circle tooltips" title="{{Editable librement si pas de semis, sinon ce champ vaut la somme de tous les poids de récolte des semis}}"></i></sup>
									</label>

									<!-- <label class="col-sm-3 control-label" title="Editable librement si pas de semis, sinon ce champ vaut la somme de tous les poids de récolte des semis">{{Poids de la récolte totale (?)}}</label> -->
									<div class="col-sm-2" style="display:flex;align-items:center">
										<input id="poid_recolte" type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="poid_recolte" placeholder="{{}}"/><div style="margin-left :5px">g</div>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{Commentaires}}</label>
									<div class="col-sm-9" >
										<div contenteditable="true"  id="c_commentaire" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="commentaire" style="max-height:1200px;min-height:350px;overflow:scroll" placeholder="{{Commentaire}}"></div>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{URL 1}}
									</label>

									<!-- <label class="col-sm-3 control-label" title="Editable librement si pas de semis, sinon ce champ vaut la somme de tous les poids de récolte des semis">{{Poids de la récolte totale (?)}}</label> -->
									<div class="col-sm-9" style="display:flex;align-items:center">
										<input id='url_origine_achat' type="text" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="url_origine_achat" placeholder="{{}}"/><div style="margin-left :5px"><i id="b_open_link" title="Ouvrir le lien" class="b_open_link fas fa-link"></i></div>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{URL 2}}
									</label>

									<!-- <label class="col-sm-3 control-label" title="Editable librement si pas de semis, sinon ce champ vaut la somme de tous les poids de récolte des semis">{{Poids de la récolte totale (?)}}</label> -->
									<div class="col-sm-9" style="display:flex;align-items:center">
										<input id='url_origine_achat' type="text" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="url_origine_achat2" placeholder="{{}}"/><div style="margin-left :5px"><i id="b_open_link" title="Ouvrir le lien" class="b_open_link fas fa-link"></i></div>
									</div>
								</div>

								<div class="form-group">
									<label class="col-sm-3 control-label">{{URL 3}}
									</label>

									<!-- <label class="col-sm-3 control-label" title="Editable librement si pas de semis, sinon ce champ vaut la somme de tous les poids de récolte des semis">{{Poids de la récolte totale (?)}}</label> -->
									<div class="col-sm-9" style="display:flex;align-items:center">
										<input id='url_origine_achat' type="text" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="url_origine_achat3" placeholder="{{}}"/><div style="margin-left :5px"><i id="b_open_link" title="Ouvrir le lien" class="b_open_link fas fa-link"></i></div>
									</div>
								</div>
										
							</div>
						</div>	

						<div class="col-lg-2 hide_print detect_as" style="display:none" id="detect_as">
							<legend><i class="far fa-eye"></i> {{Détecté comme}}</legend>	
							<legend class="nom_detect">...</legend>		
							<img class="img_semence" style="height:100px"/>
							<div id="ia_text"></div>
						</div>
					</fieldset>
				</form>
				<hr>
			</div><!-- /.tabpanel #eqlogictab-->

			<!-- Onglet des commandes de l'équipement -->
			<div role="tabpanel" class="tab-pane" id="commandtab" >
				<p style="padding:10px">Pour préciser une date spécifique (semis/mise en terre/etc...) Veuillez passer par le 'Planning', clic-droit sur la semence, et lorsque vous sélectionnez l'option désirée, maintenez la touche CTR en même temps !</p>
				<a style="display:none" class="btn btn-default btn-sm pull-right cmdAction" data-action="add" style="margin-top:5px;"><i class="fas fa-plus-circle"></i> {{Ajouter une commande}}</a>
				<br/><br/>
				<div class="table-responsive">
					<table id="table_cmd" class="table table-bordered table-condensed">
						<thead>
							<tr>
								<th>{{Id}}</th>
								<th>{{Nom}}</th>
								<th>{{ }}</th>
								<th>{{Etat}}</th>
								<th>{{Action}}</th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>
			</div><!-- /.tabpanel #commandtab-->

			<!-- Onglet des achattab de l'équipement -->
			<div role="tabpanel" class="tab-pane" id="achattab" >
			<br>
			<br>
				<form class="form-horizontal">
					<fieldset>
						<div class="form-group" >
							<label class="col-sm-3 control-label">{{Rupture de semence}}</label>
							<div class="col-sm-2" >
								<select id="sel_object" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="l_rupture">
										<option value="non">{{Non}}</option>
										<option value="oui">{{Oui}}</option>
									</select>
							</div>

							
						</div>
					<fieldset>
				</form>
				<br>
				<br>
				<p style="padding:10px">Vous pouvez lister ici vos historiques d'achats de semences ! Pensez à SAUVEGARDER !</p>
				<a id="b_add_achat" class="btn btn-default btn-sm pull-right cmdAction" style="margin-top:5px;"><i class="fas fa-plus-circle"></i> {{Ajouter un achat}}</a>
				<br/><br/>
				<div id="l_achat">
					
				</div>
			</div><!-- /.tabpanel #achattab-->

			<!-- Onglet des semis de l'équipement -->
			<div role="tabpanel" class="tab-pane" id="datestab" >
				<p style="padding:10px">Déclarer ici les semis de la semence - Pensez à SAUVEGARDER !</p>
				<a id="b_add_semis" class="btn btn-default btn-sm pull-right cmdAction" style="margin-top:5px;"><i class="fas fa-plus-circle"></i> {{Créer un semis de la semence}}</a>
				<br/><br/>
				<div id="l_semis">
					<div class="col-lg-12 form-horizontal un_semisO" style="display:none">


						<div class="form-group" >
							<label class="col-sm-3 control-label">{{Nom du semis}}</label>
							<div class="col-sm-2"  >
								<input type="text" class="form-control" data-l1key="configuration"  placeholder="{{Nom optionnel du semis}}"/> 
							</div>
						</div>

						<div class="form-group" >
							<label class="col-sm-3 control-label">{{Date de semis}}</label>
							<div class="col-sm-2"  >
								<input type="date" class="input_date form-control" data-l1key="configuration"/>
							</div>
						</div>
						

						<div class="form-group" >
							<label class="col-sm-3 control-label">{{Date éclaircissage}}</label>
							<div class="col-sm-2"  >
								<input type="date" class="form-control" data-l1key="configuration"  placeholder=""/> <!-- data-l2key="date_peremption"-->
							</div>
							<div class="col-sm-7"></div>
						</div>

						<div class="form-group" >
							<label class="col-sm-3 control-label">{{Date plantation}}</label>
							<div class="col-sm-2"  >
								<input type="date" class="form-control" data-l1key="configuration"  placeholder=""/> <!-- data-l2key="date_peremption"-->
							</div>
							<div class="col-sm-7"></div>
						</div>

						<div class="form-group" >
							<label class="col-sm-3 control-label">{{Date récolte}}</label>
							<div class="col-sm-2"  >
								<input type="date" class="form-control" data-l1key="configuration"  placeholder=""/> <!-- data-l2key="date_peremption"-->
							</div>
							<div class="col-sm-7"></div>
						</div>


					</div>	
				</div>
			</div><!-- /.tabpanel #commandtab-->


			<!-- Onglet arrosage de l'équipement -->
			<div role="tabpanel" class="tab-pane" id="arrosagetab" >
				<p style="padding:10px">Vous pouvez controller vos arrosages ici ! Pensez à SAUVEGARDER !</p>
				<a id="b_add_arrosage" class="btn btn-default btn-sm pull-right cmdAction" style="margin-top:5px;"><i class="fas fa-plus-circle"></i> {{Créer un arrosage}}</a>
				<br/><br/>
				<div id="l_arrosage">
					
				</div>
			</div><!-- /.tabpanel #arrosagetab-->

			<!-- Onglet tache de l'équipement -->
			<div role="tabpanel" class="tab-pane" id="tachetab" >
				<p style="padding:10px">Vous pouvez gérer vos taches/traitements associées à la semence/potager ici (paillage/taillage/voilage/...) ! Pensez à SAUVEGARDER !</p>

				<a id="b_add_tache" class="btn btn-default btn-sm pull-right cmdAction" style="margin-top:5px;"><i class="fas fa-plus-circle"></i> Créer une tache</a>
				<a  nom="Paillage" date="20/04" couleur="#E2DF1B" type="1a" class="b_add_tache_template btn btn-light  pull-left cmdAction" style="margin-top:5px;background:rgba(0,0,0,0) !important;border:solid 1px var(--linkHoverLight-color) !important"><i class="fas fa-plus-circle"></i>Ajouter Paillage</a>
				<a  nom="Taille" date="28/02" couleur="#5E3612" type="1a" class="b_add_tache_template btn btn-light  pull-left cmdAction" style="margin-top:5px;background:rgba(0,0,0,0) !important;border:solid 1px var(--linkHoverLight-color) !important"><i class="fas fa-plus-circle"></i>Ajouter Taille</a>
				<a  nom="Repiquage" date="" couleur="#1C5F0F" type="" class="b_add_tache_template btn btn-light  pull-left cmdAction" style="margin-top:5px;background:rgba(0,0,0,0) !important;border:solid 1px var(--linkHoverLight-color) !important"><i class="fas fa-plus-circle"></i>Ajouter Repiquage</a>
				
				<br/><br/>
				<div id="l_tache">
					
				</div>
			</div><!-- /.tabpanel #arrosagetab-->

			

		</div><!-- /.tab-content -->
	</div><!-- /.eqLogic -->
</div><!-- /.row row-overflow -->

<script>

function detectBrowser() { 
    if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
        return 'Opera';
    } else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
        return 'Chrome';
    } else if(navigator.userAgent.indexOf("Safari") != -1) {
        return 'Safari';
    } else if(navigator.userAgent.indexOf("Firefox") != -1 ){
        return 'Firefox';
    } else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {
        return 'IE';//crap
    } else {
        return 'Unknown';
    }
	}

	if(detectBrowser() == 'Firefox'){
		//alert('Actuellement, seul les navigateurs Chrome/Safari/Brave/Edge sont pleinement supportés ! Votre navigateur "' + detectBrowser() + '" n\'en fait pas parti !');
	}



    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var option = urlParams.get('option')
    if(option == 'add'){
        //data-action
		setTimeout(function(){
			//$("div[data-action='add']")[0].click();
		},1000);
    }

	function hide_visible_potager(){
		if($('#sel_type').val() == 'potager' ){
			$('#is_visible_ckb').hide();
			$('#is_visible_2').prop("checked", true);
		}else{
			$('#is_visible_ckb').show();
		}
	}



</script>
<!-- Inclusion du fichier javascript du plugin (dossier, nom_du_fichier, extension_du_fichier, id_du_plugin) -->
<?php 
include_file('desktop', 'lune', 'js', 'potager');
include_file('desktop', 'potager_commun', 'js', 'potager');
include_file('desktop', 'potager_class', 'js', 'potager');
include_file('desktop', 'association', 'js', 'potager');
include_file('desktop', 'potager', 'js', 'potager');
include_file('desktop', 'semis', 'js', 'potager');
include_file('desktop', 'arrosage', 'js', 'potager');
include_file('desktop', 'achat', 'js', 'potager');
include_file('desktop', 'tache', 'js', 'potager');
include_file('core', 'plugin.template', 'js');


?>

<script>
function addCmdToTable2(_cmd) {
    if (!isset(_cmd)) {
        var _cmd = {};
    }
     if (!isset(_cmd.configuration)) {
        _cmd.configuration = {};
    }           

            
			
		var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">';
			tr += '<td>';
			tr += '<span class="cmdAttr" data-l1key="id" ></span>';
			tr += '</td>';
			tr += '<td>' + _cmd.name + '</td>'; 
			tr += '<td>';
		
			//tr += '<span><input type="checkbox" class="cmdAttr" data-l1key="isHistorized" /> {{Historiser}}<br/></span>';
			//tr += '<span><input type="checkbox" class="cmdAttr" data-l1key="isVisible" /> {{Afficher}}<br/></span>';			
			tr += '</td>';
			tr += '<td>';
			if (is_numeric(_cmd.id)) {
				tr += '<a class="btn btn-default btn-xs cmdAction expertModeVisible" data-action="configure"><i class="fas fa-cogs"></i></a> ';
				tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fas fa-rss"></i> {{Tester}}</a>';
			}
			tr += '<i class="fas fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i></td>';
			tr += '</tr>';
			$('#table_cmd tbody').append(tr);
			$('#table_cmd tbody tr:last').setValues(_cmd, '.cmdAttr');
            
} 



</script>