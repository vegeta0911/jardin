<?php 
require_once('../../desktop/php/configuration_potager.php');


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

function skip_accents( $str, $charset='utf-8' ) {
 
  $str = htmlentities( $str, ENT_NOQUOTES, $charset );
  
  $str = preg_replace( '#&([A-za-z])(?:acute|cedil|caron|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $str );
  $str = preg_replace( '#&([A-za-z]{2})(?:lig);#', '\1', $str );
  $str = preg_replace( '#&[^;]+;#', '', $str );
  
  return $str;
}

try {
    require_once dirname(__FILE__) . '/../../../../core/php/core.inc.php';
    include_file('core', 'authentification', 'php');

    if (!isConnect('admin')) {
        throw new Exception(__('401 - Accès non autorisé', __FILE__));
    }



    ob_get_clean();

    //get_info_plan
    if (init('action') == 'get_info_plan') {
      $object = jardin::byId(init('object_id'));
      ajax::success($object->get_info());
    }

    //ajax plan
    if (init('action') == 'save_plan') {
      //$object = potager::byId(init('object_id'));
      $object=jardin::get_potager_check_non_run(init('object_id'),true,'ajax save_plan');
      $object->setConfiguration('width',init('width'));
      $object->setConfiguration('height',init('height'));
      $object->setConfiguration('options',init('options'));

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
        $result[$type_s[$type]]=intval($result[$type_s[$type]])+1;
        
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

    
    
  /* Fonction permettant l'envoi de l'entête 'Content-Type: application/json'
    En V3 : indiquer l'argument 'true' pour contrôler le token d'accès Jeedom
    En V4 : autoriser l'exécution d'une méthode 'action' en GET en indiquant le(s) nom(s) de(s) action(s) dans un tableau en argument
  */  
    ajax::init();



    throw new Exception(__('Aucune méthode correspondante à : ', __FILE__) . init('action'));
    /*     * *********Catch exeption*************** */
} catch (Exception $e) {
    ajax::error(displayException($e), $e->getCode());
}

