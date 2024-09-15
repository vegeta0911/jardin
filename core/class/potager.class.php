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

/* * ***************************Includes********************************* */
require_once __DIR__  . '/../../../../core/php/core.inc.php';
if (!class_exists('MoonPhase2')) { require_once __DIR__ . '/class.MoonPhase.php'; }

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class potager extends eqLogic {

   public function refresh(){
      if($this->getIsEnable() == 0){
			return false;
		}

   }

   public function debug(){
      log::add('potager', 'debug', '> debug');
      potager::whatMoon();//->notifications_ns(true);
      //potager::cronHourly();
      // $liste_arrosage=$this->getConfiguration('liste_arrosage');
      // //$this->lancer_timer_arrosage($liste_arrosage[0],1);
      // $this->refresh_all_cron_start_all_arrosage();
      // //potager::extract_equipement_jeedom_from_txt($liste_arrosage[0]['liste_cd_fin'][0]);
   }

   // Moon
   public static function whatMoon() {
      $moon = new Solaris\MoonPhase2();
      $age = round($moon->age(),1); // age de la lune en jour
      $phase = round($moon->phase(),2); //0 et 1 nouvelle lune, 0,5 pleine lune
      $illumination = round($moon->illumination(),2);
      $distance = round($moon->distance(),2);


      $etat = $moon->phase_name();
      
      log::add('potager', 'debug', '----whatMoon----');
      log::add('potager', 'debug', 'Phase Lune ' . $phase);
      log::add('potager', 'debug', 'Age Lune ' . $age);
      log::add('potager', 'debug', 'illumination ' . $illumination);
      log::add('potager', 'debug', 'distance ' . $distance);
      log::add('potager', 'debug', 'name ' . $etat);

      $imgL=1;
      if($phase>=0.25 & $phase<0.4){
         $imgL=2;
      }
      if($phase>=0.4 & $phase<0.5){
         $imgL=3;
      }
      if($phase==0.5){
         $imgL=4;
      }
      if($phase>0.5 & $phase<0.6){
         $imgL=5;
      }
      if($phase>=0.6 & $phase<0.75){
         $imgL=6;
      }
      if($phase>=0.75){
         $imgL=7;
      }

      if($phase>=0.5){
         $phase="Décroissante";
      }else{
         $phase="Croissante";
      }
      // $this->checkAndUpdateCmd('moon:phase', $phase);
      // $this->checkAndUpdateCmd('moon:age', $age);
      // $this->checkAndUpdateCmd('moon:illumination', $illumination);
      // $this->checkAndUpdateCmd('moon:distance', $distance);
      // $this->checkAndUpdateCmd('moon:name', $name);
      $result=array("phase"=>$phase , "age"=>$age, "illumination"=>$illumination, "distance"=>$distance, "etat"=>$etat,"imgL"=>"lune" . $imgL . ".png");
      return $result;
  }



   




   




//parcours les declencheurs et s'assure que 1 est bien validé
public function check_start_arrosage(){
   if($this->getIsEnable() == 0){
      return;
   }
   log::add('potager', 'debug', '> check_start_arrosage : ' . $this->getHumanName() . '');
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   if($liste_arrosage == ''){
      log::add('potager', 'debug', '> check_start_arrosage : ' . $this->getHumanName() . ' aucun arrosage pour cet équipement');
      return;
   }

   foreach($liste_arrosage as $key => $un_arrosage){
      $result=$this->check_start_one_arrosage($un_arrosage,$key);
   }
}

public function check_start_one_arrosage($un_arrosage,$key){
   foreach($un_arrosage['liste_declencheur'] as $cond_debut){
      $cond_debutT=$cond_debut;
      if(is_array($cond_debutT)){
         $cond_debutT=$cond_debutT['cmd'];
      }
      log::add('potager', 'debug', '   > check_start_one_arrosage : ' . $this->getHumanName() . ' - condition  : '.$cond_debutT);
      $resultat = jeedom::evaluateExpression($cond_debutT);
      log::add('potager', 'debug', '   > check_start_one_arrosage : ' . $this->getHumanName() . ' resultat : '  .$resultat);

      if($resultat == 1){
         log::add('potager', 'debug', '   > check_start_one_arrosage : ' . $this->getHumanName() . ' > Condition de start OK !');
         $this-> start_arrosage($un_arrosage,$key);
         return true;
      }
   }
   log::add('potager', 'debug', '   > check_start_one_arrosage : ' . $this->getHumanName() . ' > Condition de start KO !');
   return false;
}

public function start_arrosage($un_arrosage,$key,$mode_force=false, $timer_manual = false){
   log::add('potager', 'debug', '> start_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);
   if($this->getIsEnable() == 0){
      return;
   }
   
   log::add('potager', 'debug', '> start_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);
   if($this->get_etat_arrosage($un_arrosage['id']) == 'on'||$this->get_etat_arrosage($un_arrosage['id']) == 'manual'){
      log::add('potager', 'debug', '> start_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' est déja "on" (par sécu on relance le On)');
      //return;
   }
   log::add('potager', 'info', '> DEMARRAGE DE L\'ARROSAGE : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);
   //on vérifie les annuleur de start
   if($mode_force==false){
      log::add('potager', 'debug', '   > check_start_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' - Vérification des "annulateurs" de démarrage de l arrosage...');
      $annulation=false;
      foreach($un_arrosage['liste_an_declencheur'] as $annulateur){
         $annulateurT=$annulateur;
         if(is_array($annulateurT)){
            $annulateurT=$annulateurT['cmd'];
         }
         log::add('potager', 'debug', '    > start_arrosage - annuleur de start: ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' - condition  : '.$annulateurT);
         
         $resultat = jeedom::evaluateExpression($annulateurT);
         
         log::add('potager', 'debug', '    > start_arrosage - annuleur de start : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' resultat : '  .$resultat);
         if($resultat == 1){
            log::add('potager', 'debug', '   ====> start_arrosage - annuleur de start: ' . $this->getHumanName() . ' ' . $un_arrosage['nom']. ' > Annulation START !');
            $annulation=true;
         }
      }
   
      if($annulation){
         return;
      }
   }
   

   log::add('potager', 'debug', '   > check_start_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' - Lancements des commandes de démarrage de l arrosage...');
   foreach($un_arrosage['liste_start'] as $action_on){
      log::add('potager', 'debug', '      > start_arrosage - execution de la commande : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']. ' > ' . $action_on['cmd']);
      $this->execute_comande($action_on);
   }

   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   $liste_arrosage[$key]=$un_arrosage;
   $this->setConfiguration('liste_arrosage',$liste_arrosage);
   $this->save();

   log::add('potager', 'debug', '> check_start_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' - Set etat arrosage ON - '  .$un_arrosage['id']);
   $this->set_etat_arrosage($un_arrosage['id'], $timer_manual === false ? 'on' : 'manual',$un_arrosage['conso_arrosage'] );


   //s'il y a un timer, on le lance
   if($timer_manual != false && $timer_manual != 0){
      $timer_num=intval(jeedom::evaluateExpression($timer_manual));
      $this->lancer_timer_arrosage($un_arrosage,$timer_num);
   } else if($timer_manual === false && $un_arrosage['timer'] != ''){
      $timer_num=intval(jeedom::evaluateExpression($un_arrosage['timer']));
      $this->lancer_timer_arrosage($un_arrosage,$timer_num);
   }
   
}


//parcours les declencheurs de stop et s'assure que 1 est bien validé (et que l'arrosage soit en cours !)
public function check_stop_arrosage(){
   if($this->getIsEnable() == 0){
      return;
   }
   log::add('potager', 'debug', '> check_stop_arrosage : ' . $this->getHumanName() . '');
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   if($liste_arrosage == ''){
      log::add('potager', 'debug', '> check_stop_arrosage : ' . $this->getHumanName() . ' aucun arrosage pour cet équipement');
      return;
   }


   foreach($liste_arrosage as $key => $un_arrosage){
      $this->check_stop_one_arrosage($un_arrosage,$key);
   }
}

public function check_stop_one_arrosage($un_arrosage,$key){
   if($this->get_etat_arrosage($un_arrosage['id']) == 'on'||$this->get_etat_arrosage($un_arrosage['id']) == 'manual'){
      log::add('potager', 'debug', '   > check_stop_arrosage : ' . $this->getHumanName() . ' - ' . $un_arrosage['nom'] . ' est en cours de fonctionnement');
      foreach($un_arrosage['liste_cd_fin'] as $cond_fin){
         $cond_finT=$cond_fin;
         if(is_array($cond_finT)){
            $cond_finT=$cond_finT['cmd'];
         }
         //log::add('potager', 'debug', '   > check_stop_arrosage : ' . $this->getHumanName() . ' - condition  : '.$cond_fin);
         $resultat = jeedom::evaluateExpression($cond_finT);
         
         if($resultat == 1){
            log::add('potager', 'debug', '   > check_stop_arrosage : ' . $this->getHumanName() . ' > Condition de stop OK !');
            $this->stop_arrosage($un_arrosage,$key);
            return true;
         }
      }
   }
   log::add('potager', 'debug', '   > check_stop_arrosage : ' . $this->getHumanName() . ' > Condition de stop KO !');
   return false;

}

public function get_etat_arrosage($id_arrosage){
   if($id_arrosage == ''){
      return 'null'; //id null
   }
   $liste_cf_arrosage=$this->getConfiguration('liste_cf_arrosage');
   foreach($liste_cf_arrosage as $key => $une_cf_arrosage){
      if($une_cf_arrosage['id'] == $id_arrosage){
         return $une_cf_arrosage['etat'];
      }
   }

   //not found -> set to off
   log::add('potager', 'debug', '   > get_etat_arrosage : ' . $id_arrosage . ' > not found, set to off !');
   $this->set_etat_arrosage($id_arrosage,'off');
   return 'off'; //not found
}



public function set_etat_arrosage($id_arrosage,$etat='off', $conso=0){
   if($id_arrosage == ''){
      log::add('potager', 'debug', '> set_etat_arrosage : ' . $this->getHumanName() . ' > id_arrosage empty !');
      return false; //id null
   }
   $liste_cf_arrosage=$this->getConfiguration('liste_cf_arrosage');
   foreach($liste_cf_arrosage as $key => $une_cf_arrosage){
      if($une_cf_arrosage['id'] == $id_arrosage){
         $une_cf_arrosage['etat']=$etat;
         $liste_cf_arrosage[$key] = $une_cf_arrosage;
         $this->setConfiguration('liste_cf_arrosage',$liste_cf_arrosage);

         $etat_b=0;
         if($etat=='on'){
            $etat_b=1;
         } else if($etat=='manual'){
            $etat_b=2;
         }
         $this->checkAndUpdateCmd('etat_arrosage_#' . $id_arrosage,$etat_b);
         $this->checkAndUpdateCmd('conso_arrosage_#' . $id_arrosage,$conso);
      
         $this->save();
         log::add('potager', 'debug', '> set_etat_arrosage : ' . $this->getHumanName() . ' > id_arrosage found in conf ! '  .$id_arrosage . ' set to ' . $etat);
         return true;
      }
   }

   if($liste_cf_arrosage == ''){
      $liste_cf_arrosage=[];
   }

   //si not found, on ajoute 
   $une_cf=[];
   $une_cf['id']=$id_arrosage;
   $une_cf['etat']=$etat;
   $liste_cf_arrosage[]=$une_cf;
   $this->setConfiguration('liste_cf_arrosage',$liste_cf_arrosage);
   $this->save();

   log::add('potager', 'debug', '> set_etat_arrosage : ' . $this->getHumanName() . ' > id_arrosage not found in conf - added  ! '  .$id_arrosage . ' set to ' . $etat);
   return true; //not found
}
public function del_conf_arrosage($id_arrosage){
   if($id_arrosage == ''){
      return false; //id null
   }
   $liste_cf_arrosage=$this->getConfiguration('liste_cf_arrosage');
   foreach($liste_cf_arrosage as $key => $une_cf_arrosage){
      if($une_cf_arrosage['id'] == $id_arrosage){
         $une_cf_arrosage['etat']=$etat;
         unset($liste_cf_arrosage[$key]);
         $this->setConfiguration('liste_cf_arrosage',$liste_cf_arrosage);

         $liste_cf_arrosage = array_values($liste_cf_arrosage);

         $this->save();
         return true;
      }
   }

   return false; //not found
}
public function refresh_conf_arrosage(){
   log::add('potager', 'debug', '> refresh_conf_arrosage');
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   $liste_cf_arrosage=array_values($this->getConfiguration('liste_cf_arrosage'));
   //log::add('potager', 'debug', '> liste_cf_arrosage count ' . count($liste_cf_arrosage));
   //log::add('potager', 'debug', '> liste_arrosage count ' . count($liste_arrosage));

   foreach($liste_cf_arrosage as $key => $une_cf_arrosage){
      //log::add('potager', 'debug', '> une_cf_arrosage');
      $id_found=false;
      foreach($liste_arrosage as $key => $un_arrosage){
         if($un_arrosage['id'] == $une_cf_arrosage['id']){
            $id_found=true;
         }
      }
      if($id_found==false){//ancien arrosage a supprimer
         $this-> del_conf_arrosage($une_cf_arrosage['id']);
      }
   }

//log::add('potager', 'debug', '> liste_arrosage count ' . count($liste_arrosage));
   foreach($liste_arrosage as $key => $un_arrosage){
      $id_found=false;
      foreach($liste_cf_arrosage as $key => $une_cf_arrosage){
         if($un_arrosage['id'] == $une_cf_arrosage['id']){
            $id_found=true;
         }
      }

      if($id_found==false){
         $this-> set_etat_arrosage($un_arrosage['id'],'off');
      }
   }


}

public function get_arrosage_by_id($id){
   $result=[];
   $liste_arrosage=array_values($this->getConfiguration('liste_arrosage'));
   foreach($liste_arrosage as $key => $un_arrosage){
      if($un_arrosage['id'] == $id){
         $result['key']=$key;
         $result['arrosage']=$un_arrosage;
         return $result;
      }
   }

   return null;
}

public function unset_all_cron_start_all_arrosage(){
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      $this->unset_all_cron_start_one_arrosage($un_arrosage);
   }
}
public function unset_all_cron_start_one_arrosage($un_arrosage){
   log::add('potager', 'debug', '> unset_all_cron_start_one_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);

   $options=[];
   $options['potager_id']=$this->getId();
   $options['arrosage_id']=$un_arrosage['id'];
   

   $i=0;
   do{
      $options['index_cron']=$i;
      $cron = cron::byClassAndFunction('potager', 'cron_start_arrosage', $options);
      if (is_object($cron)) {
         $cron->remove(false);
         log::add('potager', 'debug', '    > unset_all_cron_start_one_arrosage : remove cron index : ' . $i);
      }
      $i++;
   }while(is_object($cron));
}



public function set_all_cron_start_one_arrosage($un_arrosage){
   log::add('potager', 'debug', '> set_all_cron_start_one_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);

   foreach($un_arrosage['liste_programmation'] as $key=>$un_cron_start){
      $options=[];
      $options['potager_id']=$this->getId();
      $options['arrosage_id']=$un_arrosage['id'];
      $options['index_cron']=$key;
      $cron = cron::byClassAndFunction('potager', 'cron_start_arrosage', $options);
      if (is_object($cron)) {
         $cron->remove(false);
      }

      $cron = new cron();
      $cron->setClass('potager');
      $cron->setFunction('cron_start_arrosage');
      $cron->setOption($options);
      //$_next = strtotime($_next);
      $cron->setSchedule($un_cron_start);
      //$cron->setOnce(1);
      $cron->save();
      log::add('potager', 'debug', '> set_all_cron_start_one_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . '- cron index ' .  $key);
   }
   
}

public function refresh_all_cron_start_one_arrosage($un_arrosage){
   $this->unset_all_cron_start_one_arrosage($un_arrosage);
   $this->set_all_cron_start_one_arrosage($un_arrosage);
}

public function refresh_all_cron_start_all_arrosage(){
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      $this->refresh_all_cron_start_one_arrosage($un_arrosage);
   }
}

public function stop_all_arrosage(){
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      $this->stop_arrosage($un_arrosage,$key);
   }
}
public function start_all_arrosage(){
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      $this->start_arrosage($un_arrosage,$key);
   }
}

public function stop_all_timer_all_arrosage(){
   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      $this->stop_timer_arrosage($un_arrosage);
   }
}

public function execute_comande($action){
   $options = array();
   if(is_array($action)===false){
      log::add('potager', 'debug', '      > exec_comande : mode compatibilité');
      $action=array("cmd"=>$action , "options"=>null);
   }
   if (isset($action['options'])) {
      $options = $action['options'];
   }
   log::add('potager', 'debug', '      > exec_comande : ' . $action['cmd']);
   scenarioExpression::createAndExec('action', $action['cmd'], $options);
}

public function stop_arrosage($un_arrosage,$key){ //force utiliser pour forcer l'arrosage ou commande via timer atteint
   if($this->getIsEnable() == 0){
      return;
   }
   log::add('potager', 'debug', '> stop_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);
   $this->stop_timer_arrosage($un_arrosage);
   if($this->get_etat_arrosage($un_arrosage['id']) == 'off'){
      log::add('potager', 'debug', '> stop_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' est déja "off"');
      //return;
   }

   log::add('potager', 'info', '> ARRET DE L\'ARROSAGE : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);
   log::add('potager', 'debug', '> stop_arrosage - execution de la commande : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']. ' > Execution des commandes d arret de l arrosage ...');
   foreach($un_arrosage['liste_end'] as $action_off){
      log::add('potager', 'debug', '   > stop_arrosage - execution de la commande : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']. ' > ' . $action_off['cmd']);
      $this->execute_comande($action_off);


   }

   $liste_arrosage=$this->getConfiguration('liste_arrosage');
   $liste_arrosage[$key]=$un_arrosage;
   $this->setConfiguration('liste_arrosage',$liste_arrosage);
   $this->save();

   $this->set_etat_arrosage($un_arrosage['id'],'off');
}

public function stop_timer_arrosage($un_arrosage){
   log::add('potager', 'debug', '> stop_timer_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom']);
   $options=[];
   $options['potager_id']=$this->getId();
   $options['arrosage_id']=$un_arrosage['id'];
   $cron = cron::byClassAndFunction('potager', 'timer_stop', $options);
   if (is_object($cron)) {
      log::add('potager', 'debug', '    > stop_timer_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' => Remove TIMER OK !');
      $cron->remove(false);
   }else{
      log::add('potager', 'debug', '    > stop_timer_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' => No timer found !');
   }

}

public function lancer_timer_arrosage($un_arrosage,$duration=0){
   log::add('potager', 'debug', '> lancer_timer_arrosage : ' . $this->getHumanName() . ' ' . $un_arrosage['nom'] . ' - duration : ' . $duration);
   $_next=date('Y-m-d H:i:s', strtotime('+' . round($duration) . ' min ' . date('Y-m-d H:i:s')));

   $options=[];
   $options['potager_id']=$this->getId();
   $options['arrosage_id']=$un_arrosage['id'];
   $cron = cron::byClassAndFunction('potager', 'timer_stop', $options);
   if (is_object($cron)) {
      $cron->remove(false);
   }
   if($duration==0){
      return;
   }
   $cron = new cron();
   $cron->setClass('potager');
   $cron->setFunction('timer_stop');
   $cron->setOption($options);
   $_next = strtotime($_next);
   $cron->setTimeout(20*60); //max arrosage de 20H ! 
   $cron->setSchedule(cron::convertDateToCron($_next));
   $cron->setOnce(1);
   $cron->save();
}

public static function cron_start_arrosage($_option){
   //$el_potager = potager::byId($_option['potager_id']);
   $el_potager=potager::get_potager_check_non_run($_option['potager_id'],true,'cron_start_arrosage');
   if (is_object($el_potager) && $el_potager->getIsEnable() == 1) {
      log::add('potager', 'debug', '> cron_start_arrosage : ' . $el_potager->getHumanName());
   }else{
      log::add('potager', 'debug', '> cron_start_arrosage : potager not found or desactivate');
      return;
   }

   log::add('potager', 'debug', '> Sécurité , on attend 5sec pour éviter les telescopages"');
   sleep(5);

   $liste_arrosage=$el_potager->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      if($un_arrosage['id'] == $_option['arrosage_id']){
         log::add('potager', 'debug', '> cron_start_arrosage : ' . $el_potager->getHumanName() . ' arrosage a démarrer via déclencheur trouvé (via CRON)! -> '  .$_option['arrosage_id']);
         $el_potager->start_arrosage($un_arrosage,$key);
         potager::set_potager_non_run($_option['potager_id']);
         return;
      }
   }
   potager::set_potager_non_run($_option['potager_id']); 
}

public static function listener_start($_option){
   //$el_potager = potager::byId($_option['potager_id']);
   $el_potager=potager::get_potager_check_non_run($_option['potager_id'],true,'listener_start');
   if (is_object($el_potager) && $el_potager->getIsEnable() == 1) {
      log::add('potager', 'debug', '> listener_start : ' . $el_potager->getHumanName());
   }else{
      log::add('potager', 'debug', '> listener_start : potager not found or desactivate');
      return;
   }
   $liste_arrosage=$el_potager->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      if($un_arrosage['id'] == $_option['arrosage_id']){
         log::add('potager', 'debug', '> listener_start : ' . $el_potager->getHumanName() . ' arrosage a démarrer via déclencheur trouvé !');
         $el_potager->check_start_one_arrosage($un_arrosage,$key);
         potager::set_potager_non_run($_option['potager_id']);
         return;
      }
   }
   log::add('potager', 'debug', '> listener_start : ' . $el_potager->getHumanName() . ' arrosage a arreter via timer non trouvé !');
   potager::set_potager_non_run($_option['potager_id']);
}

public static function listener_stop($_option){
   //$el_potager = potager::byId($_option['potager_id']);
   $el_potager=potager::get_potager_check_non_run($_option['potager_id'],true,'listener_stop');
   if (is_object($el_potager) && $el_potager->getIsEnable() == 1) {
      log::add('potager', 'debug', '> listener_stop : ' . $el_potager->getHumanName());
   }else{
      log::add('potager', 'debug', '> listener_stop : potager not found or desactivate');
      return;
   }
   $liste_arrosage=$el_potager->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      if($un_arrosage['id'] == $_option['arrosage_id']){
         log::add('potager', 'debug', '> listener_stop : ' . $el_potager->getHumanName() . ' arrosage a arreter via declencheur trouvé !');
         $el_potager->check_stop_one_arrosage($un_arrosage,$key);
         potager::set_potager_non_run($_option['potager_id']);
         return;
      }
   }
   log::add('potager', 'debug', '> listener_stop : ' . $el_potager->getHumanName() . ' arrosage a arreter via timer non trouvé !');
   potager::set_potager_non_run($_option['potager_id']);
}

public static function get_potager_check_non_run($id,$set_run=true,$detail_run='generic run'){
   log::add('potager', 'debug', '> get_potager_check_non_run : ' . $id);
   $el_potager = potager::byId($id);
   if (is_object($el_potager) && $el_potager->getIsEnable() == 1) {
      log::add('potager', 'debug', '   > found : ' . $el_potager->getHumanName());
   }else{
      log::add('potager', 'debug', '   > NOT found');
      return;
   }
   
   $is_running=$el_potager->getConfiguration('is_running');
   $nbr_try=0;
   while($is_running != ''){
      $nbr_try++;
      if($nbr_try>=60){
         log::add('potager', 'error', '   > Processus POTAGER arrosage bloqué : ' . $id . ' - ' . $is_running);
         return; //error
      }
      log::add('potager', 'debug', '   > RUN en cours : ' . $is_running);
      sleep(2);
      $el_potager = potager::byId($id);
      $is_running=$el_potager->getConfiguration('is_running');
   }

   if($set_run){
      $el_potager->setConfiguration('is_running',$detail_run);
      $el_potager->save();
   }
   return $el_potager;
}

public static function set_potager_non_run($id){
   log::add('potager', 'debug', '> set_potager_non_run : ' . $id);
   $el_potager = potager::byId($id);
   if (is_object($el_potager) && $el_potager->getIsEnable() == 1) {
      //do nothing
   }else{
      log::add('potager', 'debug', '   > NOT found');
      return;
   }
   $el_potager->setConfiguration('is_running','');
   $el_potager->save();
}

public static function timer_stop($_option){
   //$el_potager = potager::byId($_option['potager_id']);
   $el_potager=potager::get_potager_check_non_run($_option['potager_id'],true,'timer_stop');
   if (is_object($el_potager) && $el_potager->getIsEnable() == 1) {
      log::add('potager', 'debug', '> timer_stop : ' . $el_potager->getHumanName());
   }else{
      log::add('potager', 'debug', '> timer_stop : potager not found or desactivate');
      return;
   }

   $liste_arrosage=$el_potager->getConfiguration('liste_arrosage');
   foreach($liste_arrosage as $key => $un_arrosage){
      if($un_arrosage['id'] == $_option['arrosage_id']){
         log::add('potager', 'debug', '> timer_stop : ' . $el_potager->getHumanName() . ' arrosage a arreter via timer trouvé !');
         $el_potager->stop_arrosage($un_arrosage,$key);
         potager::set_potager_non_run($_option['potager_id']);
         return;
      }
   }
   log::add('potager', 'debug', '> timer_stop : ' . $el_potager->getHumanName() . ' arrosage a arreter via timer non trouvé !');
   potager::set_potager_non_run($_option['potager_id']);
}

public function set_listeners_one_arrosage($un_arrosage,$action){ //$action : start (declencheur) - stop 
   log::add('potager', 'debug', '   > set_listeners_one_arrosage ' . $action . ' - ' . $un_arrosage['id']);
   $options=[];
   $options['potager_id']=$this->getId();
   $options['arrosage_id']=$un_arrosage['id'];

   $listener = listener::byClassAndFunction('potager', 'listener_' . $action, $options);
   if (!is_object($listener)) {
       $listener = new listener();
   }
   $listener->setClass('potager');
   $listener->setFunction('listener_' . $action);
   $listener->setOption($options);
   $listener->emptyEvent();

   $declencheurs=[];
   if($action == 'start'){
      $declencheurs=$un_arrosage['liste_declencheur'];
   }
   if($action == 'stop'){
      $declencheurs=$un_arrosage['liste_cd_fin'];
   }
   $ids_declencheur=potager::extract_equipement_jeedom_from_array($declencheurs);
   foreach($ids_declencheur as $one_id){
      log::add('potager', 'debug', '      > ID LISTENER  ' . $one_id);
      $listener->addEvent($one_id);
   }
   $listener->save();
   
   if(count($ids_declencheur) == 0){
      $listener->remove();
      log::add('potager', 'debug', '       > set_listeners_one_arrosage finaly remove because no item inside !');
   }else{
      log::add('potager', 'debug', '       > set_listeners_one_arrosage ok !');
   }
}
   

   

   

   public function unset_listeners_one_arrosage($arrosage){
      log::add('potager', 'debug', '   > unset_listeners_one_arrosage ' . $un_arrosage['id']);
      $options=[];
      $options['potager_id']=$this->getId();
      $options['arrosage_id']=$un_arrosage['id'];
      $listener = listener::byClassAndFunction('potager', 'listener_start', $options);
      if (is_object($listener)) {
         $listener->remove();
      }

      $listener = listener::byClassAndFunction('potager', 'listener_stop' . $action, $options);
      if (is_object($listener)) {
         $listener->remove();
      }
   }


   public function set_all_listeners_all_arrosage(){
      log::add('potager', 'debug', '> set_all_listeners_all_arrosage');
      $liste_arrosage=$this->getConfiguration('liste_arrosage');
      foreach($liste_arrosage as $un_arrosage){
         $this->set_listeners_one_arrosage($un_arrosage,'start');
         $this->set_listeners_one_arrosage($un_arrosage,'stop');
      }
   }

   public function unset_all_listener_all_arrosage(){
      log::add('potager', 'debug', '> unset_all_listener_all_arrosage');
      $liste_arrosage=$this->getConfiguration('liste_arrosage');
      foreach($liste_arrosage as $un_arrosage){
         $this->unset_listeners_one_arrosage($un_arrosage);
      }
   }

   public function refresh_all_listener_arrosage(){
      log::add('potager', 'debug', '> refresh_all_listener_arrosage');
      $this->unset_all_listener_all_arrosage();
      $this->set_all_listeners_all_arrosage();
   }

   public static function extract_equipement_jeedom_from_array($array){
      $result=[];
      foreach($array as $un_el){
         $one_result_array=potager::extract_equipement_jeedom_from_txt($un_el['cmd']);
         foreach($one_result_array as $one_result){
            $result[]=$one_result;
         }
      }
      return $result;
   }
   public static function extract_equipement_jeedom_from_txt($txt){
      $result=[];
      $position_d=0;
      log::add('potager', 'debug', '> extract_equipement_jeedom_from_txt : ' . $txt);
      //return $result;
      do {
         $ps=strpos($txt,'#',$position_d);
         log::add('potager', 'debug', '   > ps : ' . $ps);
         if($ps !==false){
            $pe=strpos($txt,'#',($ps + 1));
            if($pe !==false){
               $position_d=$pe+1;

               $un_equipement_jeedom = substr ( $txt , $ps , ($pe-$ps + 1) ) ;
               log::add('potager', 'debug', '   > id : ' . $un_equipement_jeedom);
               $result[]=$un_equipement_jeedom;
            }else{
               $position_d=$position_d+1;
            }
         }
     } while ($ps !== false);
     return $result;
   }


   public static function get_nbr_info_s($year=null){
      $plugin = plugin::byId('potager');
      $eqLogics = eqLogic::byType($plugin->getId());

      $result=[];
      foreach($eqLogics as $eqlogic){
         if($eqlogic->getConfiguration('type') != 'semence'){
            continue;
         }
         $result[]=$eqlogic->get_nbr_info($year);
      }

      return $result;
   }

   public function get_nbr_info($year=null){
      if($year==null){
         $year=date('Y');
      }
      $get_nbr_wt=$this->get_nbr_wt($year);
      log::add('potager', 'debug', '> e1 ' . $get_nbr_wt['d_semis']);
      $result=array("id"=>$this->getId(),"d_semis" => $get_nbr_wt['d_semis'],"d_plantation" => $get_nbr_wt['d_plantation'],"d_recolte" => $get_nbr_wt['d_recolte'],"d_rempotage" => $get_nbr_wt['d_rempotage']);
      log::add('potager', 'debug', '> e fin');
      return $result;
   }


   public function get_nbr_wt($year=null) //type : 'd_semis' 'd_plantation' 'd_recolte' etc
   {
      log::add('potager', 'debug', '> e1 s');
      $resultA=array("d_semis"=>0,"d_plantation"=>0,"d_recolte"=>0,"d_rempotage"=>0);
      if($year==null){
         $year=date('Y');
      }
      $type_s=$this->getConfiguration('type');
      if($type_s != 'semence'){
         return $resultA;
      }
      $liste_semis=$this->getConfiguration('liste_semis');
      log::add('potager', 'debug', '> e2');
      foreach ($resultA as $type=>$res) {
         $aucun_semis=false;
         $result=0;
         log::add('potager', 'debug', '> e3 ' . $type);
         if($liste_semis != ''){
            foreach ($liste_semis as $un_semis) {
               if(array_key_exists($type,$un_semis)==false){
                  continue;
               }
               if(date("Y", strtotime($un_semis[$type])) == $year ){
                  $qte_ass='qte_seme';
                  if($type=='d_semis'){
                     $qte_ass='qte_seme';
                  }
                  if($type=='d_plantation'){
                     $qte_ass='qte_plante';
                  }
                  if($type=='d_recolte'){
                     $qte_ass='poid_recolte';
                  }
                  if($type=='d_rempotage'){
                     $qte_ass='qte_rempote';
                  }
                  $result=$result + intval ($un_semis[$qte_ass]);
               }
            }
            if(count($liste_semis) == 0){
               $aucun_semis=true;
            }
         }else{
            $aucun_semis=true;
         }
         


         if($aucun_semis){
            if($type=='d_semis'){
               $resultA[$type]=$this->getConfiguration('quantite');
            }
            if($type=='d_plantation'){
               $resultA[$type]=$this->getConfiguration('quantite_plante');
            }
            if($type=='d_recolte'){
               $resultA[$type]=$this->getConfiguration('poid_recolte');
            }
         }else{
            $resultA[$type]=$result;
         }
      }
      log::add('potager', 'debug', '> e3 ' . json_encode($resultA));
      return $resultA;
   }


   public function get_nbr($type='d_semis',$year=null) //type : 'd_semis' 'd_plantation' 'd_recolte' etc
   {
      if($year==null){
         $year=date('Y');
      }
      $type_s=$this->getConfiguration('type');
      if($type_s != 'semence'){
         return 0;
      }
      $liste_semis=$this->getConfiguration('liste_semis');
      $aucun_semis=false;
      $result=0;
      if($liste_semis != ''){
         foreach ($liste_semis as $un_semis) {
            if(array_key_exists($type,$un_semis)==false){
               continue;
            }
            if(date("Y", strtotime($un_semis[$type])) == $year ){
               $qte_ass='qte_seme';
               if($type=='d_semis'){
                  $qte_ass='qte_seme';
               }
               if($type=='d_plantation'){
                  $qte_ass='qte_plante';
               }
               if($type=='d_recolte'){
                  $qte_ass='poid_recolte';
               }
               if($type=='d_rempotage'){
                  $qte_ass='qte_rempote';
               }
               $result=$result + intval ($un_semis[$qte_ass]);
            }
         }
         if(count($liste_semis) == 0){
            $aucun_semis=true;
         }
      }else{
         $aucun_semis=true;
      }
      


      if($aucun_semis){
         if($type=='d_semis'){
            return $this->getConfiguration('quantite');
         }
         if($type=='d_plantation'){
            return $this->getConfiguration('quantite_plante');
         }
         if($type=='d_recolte'){
            return $this->getConfiguration('poid_recolte');
         }
      }else{
         return $result;
      }
   }





   public function getName($clean_affichage=false,$detail=false){
      $type=$this->getConfiguration('type');
      if($type == 'potager'){
         return parent::getName();
      }
      if($type == 'lune'){
         return parent::getName();
      }
      $nom=parent::getName();

      $ind=strpos($nom,'@');
      if($ind!==false && $clean_affichage){
         $nom=substr($nom,0,$ind);
      }

      if($detail){
         $nom = $nom . ' ' . $this->getConfiguration('detail'). ' ' . $this->getConfiguration('couleur'). ' ' . $this->getConfiguration('culture');
      }

      return $nom;

   }

   public static function  stripAccents($stripAccents){
      return strtr($stripAccents,'àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ','aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY');
   }


   public static function cmp($a, $b) 
{
   $type_a=$a->getConfiguration('type');
   $type_b=$b->getConfiguration('type');
   //en premier les lunes
   if($type_a == 'lune' && $type_b != 'lune'){
      return false;
   }
   if($type_b == 'lune' && $type_a != 'lune'){
      return true;
   }

   //en second les potagers
   if($type_a == 'potager' && $type_b != 'potager'){
      return false;
   }
   if($type_b == 'potager' && $type_a != 'potager'){
      return true;
   }

   

   $qtea=$a->getConfiguration('quantite');
   $qteb=$b->getConfiguration('quantite');
   //log::add('potager', 'debug', 'TRIE ' . $a->getName());
   // if($a->getName() == 'thym'){
   //    log::add('potager', 'debug', 'TRIE ' . $a->getName() . ' - "' . $qtea . '" ' . $a->getConfiguration('quantite_plante'));
   // }

   if($qtea == 0 || $qtea == ''){
      //log::add('potager', 'debug', 'TRIE qte_plante ' . $a->getName());
      $qtea=$a->getConfiguration('quantite_plante');
   }
   if($qteb == 0 || $qteb == ''){
      $qteb=$b->getConfiguration('quantite_plante');
   }
   
   if($qtea == ''){
      $qtea=0;
   }
   if($qteb == ''){
      $qteb=0;
   }
   if($qtea != 0 && $qteb == 0){
      return ($qtea < $qteb);
   }

   if($qteb != 0 && $qtea == 0){
      return ($qtea < $qteb);
   }

   

   $nom_a=potager::stripAccents(strtolower($a->getName()));
   $nom_b=potager::stripAccents(strtolower($b->getName()));
   
    return (strcmp ($nom_a,$nom_b));
}

//pour ajax
public function get_info(){
   $type=$this->getConfiguration('type');
   if($type == 'potager'){
      $options=$this->getConfiguration('options');
      $w=$this->getConfiguration('width');
      $h=$this->getConfiguration('height');
      $un_potager=array("id" => $this->getId(),"nom" => $this->getName(),"options"=>$options,"w"=>$w,"h"=>$h);
      return $un_potager;
   }


   $qte=$this->getConfiguration('quantite');
   if($qte == ''){
      $qte='0';
   }
   $semis=array();
   $semis_terre=array();
   $recolte=array();
   $detail=$this->getConfiguration('detail');
   $culture=$this->getConfiguration('culture');
   $origine=$this->getConfiguration('origine');
   $couleur=$this->getConfiguration('couleur');
   $lieu_culture=$this->getConfiguration('lieu_culture');
   $ensoleillement=$this->getConfiguration('ensoleillement');
   $distance_plantation=$this->getConfiguration('distance_plantation');
   $arrosage=$this->getConfiguration('arrosage');

   $couleur=$this->getConfiguration('couleur');
   $quantite_totale=$this->getConfiguration('quantite_totale');

   $date_achat=$this->getConfiguration('date_achat');
   $cycle_vie=$this->getConfiguration('cycle_vie');
   $nature_sol=$this->getConfiguration('nature_sol');
   $climat=$this->getConfiguration('climat');
   $latin=$this->getConfiguration('latin');
   $v_coureuse=$this->getConfiguration('v_coureuse');
   $v_precoce=$this->getConfiguration('v_precoce');
   $palissage =$this->getConfiguration('palissage');
   $scarification=$this->getConfiguration('scarification');
   $croissance=$this->getConfiguration('croissance');
   $poid_recolte=$this->getConfiguration('poid_recolte');
   $quantite_germe=$this->getConfiguration('quantite_germe');
   $pincer=$this->getConfiguration('pincer');
   $buter=$this->getConfiguration('buter');
   $ia=$this->getConfiguration('ia');

   $grimpant=$this->getConfiguration('grimpant');
   $feuillage=$this->getConfiguration('feuillage');
   $rusticite=$this->getConfiguration('rusticite');

   $nom_origine=$this->getConfiguration('nom_origine');

   $t_min_supporte=$this->getConfiguration('t_min_supporte');
   $t_rusticite=$this->getConfiguration('t_rusticite');
   $liste_semis=$this->getConfiguration('liste_semis');

   $type_semence=$this->getConfiguration('l_type');

   for($i=0;$i<12;$i++){
      $semis[]=($this->getConfiguration('semis_' . $i) == 1);
      $semis_terre[]=($this->getConfiguration('semis_terre_' . $i) == 1);
      $recolte[]=($this->getConfiguration('recolte_' . $i) == 1);
   }

   $une_semence=array("id" => $this->getId(),"nom" => $this->getName(true),"ia"=> $ia,"type_semence"=> $type_semence,"quantite"=>$qte,"img"=>$this->getPathImgIcon(),"type"=>"semence","semis"=>$semis,"semis_terre"=>$semis_terre,"recolte"=>$recolte,"variete"=>$detail,"couleur"=>$couleur,"origine"=>$origine,"culture"=>$culture,"ensoleillement"=>$ensoleillement,"distance_plantation"=>$distance_plantation,"arrosage"=>$arrosage,"lieu_culture"=>$lieu_culture,"date_achat"=>$date_achat,"cycle_vie"=>$cycle_vie,"nature_sol"=>$nature_sol,"climat"=>$climat,"latin"=>$latin,"v_coureuse"=>$v_coureuse,"v_precoce"=>$v_precoce,"palissage"=>$palissage,"scarification"=>$scarification,"croissance"=>$croissance,"poid_recolte"=>$poid_recolte,"quantite_germe"=>$quantite_germe,"quantite_totale"=>$quantite_totale,"pincer"=>$pincer,"buter"=>$buter,"grimpant"=>$grimpant,"feuillage"=>$feuillage,"rusticite"=>$rusticite,"t_min_supporte"=>$t_min_supporte,"t_rusticite"=>$t_rusticite,"nom_origine"=>$nom_origine,"liste_semis"=> $liste_semis);
   return $une_semence;
}

  



   public function getPathImgIcon(){

      $path='plugins/potager/data/img/';

      $type=$this->getConfiguration('type');
      if($type == 'potager'){
         return $path . 'potager.png';
      }
      
      if($type == 'lune'){
         return 'plugins/potager/data/img/lune/' . $this->getConfiguration('img_lune');//todo
      }

      $img='semence.png';

      $etat='Non planté';

      $liste_semis=$this->getConfiguration('liste_semis');
      
      if($liste_semis != ''){
         $liste_semis=array_values($liste_semis);
         if(count($liste_semis) > 0){
            $last_semis=$liste_semis[count($liste_semis)-1];
            if(array_key_exists('d_semis',$last_semis)==false){
               return $path . $img;
            }
            $date_semis=$last_semis['d_semis'];
            $date_terre=$last_semis['d_plantation'];
            $date_recolte=$last_semis['d_recolte'];
   
            if($date_semis != ''){
               $img='godet.png';
      
               $date_semis=str_replace("/","-",$date_semis);
               $diff_jour=(strtotime(date('d-m-Y')) - strtotime($date_semis))/86400;
               //log::add('potager', 'debug', '> diff : ' . $diff_jour);
      
               if($diff_jour >= 10){
                  $img='godet_germe.png';
               }
      
            }
   
            if($date_terre != ''){
               $img='terre.png';
      
               if($date_semis != ''){
                  $date_terre=$date_semis;
               }
               $date_terre=str_replace("/","-",$date_terre);
               $diff_jour=(strtotime(date('d-m-Y')) - strtotime($date_terre))/86400;
               if($diff_jour >= 10){
                  $img='terre_germe.png';
               }
            }
   
            if($date_recolte != ''){
               $img='recolte.png';
            }
         }
         


      }




      return $path . $img;
   }



   public function init_semis(){
      $liste_semis=[];
      $this->setConfiguration('liste_semis',$liste_semis);
      $this->save();
      $this->set_etat();
   }

  

   public function set_etat(){ 
      $type=$this->getConfiguration('type');
      if($type == 'potager'){
         return false;
      }
      if($type == 'lune'){
         return false;
      }
      $etat='Non planté';
      $liste_semis=$this->getConfiguration('liste_semis');
      if($liste_semis == ''){
         log::add('potager', 'debug', '   > liste_semis vide');
         $this->checkAndUpdateCmd('etat',$etat);
         $this->save();
         return false;
      }

      $last_semis=$liste_semis[count($liste_semis)-1];

      $date_jour = new DateTime("now");

      if($last_semis['d_semis'] != ''){
         if(strtotime($last_semis['d_semis']) >= $date_jour){
            $etat='Semé';
         }
      }

      if($last_semis['d_plantation'] != ''){
         if(strtotime($last_semis['d_plantation']) >= $date_jour)  {
            $etat='Planté';
         }
      }

      if($last_semis['d_eclaircissage'] != ''){
         if(strtotime($last_semis['d_eclaircissage']) >= $date_jour) {
            $etat='Eclairci';
         }
      }

      if($last_semis['d_recolte'] != ''){
         if(strtotime($last_semis['d_recolte']) >= $date_jour) {
            $etat='Récolté';
         }
      }

      log::add('potager', 'debug', '   > etat : ' . $etat);

      $this->checkAndUpdateCmd('etat',$etat);
      //$this->save();
   }
    /*     * *************************Attributs****************************** */
    
  /*
   * Permet de définir les possibilités de personnalisation du widget (en cas d'utilisation de la fonction 'toHtml' par exemple)
   * Tableau multidimensionnel - exemple: array('custom' => true, 'custom::layout' => false)
	public static $_widgetPossibility = array();
   */
    
    /*     * ***********************Methode static*************************** */

    /*
     * Fonction exécutée automatiquement toutes les minutes par Jeedom
      public static function cron() {
      }
     */

    /*
      //Fonction exécutée automatiquement toutes les 5 minutes par Jeedom
      public static function cron5() {

      }
      */

    /*
     * Fonction exécutée automatiquement toutes les 10 minutes par Jeedom
      public static function cron10() {
      }
     */
    
    /*
     * Fonction exécutée automatiquement toutes les 15 minutes par Jeedom
      public static function cron15() {
      }
     */
    
    /*
     * Fonction exécutée automatiquement toutes les 30 minutes par Jeedom
      public static function cron30() {
      }
     */
    
    //Fonction exécutée automatiquement toutes les heures par Jeedom
      public static function cronHourly($force_mode=false) {
         potager::notifications();
         $heure=intval(date("G"));

            $plugin = plugin::byId('potager');
            $eqLogics = eqLogic::byType($plugin->getId());

            foreach ($eqLogics as $eqLogic) {
               if($eqLogic->getIsEnable() == false){
                  continue;
               }
               if($eqLogic->getIsEnable() == false){
                  continue;
               }
   
               $type=$eqLogic->getConfiguration('type');
               if($type == 'potager'){
                  continue;
               }
               if($type == 'lune'){
                  $eqLogic->refresh_lune(true);
                  continue;
               }

               if($type == 'semence'){
                  $notifs=$eqLogic->notifications_ns($force_mode);
                  if($notifs['notif_tache'] != ''){
                     log::add('potager', 'debug', '   > notif_tache : '  .$notifs['notif_tache']);
                     potager::send_notifications('[potager] &#x1F343 &#x0A;Rappel de taches : &#x0A;' . $notifs['notif_tache']);
                  }
               }

            }
         
      }

      //ATTENTION NON STATIC
      public function cronHourly_ns() {
         //log::add('potager','debug','test cron OK');
         return $this->notifications_ns();
      }

      public function notifications_ns($force_mode=false){
         $eqLogic=$this;
         $result=array("notif_semis"=>"","notif_met"=>"","notif_recolte"=>"","notif_peremption"=>"","notif_tache"=>"");
         

          setlocale(LC_TIME, 'fra_fra');
          $heure=intval(date("G"));
          $mois=intval(date("n"));
          $jour=intval(date("j"));


         //on envoi pas de mail avant 9H du mat
         if($heure != 9 && $force_mode==false){
            return;
         }

         if($this->getIsEnable() == false){
            return;
         }


         $type=$this->getConfiguration('type');
         if($type == 'potager'){
            return;
         }
         if($type == 'lune'){
            return;
         }

         $nom = $this->getName(true,false);
         $detail = $this->getConfiguration('detail');

         $liste_achat = $this->getConfiguration('liste_achat');
         if($liste_achat != ''){
            foreach ($liste_achat as $key => $un_achat) {
               $date_peremption=$un_achat['date_peremption'];
               if(strlen($date_peremption) != 10){
                  $date_peremption='';
               }
               if(substr($date_peremption,6,4) != date('Y')){
                  $date_peremption='';
                  log::add('potager', 'debug', '   > date_peremption année pas bonne ' . $date_peremption);
               }
               if($date_peremption != ''){
                  //log::add('potager', 'debug', '   > date_peremption non null ' . $date_peremption_mois);
                     $date_peremption_mois=intval(substr($date_peremption,3,2));
                     if(config::byKey('notif_peremption', __CLASS__) == 1 && $date_peremption_mois==$mois &&  $jour==1){
                        log::add('potager', 'debug', '   > Notif péremption semence');
      
                        $result['notif_peremption']=$nom . ' ' . $detail;
                        //potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' date de péremption imminente ! (ce mois ci)');
                     }
               }
            }
         }

         

         if(config::byKey('notif_semis', __CLASS__) == 1 && $date_semis='' && $eqLogic->getConfiguration('semis_' . ($mois -2)) == 0 && $eqLogic->getConfiguration('semis_' . ($mois -1)) == 1 && $jour==1){
            log::add('potager', 'debug', '   > Notif Semis');
            //potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' entre en période de semis');
            $result['notif_semis']=$nom . ' ' . $detail;
         }
         if(config::byKey('notif_semis_terre', __CLASS__)== 1 &&$eqLogic->getConfiguration('semis_terre_' . ($mois -2)) == 0 && $eqLogic->getConfiguration('semis_terre_' . ($mois -1)) == 1 && $jour==1){
            log::add('potager', 'debug', '   > Notif Semis terre');
            //potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' entre en période de mise en terre');
            $result['notif_met']=$nom . ' ' . $detail;
         }
         if(config::byKey('notif_recolte', __CLASS__)== 1 &&$eqLogic->getConfiguration('recolte_' . ($mois -2)) == 0 && $eqLogic->getConfiguration('recolte_' . ($mois -1)) == 1 && $jour==1){
            log::add('potager', 'debug', '   > Notif Recolte');
            //potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' entre en période de récolte');

            $result['notif_recolte']=$nom . ' ' . $detail;
         }


         //on regarde désormais les taches
         $liste_tache=$this->getConfiguration('liste_tache');
         if($liste_tache != ''){
            foreach($liste_tache as $une_tache){
               if($une_tache['alert']===false){
                  continue;
              }
              try {
               $dateTache=$une_tache['date'];
               $dateTache_d=date_create_from_format('Y-m-d',$dateTache);
               $dateJour=new Datetime();//date_create_from_format('Y-m-d','2022-06-30');
               $type=$une_tache['type_plan_tache'];
               log::add('potager', 'debug', '   > dateTache : "' . $type . '" - ' . $dateTache);
               $diff_date = date_diff($dateTache_d, $dateJour);
               log::add('potager', 'debug', '   > diff jour ' . intval($diff_date->format('%d')));
               
               if($dateTache_d == ''){
                  $type='';
               }
               
               
               $result_ok=false;

               //log::add('potager', 'debug', '   > type tache : '  .$type);
               
               if($type==''){
                  if(intval($diff_date->format('%d')) == 0 && intval($diff_date->format('%m')) == 0 && intval($diff_date->format('%y')) == 0){
                     $result_ok=true;
                  }
               }

               $indJ=strrpos($type,'j');
               if($indJ !==false){
                  $nbr=intval(substr($type,0,$indJ));
                  if($dateJour >= $dateTache_d && intval($diff_date->format('%d')) % $nbr === 0){
                     //log::add('potager', 'debug', '       > modulo jour ok');
                     $result_ok=true;
                  }
               }
               log::add('potager', 'debug', '   > e2');
               $indJ=strrpos($type,'s');
               if($indJ !==false){
                  $nbr=intval(substr($type,0,$indJ));
                  $diff_w=intval($diff_date->format('%d'))/7;
                  log::add('potager', 'debug', '   > diff_w : ' . $diff_date->format('%d') . ' - ' . $diff_w);
                  if($diff_w - intval($diff_w) ==0){
                     
                     if($dateJour >= $dateTache_d && $diff_w % $nbr === 0){
                        //log::add('potager', 'debug', '       > modulo sem ok');
                        $result_ok=true;
                     }
                  }
                  
               }
               $indJ=strrpos($type,'m');
               if($indJ !==false){
                  $nbr=intval(substr($type,0,$indJ));
                  if($dateJour >= $dateTache_d && intval($diff_date->format('%m')) % $nbr === 0){
                     //log::add('potager', 'debug', '       > modulo mois ok');
                     $result_ok=true;
                  }
               }

               $indJ=strrpos($type,'a');
               log::add('potager', 'debug', '   > ind année : ' . $indJ);
               if($indJ !==false){
                  $nbr=intval(substr($type,0,$indJ));
                  if($dateJour >= $dateTache_d && intval($diff_date->format('%y')) % $nbr === 0 && intval($diff_date->format('%d'))==0 && intval($diff_date->format('%m'))==0){
                     //log::add('potager', 'debug', '       > modulo an ok');
                     $result_ok=true;
                  }
               }

               if($result_ok){
                  log::add('potager', 'debug', '   > result_ok : tache to rappel');
                  if($result['notif_tache'] == ''){
                        $result['notif_tache']=$nom . ' ' . $detail . ' : ';
                  }else{
                        $result['notif_tache']=$result['notif_tache'] . ' , ';
                  }
                  $commentaire=$une_tache['commentaire'];
                  if($commentaire != ''){
                     $commentaire=' (' . $commentaire . ') ';
                  }
                  $result['notif_tache']=$result['notif_tache'] . $une_tache['nom'] . $commentaire . ' ';
               }
            } catch (Exception $e) {
               //log::add('potager', 'debug', '   > errer');
               continue;
            }
              
            }
         }
         log::add('potager', 'debug', $result['notif_tache']);
         log::add('potager', 'debug', '=============FIN CRON Notifications NS=================');
         return $result;


      }

      public static function notifications(){
         log::add('potager', 'debug', '=============CRON Notifications=================');

          setlocale(LC_TIME, 'fra_fra');
          $heure=intval(date("G"));
          $mois=intval(date("n"));
          $jour=intval(date("j"));





         if($heure != 9){
            return;
         }

         $plugin = plugin::byId('potager');
         $eqLogics = eqLogic::byType($plugin->getId());
         $notif_semis="";
         $notif_met="";
         $notif_recolte="";
         foreach ($eqLogics as $eqLogic) {
            if($eqLogic->getIsEnable() == false){
               continue;
            }
            if($eqLogic->getIsEnable() == false){
               continue;
            }

            $type=$eqLogic->getConfiguration('type');
            if($type == 'potager'){
               continue;
            }
            if($type == 'lune'){
               continue;
            }

            $nom = $eqLogic->getName(true,false);
            $detail = $eqLogic->getConfiguration('detail');


            //date_peremption
            $liste_achat = $eqLogic->getConfiguration('liste_achat');
            if($liste_achat != ''){
               foreach ($liste_achat as $key => $un_achat) {
                  $date_peremption=$un_achat['date_peremption'];
                  if(strlen($date_peremption) != 10){
                     $date_peremption='';
                  }
                  if(substr($date_peremption,6,4) != date('Y')){
                     $date_peremption='';
                     log::add('potager', 'debug', '   > date_peremption année pas bonne ' . $date_peremption);
                 }
                 if($date_peremption != ''){
                  //log::add('potager', 'debug', '   > date_peremption non null ' . $date_peremption_mois);
                     $date_peremption_mois=intval(substr($date_peremption,3,2));
                     if(config::byKey('notif_peremption', __CLASS__) == 1 && $date_peremption_mois==$mois &&  $jour==1){
                        log::add('potager', 'debug', '   > Notif péremption semence');
                        potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' date de péremption imminente ! (ce mois ci)');
                     }
                 }
               }
            }


            

            if( config::byKey('notif_semis', __CLASS__) == 1 && $date_semis='' && $eqLogic->getConfiguration('semis_' . ($mois -2)) == 0 && $eqLogic->getConfiguration('semis_' . ($mois -1)) == 1 && $jour==1){
               log::add('potager', 'debug', '   > Notif Semis');
               //potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' entre en période de semis');
               if($notif_semis != ''){
                  $notif_semis=$notif_semis.',&#x0A;';
               }
               $notif_semis=$notif_semis . $nom . ' ' . $detail;
            }
            if(config::byKey('notif_semis_terre', __CLASS__)== 1 &&$eqLogic->getConfiguration('semis_terre_' . ($mois -2)) == 0 && $eqLogic->getConfiguration('semis_terre_' . ($mois -1)) == 1 && $jour==1){
               log::add('potager', 'debug', '   > Notif Semis terre');
               //potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' entre en période de mise en terre');
               if($notif_met != ''){
                  $notif_met=$notif_met.',&#x0A;';
               }
               $notif_met=$notif_met . $nom . ' ' . $detail;
            }
            if(config::byKey('notif_recolte', __CLASS__)== 1 &&$eqLogic->getConfiguration('recolte_' . ($mois -2)) == 0 && $eqLogic->getConfiguration('recolte_' . ($mois -1)) == 1 && $jour==1){
               log::add('potager', 'debug', '   > Notif Recolte');
               //potager::send_notifications('[potager] &#x1F343 ' . $nom . ' ' . $detail . ' entre en période de récolte');
               if($notif_recolte != ''){
                  $notif_recolte=$notif_recolte.',&#x0A;';
               }
               $notif_recolte=$notif_recolte . $nom . ' ' . $detail;

            }

         }

         $texte_notif='';

         if($notif_recolte != '' || $notif_met != '' || $notif_semis != ''){
            if($notif_semis != ''){
               $texte_notif=$texte_notif.'Les semences entrant en période de semis : &#x0A;' . $notif_semis . '	&#x0A;&#x0A;';
            }
            if($notif_met != ''){
               $texte_notif=$texte_notif.'&#127806; Les semences entrant en période de mise en terre : &#x0A;' . $notif_met. '	&#x0A;&#x0A;';
            }
            if($notif_recolte != ''){
               $texte_notif=$texte_notif.'&#129530; Les semences entrant en période de récolte : &#x0A;' . $notif_recolte. '	&#x0A;&#x0A;';
            }
         }
         if($texte_notif != ''){
            potager::send_notifications('[potager] &#x1F343 &#x0A;&#x0A;' . $texte_notif);
         }

         log::add('potager', 'debug', '=============FIN CRON Notifications=================');
      }

      

      public static function send_notifications($message = 'Erreur message potager',$titre = 'Potager'){
         $messagerie = config::byKey('messagerie', __CLASS__);

         log::add('potager', 'debug', 'send_notifications : ' . $titre . ' - ' . strlen($message));

         if($messagerie == ''){
            log::add('potager', 'debug', 'cmd messagerie vide !');
            return;
         }
         $cmd=cmd::byString($messagerie);
         log::add('potager', 'debug', 't1');

         $i=0;
         do{
             log::add('potager', 'debug', 'té');
             $i++;
             $maxl=strlen($message)-($i-1)*4000;
             log::add('potager', 'debug', 't3');
             if($maxl > 4000){
                $maxl=4000;
             }
             $message_t=substr($message,($i-1)*4000,$maxl);
             $cmd->execCmd($options=array('title'=>"$titre", 'message'=> "$message_t"), $cache=0);
         
         }while (strlen($message) > 4000 * $i);

      }
         
        


    /*
     * Fonction exécutée automatiquement tous les jours par Jeedom
      public static function cronDaily() {
      }
     */



    /*     * *********************Méthodes d'instance************************* */
    
 // Fonction exécutée automatiquement avant la création de l'équipement 
    public function preInsert() {
        
    }

 // Fonction exécutée automatiquement après la création de l'équipement 
    public function postInsert() {
        
    }

 // Fonction exécutée automatiquement avant la mise à jour de l'équipement 
    public function preUpdate() {
        
    }

 // Fonction exécutée automatiquement après la mise à jour de l'équipement 
    public function postUpdate() {
        
    }

    private function recherche_element($texte,$str_d,$str_e){
      log::add('potager', 'debug', '> recherche_element');
      $texte = str_replace(array("\r\n", "\r", "\n","\t"), "", $texte);
      $is=strpos($texte,$str_d);
      log::add('potager', 'debug', '> is ' . $is);
      log::add('potager', 'debug', '> str_e ' . $str_e);
      if($is !== false){
          $ie=strpos($texte,$str_e,$is);
          log::add('potager', 'debug', '> ie ' . $ie);
          if($ie !== false){
            log::add('potager', 'debug', '> len ' . ($ie-($is + strlen($str_d))));
            log::add('potager', 'debug', '> res ' .substr($texte,($is + strlen($str_d)),($ie-($is + strlen($str_d)))));
              return substr($texte,($is + strlen($str_d)),($ie-($is + strlen($str_d))));
          }
      }
      return 'not found';
  }

    public function refresh_lune($ns=false){

      $result=potager::whatMoon();

      log::add('potager', 'debug', '> refresh_lune ' . $this->getHumanName());
      $endpoint1='https://www.calendrier-lunaire.net/';
      $etat=$result["etat"];
      $phase_lune=$result["phase"];
      $imgL=$result["imgL"];


      


      $this->checkAndUpdateCmd('etat_lune',$etat);
      $this->checkAndUpdateCmd('phase_lune',$phase_lune);

      $this->setConfiguration('img_lune',$imgL);

      if($ns){
         $this->save(false);
      }
      
    }

 // Fonction exécutée automatiquement avant la sauvegarde (création ou mise à jour) de l'équipement 
    public function preSave() {
      $type=$this->getConfiguration('type');
      if($type == 'semence'){
         $this->set_etat();
      }
    }

 // Fonction exécutée automatiquement après la sauvegarde (création ou mise à jour) de l'équipement 
    public function postSave() {
      log::add('potager', 'debug', '> postSave ' . $this->getHumanName());

      $liste_cf_arrosage=$this->getConfiguration('liste_cf_arrosage');
      $type=$this->getConfiguration('type');
      $order = 0;

      if($type == 'semence'){
         $info = $this->getCmd(null, 'etat');
         if (!is_object($info)) {
             $info = new potagerCmd();
             $info->setIsHistorized(1);
         }
         $info->setName(__('Etat semence', __FILE__));
         $info->setLogicalId('etat');
         $info->setEqLogic_id($this->getId());
         $info->setType('info');
         $info->setSubType('string');
         $info->setValue('Non planté');
         $info->setOrder($order++);
         $info->save();
   
         
   
         $action = $this->getCmd(null, 'init');
         if (!is_object($action)) {
             $action = new potagerCmd();
         }
         $action->setName(__('Réinitialiser les semis', __FILE__));
         $action->setLogicalId('init');
         $action->setEqLogic_id($this->getId());
         $action->setType('action');
         $action->setSubType('other');
         $action->setIsVisible(0);
         $action->setOrder($order++);
         $action->save();
      }

      if($type != 'semence'){
         $liste_semis=$this->getConfiguration('liste_semis');
         if($liste_semis != ''){
            $this->setConfiguration('liste_semis','');
            $this->save();
         }
         $liste_tache=$this->getConfiguration('liste_tache');
         if($liste_tache != ''){
            $this->setConfiguration('liste_tache','');
            $this->save();
         }
      }
      if($type == 'lune'){
         $liste_arrosage=$this->getConfiguration('liste_arrosage');
         log::add('potager', 'debug', '> postSave 1 ' . $this->getHumanName());
         if(is_array ($liste_arrosage)){
            log::add('potager', 'debug', '> postSave 2 ' . count($liste_arrosage));
            if(count($liste_arrosage) != 0){
               log::add('potager', 'debug', '> postSave 3 ' . $this->getHumanName());
               $this->setConfiguration('liste_arrosage',[]);
               $this->save();
            }
         }

         $info = $this->getCmd(null, 'etat_lune');
         if (!is_object($info)) {
             $info = new potagerCmd();
             $info->setIsHistorized(1);
         }
         $info->setName(__('Etat lune', __FILE__));
         $info->setLogicalId('etat_lune');
         $info->setEqLogic_id($this->getId());
         $info->setType('info');
         $info->setSubType('string');
         $info->setValue('');
         $info->setOrder($order++);
         $info->save();

         $info = $this->getCmd(null, 'phase_lune');
         if (!is_object($info)) {
             $info = new potagerCmd();
             $info->setIsHistorized(1);
         }
         $info->setName(__('Phase lune', __FILE__));
         $info->setLogicalId('phase_lune');
         $info->setEqLogic_id($this->getId());
         $info->setType('info');
         $info->setSubType('string');
         $info->setValue('');
         $info->setOrder($order++);
         $info->save();

         $this->refresh_lune();
         
      }

      $liste_arrosage=$this->getConfiguration('liste_arrosage');
      foreach($liste_arrosage as $key=>$un_arrosage){
         $id_cmds=[];
         $action = $this->getCmd(null, 'stop_arrosage_#' . $un_arrosage['id']);
         if (!is_object($action)) {
             $action = new potagerCmd();
         }
         $action->setName(__('Arrêter arrosage -' . $un_arrosage['nom'] . '-', __FILE__));
         $action->setLogicalId('stop_arrosage_#' . $un_arrosage['id'] );
         $action->setEqLogic_id($this->getId());
         $action->setType('action');
         $action->setSubType('other');
         $action->setOrder($order++);
         $action->save();
         $id_cmds[]=$action->getId();

         $action = $this->getCmd(null, 'start_arrosage_#' . $un_arrosage['id']);
         if (!is_object($action)) {
             $action = new potagerCmd();
             
         }
         $action->setName(__('Démarrer arrosage -' . $un_arrosage['nom'] . '-', __FILE__));
         $action->setLogicalId('start_arrosage_#' . $un_arrosage['id']);
         $action->setEqLogic_id($this->getId());
         $action->setType('action');
         $action->setSubType('other');
         $action->setOrder($order++);
         $action->save();
         $id_cmds[]=$action->getId();

         $action = $this->getCmd(null, 'etat_arrosage_#' . $un_arrosage['id']);
         $creation=false;
         if (!is_object($action)) {
             $action = new potagerCmd();
             $creation=true;
             $action->setIsHistorized(1);
         }
         $action->setConfiguration('historizeMode','none');
         $action->setName(__('Etat arrosage -' . $un_arrosage['nom'] . '-', __FILE__));
         $action->setLogicalId('etat_arrosage_#' . $un_arrosage['id']);
         $action->setEqLogic_id($this->getId());
         $action->setType('info');
         $action->setSubType('numeric');
         
         $action->setOrder($order++);
         $action->save();
         if($creation){
            $action->event(0);
         }
         $id_cmds[]=$action->getId();

         $action = $this->getCmd(null, 'conso_arrosage_#' . $un_arrosage['id']);
         $creation=false;
         if (!is_object($action)) {
            $action = new potagerCmd();
            $creation=true;
            $action->setIsHistorized(1);
         }
         $action->setConfiguration('historizeMode','none');
         $action->setName(__('Consommation arrosage -' . $un_arrosage['nom'] . '-', __FILE__));
         $action->setLogicalId('conso_arrosage_#' . $un_arrosage['id']);
         $action->setEqLogic_id($this->getId());
         $action->setType('info');
         $action->setSubType('numeric');
         
         $action->setOrder($order++);
         $action->save();
         if($creation){
            $action->event(0);
         }
         $id_cmds[]=$action->getId();

         if (array_key_exists("cmds",$un_arrosage) == false){
            $un_arrosage['cmds']=[];
         }

         $needS=false;
         foreach($id_cmds as $une_cmd){
            $found=false;
            foreach($un_arrosage['cmds'] as $une_cmd_a){
               if($une_cmd_a == $une_cmd){
                  $found=true;
               }
            }

            if($found==false){
               $un_arrosage['cmds'][]=$une_cmd;
               $needS=true;
            }
         }

         if($needS=true){
            $liste_arrosage[$key]=$un_arrosage;
            $this->setConfiguration('liste_arrosage',$liste_arrosage);
         }


      }
      

      if($this->getConfiguration('need_refresh_cron_listener')=='oui'){
         log::add('potager', 'debug', '   > need_refresh_cron_listener OUI');
         $this->setConfiguration('need_refresh_cron_listener','non');
         $this->setConfiguration('is_running','');
         $this->refresh_all_cron_start_all_arrosage();
         $this->refresh_all_listener_arrosage();
         $this->refresh_conf_arrosage();
         $this->save();
         $this->stop_all_arrosage();
      }else{
         log::add('potager', 'debug', '   > need_refresh_cron_listener NON');
      }
    }

    
  

    function dateFR_to_datePHP($dateFR){
       if(strlen($dateFR) != 10){
          return '';
       }
       return substr($dateFR,6,4) . '-' . substr($dateFR,3,2) . '-'  .substr($dateFR,0,2); // 01/01/2020

    }

    public function migration_data(){

      //deblocage de l'ordonnanceur
      $this->setConfiguration('is_running','');
      $this->save(true);

      $type=$this->getConfiguration('type');
      if($type == 'potager'){
         return false;
      }
      if($type == 'lune'){
         return false;
      }

      //migration achat
      $liste_achat=$this->getConfiguration('liste_achat');
      if ($liste_achat == '') {
         $liste_achat=[];
         $un_achat=[];
         $un_achat['origine_achat']=$this->getConfiguration('origine');
         $un_achat['nom_origine']=$this->getConfiguration('nom_origine');
         $un_achat['qte_achat']=$this->getConfiguration('quantite_totale');
         $un_achat['prix_achat']=$this->getConfiguration('prix');
         $un_achat['date_achat']=$this->getConfiguration('date_achat');
         $un_achat['date_peremption']=$this->getConfiguration('date_peremption');

         $liste_achat[]=$un_achat;

         $this->setConfiguration('liste_achat',$liste_achat);
      }


      //migration v2 : semis
      $liste_semis=$this->getConfiguration('liste_semis');

      if ($liste_semis == '') {
         $liste_semis=[];
         $un_semis=[];
         $un_semis['nom']='Migration semis V1';


         $date_cmd = $this->getCmd('info', 'date_semis');
         $date_semis='';
         if (is_object($date_cmd)) {
               $date_semis = $date_cmd->execCmd();
         }

         $date_cmd = $this->getCmd('info', 'date_mise_en_terre');
         $date_semis_terre='';
         if (is_object($date_cmd)) {
               $date_semis_terre = $date_cmd->execCmd();
         }

         $date_cmd = $this->getCmd('info', 'date_eclaircissage');
         $date_eclaircissage='';
         if (is_object($date_cmd)) {
               $date_eclaircissage = $date_cmd->execCmd();
         }

         $date_cmd = $this->getCmd('info', 'date_recolte');
         $date_recolte='';
         if (is_object($date_cmd)) {
               $date_recolte = $date_cmd->execCmd();
         }
         $un_semis['d_semis']=$this->dateFR_to_datePHP($date_semis);
         $un_semis['d_eclaircissage']=$this->dateFR_to_datePHP($date_eclaircissage);
         $un_semis['d_plantation']=$this->dateFR_to_datePHP($date_semis_terre);
         $un_semis['d_recolte']=$this->dateFR_to_datePHP($date_recolte);

         $liste_semis[]=$un_semis;

         $this->setConfiguration('liste_semis',$liste_semis);
       }

       $this->save(true);


       $info = $this->getCmd(null, 'date_semis');
         if (is_object($info)) {
            $info->remove();
         }
   
         $info = $this->getCmd(null, 'date_mise_en_terre');
         if (is_object($info)) {
            $info->remove();
         }
   
         $info = $this->getCmd(null, 'date_eclaircissage');
         if (is_object($info)) {
            $info->remove();
         }
   
         $info = $this->getCmd(null, 'date_recolte');
         if (is_object($info)) {
            $info->remove();
         }
   
         $action = $this->getCmd(null, 'm_eclairci');
         if (is_object($action)) {
            $action->remove();
         }
   
         $action = $this->getCmd(null, 'm_semis');
         if (is_object($action)) {
            $action->remove();
         }
   
         $action = $this->getCmd(null, 'm_semis_terre');
         if (is_object($action)) {
            $action->remove();
         }
   
         $action = $this->getCmd(null, 'm_recolte');
         if (is_object($action)) {
            $action->remove();
         }
    }

 // Fonction exécutée automatiquement avant la suppression de l'équipement 
    public function preRemove() {
        $this->unset_all_listener_all_arrosage();
        $this->stop_all_timer_all_arrosage();
        $this->unset_all_cron_start_all_arrosage();
    }

 // Fonction exécutée automatiquement après la suppression de l'équipement 
    public function postRemove() {
        
    }
    public function replace_f($replace,$texte,$champ){
      $champ_p=$this->getConfiguration($champ);
      if($champ_p != ''){
         $replace['#' . $champ . '#'] = '<u>'. $texte . ' :</u> ' . $champ_p;
      }else{
         $replace['#' . $champ . '#'] = '';
      }

      return $replace;
    }

   // Non obligatoire : permet de modifier l'affichage du widget (également utilisable par les commandes)
      public function toHtml($_version = 'dashboard') {
         $type=$this->getConfiguration('type');
         $replace = $this->preToHtml($_version);
         if (!is_array($replace)) {
            return $replace;
         }

         if($type == 'lune'){
            $replace['#img#'] = $this->getPathImgIcon();
            
            $cmd=$this->getCmd(null,'etat_lune');
            $replace['#etat#'] = $cmd->execCmd();

            $cmd=$this->getCmd(null,'phase_lune');
            $replace['#phase2#'] = $cmd->execCmd();

            

            $replace['#nom#'] = $this->getName(true);
            $version = jeedom::versionAlias($_version);
            $version = 'dashboard';
            $html = template_replace($replace, getTemplate('core', $version, 'lune', 'potager'));
            return $html;
         }

         $liste_arrosage = $this->getConfiguration('liste_arrosage');
         if ($type == 'potager' && $liste_arrosage == '') {
            return "";
         }

         $html = "";
         foreach ($liste_arrosage as $key => $un_arrosage) {
            $etat = $this->getCmd(null, 'etat_arrosage_#' . $un_arrosage['id']);

            $replace['#nom#'] = $un_arrosage['nom'];
            $replace['#idArrosage#'] = $un_arrosage['id'];
            $replace['#refresh_id#'] = $etat->getId();

            $version = jeedom::versionAlias($_version);
            $version = 'dashboard';
            if($un_arrosage['visible_arrosage']){
               $html .= template_replace($replace, getTemplate('core', $version, 'arrosage', 'potager'));
            }
         }

         if ($type == 'potager') {
            return $html;
         }

         $replace['#nom#'] = $this->getName(true);
         $replace['#detail#'] = $this->getConfiguration('detail');

         
         $replace=$this->replace_f($replace,'Couleur','couleur');
         $replace=$this->replace_f($replace,'Culture d\'origine','culture');
         $replace=$this->replace_f($replace,'Origine','origine');
         $replace=$this->replace_f($replace,'Ensoleillement','ensoleillement');
         $replace=$this->replace_f($replace,'Distance de plantation','distance_plantation');
         $replace=$this->replace_f($replace,'Hauteur de la plante','hauteur');
         $replace=$this->replace_f($replace,'Arrosage','arrosage');
         $replace=$this->replace_f($replace,'Lieu de culture habituel','lieu_culture');

         $replace['#detail#'] = $this->getConfiguration('detail');
         $replace['#type#'] = '/plugins/potager/data/img/' . $this->getConfiguration('l_type') . '.png';

         $cmd=$this->getCmd(null,'etat');
         $replace['#etat#'] = $cmd->execCmd();
         $replace['#img#'] = $this->getPathImgIcon();
         $qte=$this->getConfiguration('quantite');
         if($qte == ''){
            $qte='-';
         }

         $replace['#qte_semence#']=$qte;
         $version = jeedom::versionAlias($_version);
         $version = 'dashboard';
         $html .= template_replace($replace, getTemplate('core', $version, 'defaut', 'potager'));
         return $html;
      }

      public function dataToWidget($id_eqlogic, $idarrosage)
      {
         $plugin = eqLogic::byId($id_eqlogic);
         $etat = $plugin->getCmd(null, 'etat_arrosage_#' . $idarrosage);
         $conso = $plugin->getCmd(null, 'conso_arrosage_#' . $idarrosage);
         $etatValue = $etat->execCmd();

         //Calcul des conso
         $arrayConso = DB::Prepare('
               SELECT datetime, duree, conso FROM(
                  SELECT datetime, TIMESTAMPDIFF(SECOND, datetime, LAG(datetime) OVER (PARTITION BY cmd_id ORDER BY datetime DESC)) AS duree, TIMESTAMPDIFF(SECOND, datetime, LAG(datetime) OVER (PARTITION BY cmd_id ORDER BY datetime DESC))*value/3600 AS conso FROM (
                        SELECT cmd_id, datetime, value
                        FROM `historyArch` 
                        WHERE `cmd_id` = ' . $conso->getId() . ' AND YEAR(datetime) = ' . date("Y") . '
                     UNION ALL 
                        SELECT cmd_id, datetime, value
                        FROM `history` 
                        WHERE `cmd_id` = ' . $conso->getId() . ' AND YEAR(datetime) = ' . date("Y") . '
                  ) tab1
               )tab2 WHERE conso > 0
               ', NULL, DB::FETCH_TYPE_ALL);

         $ConsoJour = 0;
         $ConsoSemaine = 0;
         $ConsoMois = 0;
         $ConsoAn = 0;
         foreach ($arrayConso as $conso) {
            if (substr($conso['datetime'], 0, 4) == date("Y")) $ConsoAn += $conso['conso'];
            if (substr($conso['datetime'], 0, 7) == date("Y-m")) $ConsoMois += $conso['conso'];
            if (substr($conso['datetime'], 0, 10) == date("Y-m-d")) $ConsoJour += $conso['conso'];
            if (date('W', strtotime($conso['datetime'])) == date('W')) $ConsoSemaine += $conso['conso'];
         }

         $TypeLastArrosage = "";
         if (isset($arrayConso['0']['duree'])) {
            $TypeLastArrosage = DB::Prepare('
                     SELECT CASE value WHEN 1 THEN "Automatic" WHEN 2 THEN "Manual" ELSE "No Data" END AS value
                     FROM (
                        SELECT datetime, value 
                        FROM `historyArch` 
                        WHERE `cmd_id` = ' . $etat->getId() . ' AND Value >0
                        UNION ALL 
                        SELECT datetime, value 
                        FROM `history` 
                        WHERE `cmd_id` = ' . $etat->getId() . ' AND Value >0
                     ) tab1 ORDER BY datetime DESC LIMIT 1
               ', NULL, DB::FETCH_TYPE_ROW)['value'];
         }

         $return = array(
            'img' => $etatValue == 0 ? "plugins/potager/data/img/arrosage/sprinklerOff.png" : "plugins/potager/data/img/arrosage/sprinklerOn.png",
            'DateLastArrosage' => empty($arrayConso['0']['duree']) ? "No Data" : $arrayConso['0']['datetime'],
            'DureeLastArrosage' => empty($arrayConso['0']['duree']) ? "No Data" : convertDuration($arrayConso['0']['duree']),
            'TypeLastArrosage' => empty($arrayConso['0']['duree']) ? "No Data" : $TypeLastArrosage,
            'ConsoLastArrosage' => empty($arrayConso['0']['duree']) ? "No Data" : round($arrayConso['0']['conso']) . " L",
            'ConsoJour' => $ConsoJour < 1000 ? round($ConsoJour) . ' L/Today' : round($ConsoJour / 1000, 1) . ' m3/Today',
            'ConsoSemaine' => $ConsoSemaine < 1000 ? round($ConsoSemaine) . ' L/This Week' : round($ConsoSemaine / 1000, 1) . ' m3/this Week',
            'ConsoMois' => $ConsoMois < 1000 ? round($ConsoMois) . ' L/' . date("M") : round($ConsoMois / 1000, 1) . ' m3/' . date("M"),
            'ConsoAn' => $ConsoAn < 1000 ? round($ConsoAn) . ' L/' . date("Y") : round($ConsoAn / 1000, 1) . ' m3/' . date("Y"),
         );
         return $return;
      }
    /*
     * Non obligatoire : permet de déclencher une action après modification de variable de configuration
    public static function postConfig_<Variable>() {
    }
     */

    /*
     * Non obligatoire : permet de déclencher une action avant modification de variable de configuration
    public static function preConfig_<Variable>() {
    }
     */

    /*     * **********************Getteur Setteur*************************** */
}

class potagerCmd extends cmd {
    /*     * *************************Attributs****************************** */
    
    /*
      public static $_widgetPossibility = array();
    */
    
    /*     * ***********************Methode static*************************** */


    /*     * *********************Methode d'instance************************* */

    /*
     * Non obligatoire permet de demander de ne pas supprimer les commandes même si elles ne sont pas dans la nouvelle configuration de l'équipement envoyé en JS
      public function dontRemoveCmd() {
      return true;
      }
     */

  // Exécution d'une commande  
     public function execute($_options = array()) {
      $eqlogic = $this->getEqLogic();
      if(is_null($eqlogic)){ 
      }
      if(is_object($eqlogic) == false){    
      }
         
      switch ($this->getLogicalId()) {
         case 'refresh': 
            break;

         case 'init': 
            $eqlogic->init_semis();
            break;
      }

      if(strpos($this->getLogicalId(),'stop_arrosage_#') === 0){
         $ps=strpos($this->getLogicalId(),'#');
         $id=substr($this->getLogicalId(),$ps+1,strlen($this->getLogicalId()) - ($ps+1));
         $un_arrosage=$eqlogic->get_arrosage_by_id($id);
         $eqlogic->stop_arrosage($un_arrosage['arrosage'],$un_arrosage['key']);
      }
      if(strpos($this->getLogicalId(),'start_arrosage_#') === 0){
         $ps=strpos($this->getLogicalId(),'#');
         $id=substr($this->getLogicalId(),$ps+1,strlen($this->getLogicalId()) - ($ps+1));
         $un_arrosage=$eqlogic->get_arrosage_by_id($id);
         $eqlogic->start_arrosage($un_arrosage['arrosage'],$un_arrosage['key']);
      }

      // if(strpos($this->getLogicalId(),'etat_arrosage_#') === 0){
      //    $ps=strpos($this->getLogicalId(),'#');
      //    $id=substr($this->getLogicalId(),$ps+1,strlen($this->getLogicalId()) - ($ps+1));
      //    $un_arrosage=$eqlogic->get_arrosage_by_id($id);
      //    //$eqlogic->stop_arrosage($un_arrosage['arrosage'],$un_arrosage['key']);
      // }


     }

    /*     * **********************Getteur Setteur*************************** */
}


