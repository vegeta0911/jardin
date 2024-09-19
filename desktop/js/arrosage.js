function addArrosage(un_arrosage){
    if (init(un_arrosage) == '') {
      return;
    }
    var div = '<div class="col-lg-12 form-horizontal un_arrosage" id_arrosage="' + un_arrosage.id + '">';
    div += ' <a class="btn btn-danger  removeArrosage btn-xs pull-right"><i class="fas fa-minus-circle"></i> Supprimer arrosage</a> ';
    div += ' <a class="btn btn-success btn-xs startArrosage pull-left" id_arrosage="' + un_arrosage.id + '"><i class="fas fa-faucet"></i> Démarrer arrosage</a> ';
    div += ' <a class="btn btn-warning btn-xs stopArrosage pull-left" id_arrosage="' + un_arrosage.id + '"><i class="fas fa-power-off"></i> Arrêter arrosage</a> ';
    div += '<br/><br/><br/>';
    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">{{Nom}}</label>';
    div += '<div class="col-sm-2"  >';
    div += '<input type="text" class=" nom_arrosage form-control" placeholder="{{Nom optionnel de l\'arrosage}}" value="' + un_arrosage.nom + '"/>';
    div += '</div>';
    div += '<label class="checkbox-inline"><input class=" visible_arrosage" type="checkbox"'
    if (un_arrosage.visible_arrosage) div += "checked"
    div += '/>{{Visible}}</label>'
    div += ' </div>';
    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">{{Consommation (L/H)}}</label>';
    div += '<div class="col-sm-2"  >';
    div += '<input type="text" class="conso_arrosage form-control" placeholder="en L/H" value="' + (un_arrosage.conso_arrosage||0)  + '"/>';
    div += '</div>';
    div += ' </div>';
    div += ' <br/>';
    
    div += '<div class="bg-light">';
    div += ' <legend><i class="fas fa-star-of-life"></i> {{Déclencheur}}</legend>';
    div += ' <div class="aide_champ">Si l\'un des déclencheurs/CRON est OK, l\'arrosage sera lancé.</div>';
    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">{{Mode}}</label>';
    div += '<div class="col-sm-2" >';
    div += '<select class=" declencheur  form-control" value="' + un_arrosage.declencheur + '">';
    div += '<option value="cron">{{Programmé (CRON)}}</option>';
    div += '<option value="provoque">{{Provoqué}}</option>';
    div += '<option value="tout">{{Programmé et provoqué}}</option>';
    div += '</select>';
    div += '</div>';
    div += ' <a class="col-sm-2 btn b_add_declencheur " style="display:none"><i class="far fa-plus-square"></i> Ajouter un déclencheur</a> ';
    div += ' <a class="col-sm-2 btn b_add_programmation "><i class="far fa-plus-square"></i> Ajouter une programmation</a> ';
    div += '<br/>';
    div += '</div>';
    div += '</div>';
    div += '<br>';
    
    div += '<div class="bg-light">';
    div += ' <legend><i class="far fa-hand-paper"></i> {{Annulation du déclenchement}}</legend>';
    div += ' <a class="col-sm-2 btn b_add_an_declencheur btn-xs pull-right"><i class="far fa-plus-square"></i> Ajouter annuleur</a> ';
    div += ' <div class="aide_champ">Si l\'une des confitions ci-dessous est validée, le lancement de l\'arrosage sera annulé (ex : Lancer mon arrosage a 8H00 sauf s\'il pleut).</div>';
    div += '<div class="form-group" >';
    div += '<br/>';
    div += '<div class="an_declencheur"></div>';
    div += '</div>';
    div += '</div>';
    div += '<br>';

    div += '<div class="bg-light">';
    div += ' <legend><i class="fas fa-info"></i> {{Condition de fin d\'arrosage}}</legend>';
    div += ' <a class="col-sm-2 btn b_add_timer btn-xs pull-right"><i class="far fa-plus-square"></i> Ajouter un timer</a> ';
    div += ' <a class="col-sm-2 btn b_add_declencheur_fin btn-xs pull-right"><i class="far fa-plus-square"></i> Ajouter un déclencheur de fin</a> ';
    div += ' <div class="aide_champ">Si une seule de ces conditions ci-dessous est validée, alors l\'arrosage sera interrompu. </div>';
    div += '<div class="form-group" >';
    div += '<br/>';
    div += '<div class="cd_fin_arrosage"></div>';
    div += '</div>';
    div += '</div>';
    div += '<br>';
    
    div += '<div class="bg-light">';
    div += ' <legend><i class="fas fa-info"></i> {{Actions pour démarrer l\'arrosage}}</legend>';
    div += ' <a class="col-sm-2 btn b_add_action_start btn-xs pull-right"><i class="far fa-plus-square"></i> Ajouter une action</a> ';
    div += '<div class="form-group" >';
    div += '<br/>';
    div += '<div class="actions_start_arrosage"></div>';
    div += '</div>';
    div += '</div>';
    div += '<br>';

    div += '<div class="bg-light">';
    div += '<legend><i class="fas fa-info"></i> {{Actions pour arrêter l\'arrosage}}</legend>';
    div += ' <a class="col-sm-2 btn b_add_action_stop btn-xs pull-right"><i class="far fa-plus-square"></i> Ajouter une action</a> ';
    div += '<div class="form-group" >';
    div += '<br/>';
    div += '<div class="actions_stop_arrosage"></div>';
    div += '</div>';
    div += '</div>';
    div += '<br>';
  
    div += '</div>';
    $('#l_arrosage').append(div);

    refresh_action_declencheur_select();
    var un_arrosage=$('#l_arrosage').find('.un_arrosage').last();
    refresh_arrosage();

    return un_arrosage;
  
  }

  function refresh_arrosage(){
    $('.delete_date').off().on('click',function(e){
        var d_semis=$(this).prev().val('');
    })
  }

  $('#b_add_arrosage').off('click').on('click', function () {
    modifyWithoutSave=true;
    addArrosage({nom: 'Nouvel arrosage ' + $('.un_arrosage').length,id: get_id_unique(), conso_arrosage: 0, visible_arrosage: true});
  });
  
  $("body").off('click','.removeArrosage').on('click','.removeArrosage',function () {
    var el = $(this);
    var arrosage_el=el.closest('.un_arrosage');

    bootbox.confirm('{{Etes-vous sûr de vouloir supprimer cet arrosage }} ?', function (result) {
      if (result !== false) {
        el.closest('.un_arrosage').remove();
        modifyWithoutSave=true;
        supprimer_arrosage(arrosage_el.attr('id_arrosage'));
      }
    });
  });

  function supprimer_all_arrosage(){
    $('.un_arrosage').each( function(){
      supprimer_arrosage($(this).attr('id_arrosage'));
      $(this).remove();
    })
  }

  function supprimer_arrosage(id_arro){

    var arrosage=current_element.configuration.liste_arrosage.find(element => element.id == id_arro);
    if(arrosage != null){
      arrosage.cmds.forEach( element => remove_cmd(element))
    }
}


  function ajouter_declencheur(un_arrosage,un_declencheur,class_f='',txt='',mode_info=true){
    mode='listCmdInfo'
    aide='"ex : [ ma sonde ] == 1"'
    add_class=''
    if(mode_info == false){
        mode='listCmdAction'
        aide='"ex : [ mon electrovanne ][ON]"'
        add_class='cmdAction'
    }
    if(class_f == null){
        class_f='';
    }

    if(typeof un_declencheur === "string"){
      un_declencheur=un_declencheur.replaceAll('"','&quot;')
      un_declencheur={"cmd" : un_declencheur , "options" : null} //compatibilité
    }
    
    var div = '<div class="form-group un_declencheur_' + class_f + '">';
    div += '<label class="col-sm-2 control-label">{{' + txt + '}}</label>';
    div += '<div class="col-sm-5"  >';
    div += '<div class="input-group">';
    div += '<input data-type="cmd_arrosage" data-l1key="cmd" class="expressionAttr ' + add_class + '  un_declencheur_item form-control" placeholder=' + aide + '/>';
    div += '<span class="input-group-btn">';
    div += '<a class="btn btn-default ' + mode + ' roundedRight"><i class="fas fa-list-alt"></i></a>';
    div += '<a class="btn btn-default cursor jeeHelper roundedRight remove_declencheur"  title="Supprimer">';
    div += '<i class="far fa-trash-alt"></i>';
    div += '</a>';
    div += '</span>';
    div += '</div>';
    div += '</div>';

    div += '<div class="col-sm-5 actionOptions">';
  div += jeedom.cmd.displayActionOption(init(un_declencheur.cmd, ''), un_declencheur.options);
  div += '</div>';

    div += ' </div>';

    var el=un_arrosage.find('.declencheur').last().parent().parent();
    if(class_f!=''){
        el=un_arrosage.find('.' + class_f).last().parent();
    }
    el.after(div)

    console.log('debuggg')
    console.log(un_declencheur)
    el_add=el.parent().find('.form-group').first().next()
    console.log(el_add)
    el_add.setValues(un_declencheur, '.expressionAttr');
    debugA=el;
    debugB=un_declencheur;
  }
