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

  require_once('../../desktop/php/configuration_potager.php');
require_once __DIR__ . '/../../../../core/php/core.inc.php';
include_file('core', 'authentification', 'php');

if (!isConnect()) {
    throw new Exception('401 - Accès non autorisé');
}

ajax::init();



function skip_accents( $str, $charset='utf-8' ) {
 
  $str = htmlentities( $str, ENT_NOQUOTES, $charset );
  
  $str = preg_replace( '#&([A-za-z])(?:acute|cedil|caron|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $str );
  $str = preg_replace( '#&([A-za-z]{2})(?:lig);#', '\1', $str );
  $str = preg_replace( '#&[^;]+;#', '', $str );
  
  return $str;
}

function jardin_normalize_array_config($value) {
  if (is_array($value)) {
    return $value;
  }

  if (is_string($value) && $value !== '') {
    $decoded = json_decode($value, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
      return $decoded;
    }
  }

  return array();
}

function jardin_get_plan_elements_archive($eqLogic) {
  $elements = array();
  $i = 0;

  while ($eqLogic->getConfiguration('element_' . $i) != '') {
    $elements[] = $eqLogic->getConfiguration('element_' . $i);
    $i++;
  }

  return $elements;
}

function jardin_build_semence_snapshot($eqLogic) {
  $image = $eqLogic->getConfiguration('url_img_ia');
  if ($image) {
    if (strpos($image, '/') === false) {
      $image = 'plugins/jardin/data/img/semences/' . $image;
    } elseif (strpos($image, 'http://') === 0 || strpos($image, 'https://') === 0 || strpos($image, '//') === 0) {
      // leave absolute URLs as-is
    } elseif (strpos($image, 'plugins/jardin/data/img/semences/') === false && strpos($image, '/plugins/jardin/data/img/semences/') === false && strpos($image, 'plugins/jardin/data/img/') === false) {
      $image = 'plugins/jardin/data/img/semences/' . basename($image);
    }
  } else {
    $image = 'plugins/jardin/data/img/semence.png';
  }
  return array(
    'id' => $eqLogic->getId(),
    'nom' => $eqLogic->getName(),
    'type' => $eqLogic->getConfiguration('type', 'semence'),
    'categorie' => $eqLogic->getConfiguration('l_type'),
    'variete' => $eqLogic->getConfiguration('detail'),
    'liste_semis' => jardin_normalize_array_config($eqLogic->getConfiguration('liste_semis')),
    'rupture' => $eqLogic->getConfiguration('l_rupture'),
    'image' => $image,
  );
}

function jardin_build_plan_snapshot($eqLogic) {
  return array(
    'id' => $eqLogic->getId(),
    'nom' => $eqLogic->getName(),
    'width' => $eqLogic->getConfiguration('width'),
    'height' => $eqLogic->getConfiguration('height'),
    'options' => $eqLogic->getConfiguration('options'),
    'elements' => jardin_get_plan_elements_archive($eqLogic),
  );
}

function jardin_build_arrosage_snapshot($eqLogic, $arrosage, $saison, $dateArchive) {
  return array(
    'id' => isset($arrosage['id']) ? $arrosage['id'] : '',
    'nom' => isset($arrosage['nom']) ? $arrosage['nom'] : '',
    'potager_id' => $eqLogic->getId(),
    'potager_nom' => $eqLogic->getName(),
    'saison' => $saison,
    'conso' => isset($arrosage['conso_arrosage']) ? $arrosage['conso_arrosage'] : 0,
    'duree' => isset($arrosage['duree']) ? $arrosage['duree'] : 0,
    'etat' => isset($arrosage['etat']) ? $arrosage['etat'] : '',
    'date' => $dateArchive,
    'date_archive' => $dateArchive,
    'archive' => !empty($arrosage['archive']) ? 1 : 0,
  );
}

function jardin_get_archives_saisons() {
  return jardin_normalize_array_config(config::byKey('archives_saisons', 'jardin', array()));
}

try {
    
    ob_get_clean();
    
    if (init('action') == 'takeSnapshot') {
        $snapshotName = trim(init('name'));
        if ($snapshotName === '') {
            $snapshotName = 'Dernier Snapshot (' . date('d/m/Y H:i') . ')';
        }

        $dateArchive = date('Y-m-d H:i:s');
        $snapshotId = 'latest_snapshot'; // ID fixe pour écraser systématiquement la clé précédente
        
        // On initialise un tableau vide au lieu de charger les archives existantes
        // Cela supprime tous les anciens snapshots de la mémoire pour cette sauvegarde
        $archives = array(); 

        $archives[$snapshotId] = array(
            'date_archive' => $dateArchive,
            'nom' => $snapshotName,
            'plans' => array(),
            'plantes' => array(),
            'arrosages' => array()
        );

        // Parcours de tous les équipements du plugin Jardin
        foreach (eqLogic::byType('jardin') as $eqLogic) {
            $type = $eqLogic->getConfiguration('type', 'semence');
            
            if ($type == 'potager') {
                // Capture de l'état du plan
                $archives[$snapshotId]['plans'][] = jardin_build_plan_snapshot($eqLogic);

                // Capture de l'historique des arrosages
                $liste = jardin_normalize_array_config($eqLogic->getConfiguration('liste_arrosage'));
                foreach ($liste as $arrosage) {
                    $archives[$snapshotId]['arrosages'][] = jardin_build_arrosage_snapshot($eqLogic, $arrosage, $snapshotId, $dateArchive);
                }
            } else {
                // Capture des plantes et semences
                $archives[$snapshotId]['plantes'][] = jardin_build_semence_snapshot($eqLogic);
            }
        }

        // Statistiques du snapshot unique
        $archives[$snapshotId]['stats'] = array(
            'plans' => count($archives[$snapshotId]['plans']),
            'plantes' => count($archives[$snapshotId]['plantes']),
            'arrosages' => count($archives[$snapshotId]['arrosages']),
            'conso_totale' => array_reduce($archives[$snapshotId]['arrosages'], function ($carry, $item) {
                return $carry + floatval(isset($item['conso']) ? $item['conso'] : 0);
            }, 0),
        );

        // Sauvegarde dans la configuration : écrase l'ancienne valeur 'archives_saisons'
        config::save('archives_saisons', $archives, 'jardin');

        ajax::success(array(
            'id' => $snapshotId,
            'name' => $snapshotName,
            'stats' => $archives[$snapshotId]['stats'],
        ));
    }

    /**
     * Action : Récupérer les infos d'un plan
     */
    if (init('action') == 'get_info_plan') {
        $object = jardin::byId(init('object_id'));
        if (!is_object($object)) {
            throw new Exception(__('Plan introuvable', __FILE__));
        }
        ajax::success($object->get_info());
    }

    /**
     * Action : Sauvegarder la configuration d'un plan
     */
    if (init('action') == 'save_plan') {
        $object = jardin::get_potager_check_non_run(init('object_id'), true, 'ajax save_plan');
        if (!is_object($object)) {
            throw new Exception(__('Erreur de récupération de l\'objet potager', __FILE__));
        }
        
        $object->setConfiguration('width', init('width'));
        $object->setConfiguration('height', init('height'));
        $object->setConfiguration('options', init('options'));

        $object->save();
        jardin::set_potager_non_run(init('object_id'));
        ajax::success();
    }


    if (init('action') == 'get_info_cmd_action_info') {
      $cmd=cmd::byId(init('id'));
      $_version = 'dashboard';
      if($cmd == null){
        ajax::success("null");
      }

      if($cmd->getEqLogic()->getIsEnable() == false){
        ajax::success("hide");
      }

      ajax::success($cmd->toHtml($_version));
    }


    if (init('action') == 'get_info_equipement') {

      $eqLogic=eqLogic::byId(init('id'));//test bureau

      $_version = 'dashboard';

      if($eqLogic == null){
        log::add('jardin', 'info', 'cmd id ' . init('id') . ' not found !' );
        ajax::success("null");
      }
      if($eqLogic->getIsEnable() == false){
        ajax::success("hide");
      }

      ajax::success($eqLogic->toHtml($_version));
    }
    
    if (init('action') == 'migrer_une_semence') {
      $plugin = plugin::byId('jardin');
      $eqLogic = jardin::byId(init('id'));
      $eqLogic->migrationV2_data();
      ajax::success();
    }

    if (init('action') == 'get_info_semence') {
      $plugin = plugin::byId('jardin');
      $eqLogic = jardin::byId(init('id'));

      if($eqLogic == null){
        log::add('jardin', 'info', 'id ' . init('id') . ' not found !' );
        ajax::success("null");
      }

      if($eqLogic->getIsEnable() == false){
        ajax::success("hide");
      }


      ajax::success($eqLogic->get_info());
    }

    

    if (init('action') == 'chercher_semences') {
      $recherche = strtolower (init('recherche'));

      $recherche=skip_accents($recherche);
      $return=array();
      $plugin = plugin::byId('jardin');
      $eqLogics = jardin::byType($plugin->getId());
      foreach ($eqLogics as $eqLogic) {
        if($eqLogic->getIsEnable() == false){
            continue;
        }
        if($eqLogic->getConfiguration('type') == 'potager'){
            continue;
        }

        $une_semence=$eqLogic->get_info();
        if($recherche == ''){
          $return[]=$une_semence;
        }else{
          if(strpos(strtolower(skip_accents($eqLogic->getName(true,true))),$recherche) !== false){
            $return[]=$une_semence;
          }
        }
        
        
      }

      ajax::success($return);
    }


    if (init('action') == 'sendNotificationArrosage') {
    if (config::byKey('notif_arrosage', 'jardin', 0) == 1) {
                $cmdNotif = config::byKey('messagerie', 'jardin', '');
                if ($cmdNotif != '') {
                    $etat = init('etat', 'démarré'); // valeur envoyée par l’AJAX
                    $nom = init('arrosageName', 'Arrosage');
                    $message = "L'arrosage « " . $nom . " » a été " . $etat . ".";
                    $options = array('message' => $message, 'title' => 'Arrosage');

                    // Envoi via la commande choisie dans la config
                    scenarioExpression::createAndExec('action', $cmdNotif, $options);

                    log::add('jardin', 'info', 'Notification envoyée : ' . $message);
                    ajax::success("Notification envoyée : " . $message);
                  return;
                } else {
                    ajax::error("Aucune commande de notification définie dans la config.");
                }
            } else {
                log::add('jardin', 'info', 'Notification d’arrosage désactivée.');
                ajax::success("Notification désactivée pour l'arrosage.");
            }
    }
  
    if (init('action') == 'get_elements_plan') {
      $object = jardin::byId(init('object_id'));

      $return=array();
      $i=0;
      
      while($object->getConfiguration('element_' . $i) != ''){
        $return[$i]=$object->getConfiguration('element_' . $i);
        $i++;
      }
      ajax::success($return);
    }

    if (init('action') == 'get_phase_lune') {
      // $endpoint1='https://www.calendrier-lunaire.net/';
      // $result=file_get_contents($endpoint1);
      ajax::success(jardin::whatMoon());
    }

    if (init('action') == 'debug') {
      $eqLogics = eqLogic::byType('jardin');
      foreach ($eqLogics as $eqLogic) {
        $eqLogic->migration_data();
      }
      ajax::success($result);

      // $object = potager::byId(init('id'));
      // log::add('potager', 'debug', 'POTAGER DEBUG !');
      // $object->debug();
      // ajax::success($result);
    }

    if (init('action') == 'get_nbr_info') {
      $object = jardin::byId(init('id'));
      $result=$object->get_nbr_info(init('annee'));
      ajax::success($result);
    }

    if (init('action') == 'get_nbr_info_all') {
      $result = jardin::get_nbr_info_s(init('annee'));
      ajax::success($result);
    }

    if (init('action') == 'getHistorique') {
      $archives = jardin_get_archives_saisons();
      // Corriger les images des plantes dans les archives
      foreach ($archives as $saison => &$archive) {
        if (isset($archive['plantes']) && is_array($archive['plantes'])) {
          foreach ($archive['plantes'] as &$plante) {
            if (!isset($plante['image']) || empty($plante['image'])) {
              $plante['image'] = 'plugins/jardin/data/img/semence.png';
            }
          }
        }
      }
      // Sauvegarder les corrections
      config::save('archives_saisons', $archives, 'jardin');
      krsort($archives);
      ajax::success($archives);
    }

    if (init('action') == 'debugEqLogic') {
      $eqLogics = eqLogic::byType('jardin');
      $result = array();
      foreach ($eqLogics as $eqLogic) {
        $result[] = array(
          'id' => $eqLogic->getId(),
          'name' => $eqLogic->getName(),
          'type' => $eqLogic->getConfiguration('type', 'semence'),
          'enabled' => $eqLogic->getIsEnable()
        );
      }
      ajax::success($result);
    }

    if (init('action') == 'deleteArchiveSaison') {
      $saison = trim(init('saison'));
      if ($saison === '') {
        throw new Exception('Saison invalide');
      }

      $archives = jardin_get_archives_saisons();
      if (!isset($archives[$saison])) {
        throw new Exception('Archive de saison introuvable');
      }

      unset($archives[$saison]);
      config::save('archives_saisons', $archives, 'jardin');
      ajax::success(array('deleted' => $saison));
    }
    
    if (init('action') == 'del_one_element_plan') {
      
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax del_one_element_plan');
      $id_to_dell = init('id_to_dell');
      log::add('jardin', 'info', 'del_one_element_plan ' . $id_to_dell);

      $i=0;
      $found=false;
      while($object->getConfiguration('element_' . $i) != '' && $found==false){
        if(strpos($object->getConfiguration('element_' . $i),$id_to_dell) != false){
          $found=true;
        }else{
          $i++;
        }
      }

      if($found){
        while($object->getConfiguration('element_' . $i) != ''){
          $object->setConfiguration('element_' . $i,$object->getConfiguration('element_' . ($i+1)));
          $i++;
        }
        $object->save();
        jardin::set_potager_non_run(init('object_id')); 
        ajax::success("ok");
      }
      jardin::set_potager_non_run(init('object_id')); 
      ajax::success("not found");
    }

    
    if (init('action') == 'action_arrosage') {
      //$object = potager::byId(init('id'));
      $object=jardin::get_potager_check_non_run(init('id'),true,'ajax action_arrosage');
      $action_arrosage = init('action_arrosage');
      $un_arrosage=$object->get_arrosage_by_id(init('id_arrosage'));
      $timer_manual = init('timer_manual');
       if($un_arrosage != null){
         if($action_arrosage == "start"){
           log::add('jardin', 'info', 'action_arrosage start');
           $object->start_arrosage($un_arrosage['arrosage'],$un_arrosage['key'],true, $timer_manual);
         }
         if($action_arrosage  == "stop"){
           log::add('jardin', 'info', 'action_arrosage stop');
           $object->stop_arrosage($un_arrosage['arrosage'],$un_arrosage['key']);
         }
       }
       jardin::set_potager_non_run(init('id')); 
       ajax::success("ok");
    }

    if (init('action') == 'get_data_arrosage') {
      ajax::success(jardin::dataToWidget(init('id_eqlogic'),init('id_arrosage')));
    }

    if (init('action') == 'save_one_element_plan') {
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax save_one_element_plan');
      $object_to_save = init('objet');

      $id_unique=explode ("|",$object_to_save)[5];


       log::add('jardin', 'info', 'save element id_unique ' . $id_unique );
      $i=0;
      while($object->getConfiguration('element_' . $i) != '' && strpos($object->getConfiguration('element_' . $i),$id_unique)==false){
        $i++;
      }

      $object->setConfiguration('element_' . $i,$object_to_save) ;
      $object->save();


      jardin::set_potager_non_run(init('object_id'));
      ajax::success();
    }
    
    //----------
    if (init('action') == 'set_version_potager_mig') {
      config::save('version_potager_mig', init('version_potager_mig'),'potager');
      ajax::success();
    }

    if (init('action') == 'nouveau_semis') {
      //$object = potager::byId(init('id_semence'));
      $object=jardin::get_potager_check_non_run(init('id_semence'),true,'ajax nouveau_semis');

      $liste_semis=$object->getConfiguration('liste_semis');
      if($liste_semis == ''){
        $liste_semis=[];
      }
      $un_semis=[];
      $un_semis['nom']=init('nom_semis');


      $un_semis['d_semis']="";
      $un_semis['d_eclaircissage']="";
      $un_semis['d_germination']="";
      $un_semis['d_plantation']="";
      $un_semis['d_recolte']="";
      $un_semis['d_rempotage']="";
      $un_semis['commentaire']="";

      $liste_semis[]=$un_semis;
      $object->setConfiguration('liste_semis',$liste_semis);
      $object->save();
      jardin::set_potager_non_run(init('id_semence'));
      ajax::success();
    }

    if (init('action') == 'rename_semis') {
      log::add('jardin', 'debug', 'rename_semis '  .init('id_semence') . ' - ' . init('ind_semis'));

      //$object = potager::byId(init('id_semence'));
      $object=jardin::get_potager_check_non_run(init('id_semence'),true,'ajax rename_semis');

      $liste_semis=$object->getConfiguration('liste_semis');
      $semis=$liste_semis[intval(init('ind_semis'))];
      $semis['nom']=init('nom_semis');
      $liste_semis[intval(init('ind_semis'))]=$semis;
      $object->setConfiguration('liste_semis',$liste_semis);
      $object->save();
      jardin::set_potager_non_run(init('id_semence'));
      ajax::success();
    }

    if (init('action') == 'delete_semis') {
      log::add('jardin', 'debug', 'delete_semis '  .init('id_semence') . ' - ' . init('ind_semis'));
      //$object = potager::byId(init('id_semence'));
      $object=jardin::get_potager_check_non_run(init('id_semence'),true,'ajax delete_semis');
      $liste_semis=$object->getConfiguration('liste_semis');
      unset($liste_semis[intval(init('ind_semis'))]);

      $liste_semis=array_values($liste_semis);
      $object->setConfiguration('liste_semis',$liste_semis);
      $object->save();
      jardin::set_potager_non_run(init('id_semence'));
      ajax::success();
    }

    if (init('action') == 'rupture_semence') {
      log::add('jardin', 'debug', 'rupture_semis '  .init('id_semence') );
      //$object = potager::byId(init('id_semence'));
      $object=jardin::get_potager_check_non_run(init('id_semence'),true,'ajax rupture_semence');
      $object->setConfiguration('l_rupture',init('rupture'));
      $object->save();
      jardin::set_potager_non_run(init('id_semence'));
      ajax::success();
    }
    
    if (init('action') == 'get_recap_semence') {
      $type_s=array("fruit"=>"Fruit","legume"=>"Légume","plante"=>"Plante","fleur"=>"Fleur","arbuste"=>"Arbuste","arbre"=>"Arbre","aromate"=>"Aromates","condiment"=>"Condiment","autre"=>"Autres");
      log::add('jardin', 'debug', 'get_recap_semence ' );
      $plugin = plugin::byId('jardin');
      $eqLogics = eqLogic::byType($plugin->getId());
      $result=[];
      foreach ($eqLogics as $key => $eqLogic) {
        if($eqLogic->getConfiguration('type')!='semence'){
          continue;
        }
        $type=$eqLogic->getConfiguration('l_type');
        if($type==''){
          continue;
        }
        $type_label = $type_s[$type] ?? $type;
        $result[$type_label] = intval($result[$type_label] ?? 0) + 1;
        
      }
      // $result['test 1']=1;
      // $result['test 2']=1;
      // $result['test 6']=1;
      // $result['test 3']=1;
      ajax::success($result);
    }


    if (init('action') == 'set_date_semis') {
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax set_date_semis');

      $qte=init('qte');
      $liste_semis=$object->getConfiguration('liste_semis');
      $semis=$liste_semis[intval(init('ind_semis'))];
      $semis[init('type_date')]=init('date_s');

      if($qte != '' || init('date_s')==''){
        if(init('type_date')=='d_semis'){
          $semis['qte_seme']=$qte;
        }
        if(init('type_date')=='d_germination'){
          $semis['qte_germe']=$qte;
        }
        if(init('type_date')=='d_plantation'){
          $semis['qte_plante']=$qte;
        }
        if(init('type_date')=='d_eclaircissage'){
          $semis['qte_eclairci']=$qte;
        }
        if(init('type_date')=='d_rempotage'){
          $semis['qte_rempote']=$qte;
        }
        if(init('type_date')=='d_recolte'){
          $semis['poid_recolte']=$qte;
        }
      }
      


      $liste_semis[intval(init('ind_semis'))]=$semis;
      $object->setConfiguration('liste_semis',$liste_semis);
      $object->save();
      jardin::set_potager_non_run(init('object_id'));
      ajax::success();
    }

    if (init('action') == 'set_config') {
      config::save(init('config'),init('value'), 'jardin');
      ajax::success('ok');
    }

    if (init('action') == 'get_config') {
      $config = config::byKey(init('config'), 'jardin');
      ajax::success($config);
    }

    if (init('action') == 'set_seme') {
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax set_seme');
      $object->m_semis(init('date_s'));
      jardin::set_potager_non_run(init('object_id'));
      ajax::success();
    }

    if (init('action') == 'set_seme_terre') {
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax set_seme_terre');
      $object->m_semis_terre(init('date_s'));
      jardin::set_potager_non_run(init('object_id'));
      ajax::success();
    }

    if (init('action') == 'set_eclairci') {
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax set_eclairci');
      $object->m_eclaircissage(init('date_s'));
      jardin::set_potager_non_run(init('object_id'));
      ajax::success();
    }

    if (init('action') == 'set_recolte') {
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax set_recolte');
      $object->m_recolte(init('date_s'));
      jardin::set_potager_non_run(init('object_id'));
      ajax::success();
    }

    
    if (init('action') == 'refresh_all_semis') {
      $plugin = plugin::byId('jardin');
      $eqLogics = eqLogic::byType($plugin->getId());
      foreach ($eqLogics as $eqLogic) {
				if($eqLogic->getIsEnable()){
          $eqLogic->set_etat();
        }
        $type=$eqLogic->getConfiguration('type');
        if($type == 'semence'){
          $eqLogic->migrationV2_data();
        }

      }
      ajax::success();
    }

	if (init('action') == 'init_all_semis') {
      $plugin = plugin::byId('jardin');
      $eqLogics = eqLogic::byType($plugin->getId());
      foreach ($eqLogics as $eqLogic) {
				if($eqLogic->getIsEnable()){
          $eqLogic->init_semis();
        }

      }
      ajax::success();
    }
} catch (Exception $e) {
    ajax::error(displayException($e), $e->getCode());
}