debugA=null;
debugB=null;

  function ajouter_programmation(un_arrosage,une_prog){

    if(typeof une_prog === "string"){
      une_prog=une_prog.replaceAll('"','&quot;')
    }

    
    var div = '<div class="form-group une_programmation" >';
    div += '<label class="col-sm-2 control-label">{{Programmation}}</label>';
    div += '<div class="col-sm-7"  >';
    div += '<div class="input-group">';
    div += '<input type="text" class=" une_prog_item form-control" placeholder="{{Cliquer sur ? pour afficher l\'assistant cron}}" value="' + une_prog + '"/>';
    div += '<span class="input-group-btn">';
    div += '<a class="btn btn-default cursor jeeHelper roundedRight" data-helper="cron" title="Assistant cron">';
    div += '<i class="fas fa-question-circle"></i>';
    div += '</a>';
    div += '<a class="btn btn-default cursor jeeHelper roundedRight remove_programmation"  title="Supprimer">';
    div += '<i class="far fa-trash-alt"></i>';
    div += '</a>';
    div += '</span>';
    div += '</div>';
    div += '</div>';
    div += ' </div>';

    var el=un_arrosage.find('.declencheur').last().parent().parent();
    el.after(div)
  }

  function ajouter_timer(un_arrosage,element){
    var div = '<div class="form-group un_timer" >';
    div += '<label class="col-sm-2 control-label">{{Timer (min)}}</label>';
    div += '<div class="col-sm-7"  >';
    div += '<div class="input-group">';
    div += '<input type="test" class=" un_timer_item form-control" placeholder="en min" value="' + element + '"/>';
    div += '<span class="input-group-btn">';
    div += '<a class="btn btn-default cursor jeeHelper roundedRight remove_programmation"  title="Supprimer">';
    div += '<i class="far fa-trash-alt"></i>';
    div += '</a>';
    div += '</span>';
    div += '</div>';
    div += '</div>';
    div += ' </div>';

    var el=un_arrosage.find('.cd_fin_arrosage').last().parent();
    if(el.parent().find('.un_timer').length > 0){
        bootbox.alert('Il y a deja un timer , un seul timer par arrosage !')
    }else{
        el.after(div)
    }
    
  }

  $("body").off('click','.b_add_declencheur_fin').on('click','.b_add_declencheur_fin',function () {
    modifyWithoutSave=true;
    var el = $(this).parent().parent();
    ajouter_declencheur(el,'','cd_fin_arrosage','')
  });
  $("body").off('click','.b_add_timer').on('click','.b_add_timer',function () {
    modifyWithoutSave=true;
    var el = $(this).parent().parent();
    ajouter_timer(el,'')
  });
  $("body").off('click','.b_add_declencheur').on('click','.b_add_declencheur',function () {
    modifyWithoutSave=true;
    var el = $(this).parent().parent();
    ajouter_declencheur(el,'',null,'Déclencheur')
  });
  $("body").off('click','.b_add_an_declencheur').on('click','.b_add_an_declencheur',function () {
    modifyWithoutSave=true;
    var el = $(this).parent().parent();
    ajouter_declencheur(el,'','an_declencheur','')
  });
  $("body").off('click','.b_add_action_start').on('click','.b_add_action_start',function () {
    modifyWithoutSave=true;
    var el = $(this).parent().parent();
    ajouter_declencheur(el,'','actions_start_arrosage','',false)
  });
  $("body").off('click','.b_add_action_stop').on('click','.b_add_action_stop',function () {
    modifyWithoutSave=true;
    var el = $(this).parent().parent();
    ajouter_declencheur(el,'','actions_stop_arrosage','',false)
  });

  $("body").off('click','.startArrosage').on('click','.startArrosage',function () {
    var id_arrosage = $(this).attr('id_arrosage')
    bootbox.prompt({
      title: "Combien de temps (min) voulez vous arroser (0 = pas de timer)?",
      inputType: 'number',
      callback: function (result) {
        if (result !== null && result !== false && result !== "") {
        action_arrosage(id_arrosage,'start',result)
        }
        
      }
    });
  });
  $("body").off('click','.stopArrosage').on('click','.stopArrosage',function () {
    //modifyWithoutSave=true;
    var id_arrosage = $(this).attr('id_arrosage')
    action_arrosage(id_arrosage,'stop')
  });

  function action_arrosage(id_arrosage,action,timer=false){
    
    $.ajax({
        type: 'POST',
        url: '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
          action: 'action_arrosage',
          id: init(current_element.id),
          action_arrosage: init(action),
          id_arrosage: init(id_arrosage),
          timer_manual : init(timer)
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
    })
  }

  
  $("body").off('click','.b_add_programmation').on('click','.b_add_programmation',function () {
    modifyWithoutSave=true;
    var el = $(this).parent().parent();
    ajouter_programmation(el,'')
  });
  $("body").off('click','.remove_programmation').on('click','.remove_programmation',function () {
    modifyWithoutSave=true;
    $(this).parent().parent().parent().parent().remove();
  });
  $("body").off('click','.remove_declencheur').on('click','.remove_declencheur',function () {
    modifyWithoutSave=true;
    $(this).parent().parent().parent().parent().remove();
  });

  function refresh_action_declencheur_select(){
    $('.declencheur').off().on('change',function(){
        one_refresh_action_declencheur_select($(this))
    })
  }


  function one_refresh_action_declencheur_select(select_item){
        $(select_item).parent().parent().find('.b_add_declencheur').show();
        $(select_item).parent().parent().find('.b_add_programmation').show();
        if($(select_item).val() == 'cron'){
            $(select_item).parent().parent().find('.b_add_declencheur').hide();
        }
        if($(select_item).val() == 'provoque'){
            $(select_item).parent().parent().find('.b_add_programmation').hide();
        }
  }
  

  $("body").off('click','.listCmdInfo').on('click','.listCmdInfo', function () {
    var el = $(this).closest('.form-group').find('.un_declencheur_item');
    jeedom.cmd.getSelectModal({cmd: {type: 'info'}}, function (result) {
        if (el.attr('data-concat') == 1) {
        el.atCaret('insert', result.human);
        } else {
        //el.value(el.value() + '  ' + result.human);
        testromain(result,el)
        }
     });
});

function testromain(result,el){
  var expression = $(el)
  var message = getSelectCmdExpressionMessage(result.cmd.subType, result.human)
  bootbox.dialog({
    title: "{{Ajout d'une nouvelle condition}}",
    message: message,
    size: 'large',
    buttons: {
      "{{Ne rien mettre}}": {
        className: "btn-default",
        callback: function() {
          expression.atCaret('insert', result.human)
        }
      },
      success: {
        label: "{{Valider}}",
        className: "btn-primary",
        callback: function() {
          var condition = result.human
          condition += ' ' + $('.conditionAttr[data-l1key=operator]').value()
          if (result.cmd.subType == 'string') {
            if ($('.conditionAttr[data-l1key=operator]').value() == 'matches') {
              condition += ' "/' + $('.conditionAttr[data-l1key=operande]').value()+'/"'
            } else {
              condition += " '" + $('.conditionAttr[data-l1key=operande]').value() + "'"
            }
          } else {
            condition += ' ' + $('.conditionAttr[data-l1key=operande]').value()
          }
          condition += ' ' + $('.conditionAttr[data-l1key=next]').value() + ' '
          expression.atCaret('insert', condition)
          if ($('.conditionAttr[data-l1key=next]').value() != '') {
            el.click()
          }
        }
      }
    }
})
}

$("body").off('click','.listCmdAction').on('click','.listCmdAction', function () {
  var type = $(this).attr('data-type');
    var el = $(this).closest('.form-group').find('.un_declencheur_item');
    jeedom.cmd.getSelectModal({cmd: {type: 'action'}}, function (result) {
        if (el.attr('data-concat') == 1) {
          el.atCaret('insert', result.human);
        } else {
          el.value(el.value() + '  ' + result.human);
        }
        el = el.parent().parent().parent();
        debugC=el;
        jeedom.cmd.displayActionOption(el.value(), '', function (html) {
          el.find('.actionOptions').html(html);
        });
    });
});
$('body').off('focusout','.cmdAction.expressionAttr[data-l1key=cmd]').on('focusout','.cmdAction.expressionAttr[data-l1key=cmd]',function (event) {
  var type = $(this).attr('data-type');
  var expression = $(this).parent().getValues('.expressionAttr');
  var el = $(this).parent().parent().parent();
  console.log(expression)
  debugC=$(this)
  jeedom.cmd.displayActionOption($(this).value(), init(expression[0].options), function (html) {
    el.find('.actionOptions').html(html);
  });
});
debugC=null;

objT=null;
function load_arrosage(_eqLogic){
  objT=_eqLogic;
    $('#l_arrosage').empty();
    if(_eqLogic.configuration == null){
      return
    }
    if (isset(_eqLogic.configuration.liste_arrosage) && _eqLogic.configuration.liste_arrosage != '') {
        for (var i in _eqLogic.configuration.liste_arrosage) {
            var un_arrosage=_eqLogic.configuration.liste_arrosage[i]
            var arrosage=addArrosage(_eqLogic.configuration.liste_arrosage[i]);
            // console.log('arrosage')
            // console.log(un_arrosage)
            var mode=arrosage.find('.declencheur').last()
            debug=un_arrosage
            mode.val(un_arrosage.declencheur);
            (un_arrosage.liste_declencheur).forEach(element => {
              //alert(element)
                ajouter_declencheur(arrosage,element,null,'Déclencheur')
            });
            (un_arrosage.liste_programmation).forEach(element => {
                ajouter_programmation(arrosage,element)
            });
            (un_arrosage.liste_an_declencheur).forEach(element => {
                ajouter_declencheur(arrosage,element,'an_declencheur','')
            });
            (un_arrosage.liste_cd_fin).forEach(element => {
                ajouter_declencheur(arrosage,element,'cd_fin_arrosage','')
            });
            (un_arrosage.liste_start).forEach(element => {
                ajouter_declencheur(arrosage,element,'actions_start_arrosage','',false)
            });
            (un_arrosage.liste_end).forEach(element => {
                ajouter_declencheur(arrosage,element,'actions_stop_arrosage','',false)
            });

            if(un_arrosage.timer != ''){
                ajouter_timer(arrosage,un_arrosage.timer,null,'')
            }

            if(un_arrosage.timer=='' && un_arrosage.liste_cd_fin.length == 0){
              bootbox.alert("ATTENTION : L'arrosage '" + un_arrosage.nom + "' n'a aucune condition de fin d'arrosage ni de timer !");
            }

            one_refresh_action_declencheur_select(arrosage.find('.declencheur').last())
        }

    }

}
function testRom()
{

  save_arrosage(objT);
}
function save_arrosage(_eqLogic){

    _eqLogic.configuration.liste_arrosage = [];
    _eqLogic.configuration.need_refresh_cron_listener='oui'
    $('.un_arrosage').each(function () {
        var un_arrosage={};
        un_arrosage.id=$(this).attr('id_arrosage');
        un_arrosage.nom=$(this).find('.nom_arrosage').last().val();
        un_arrosage.declencheur=$(this).find('.declencheur').last().val();
        un_arrosage.conso_arrosage=$(this).find('.conso_arrosage').last().val();
        un_arrosage.visible_arrosage=$(this).find('.visible_arrosage').last().prop('checked');
        un_arrosage.liste_declencheur=[];
        un_arrosage.liste_programmation=[];
        un_arrosage.liste_an_declencheur=[];
        un_arrosage.liste_start=[];
        un_arrosage.liste_end=[];
        un_arrosage.timer='';
        un_arrosage.liste_cd_fin=[];

        //declencheur
        $(this).find('.un_declencheur_').each( function() {
            //var un_declencheur=$(this).find('.un_declencheur_item').last().val();
            var un_declencheur = $(this).last().getValues('.expressionAttr')[0];
            un_arrosage.liste_declencheur.splice(0, 0, un_declencheur)
        })
        //prog
        $(this).find('.une_programmation').each( function(){
            var une_programmation=$(this).find('.une_prog_item').last().val();
            //var une_programmation = $(this).last().getValues('.expressionAttr')[0];
            un_arrosage.liste_programmation.splice(0, 0, une_programmation) 
        })
        //an declencheur
        $(this).find('.un_declencheur_an_declencheur').each( function(){
            //var un_declencheur_an=$(this).find('.un_declencheur_item').last().val();
            var un_declencheur_an = $(this).last().getValues('.expressionAttr')[0];
            un_arrosage.liste_an_declencheur.splice(0, 0, un_declencheur_an)
        })
        //liste_cd_fin
        $(this).find('.un_declencheur_cd_fin_arrosage').each( function(){
            //var cond_fin=$(this).find('.un_declencheur_item').last().val();
            var cond_fin = $(this).last().getValues('.expressionAttr')[0];
            un_arrosage.liste_cd_fin.splice(0, 0, cond_fin) 
        })

        //actions_start_arrosage
        $(this).find('.un_declencheur_actions_start_arrosage').each( function(){
            //var action=$(this).find('.un_declencheur_item').last().val();
            var action = $(this).last().getValues('.expressionAttr')[0];
            un_arrosage.liste_start.splice(0, 0, action)
        })

        //actions_stop_arrosage
        $(this).find('.un_declencheur_actions_stop_arrosage').each( function(){
            //var action=$(this).find('.un_declencheur_item').last().val();
            var action = $(this).last().getValues('.expressionAttr')[0];
            un_arrosage.liste_end.splice(0, 0, action)
        })

        if($(this).find('.un_timer_item').length == 1){
            un_arrosage.timer=$(this).find('.un_timer_item').last().val();
        }

        
        

        _eqLogic.configuration.liste_arrosage.push(un_arrosage)
    })
    return _eqLogic;
}