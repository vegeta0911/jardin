function create_sample_tache(nom,couleur='#F0B068',date='',type_plan_tache=''){
    modifyWithoutSave=true;
    addTache({nom: nom,id: get_id_unique(),commentaire:'',couleur:couleur,date:date,type_plan_tache:type_plan_tache});
}

$('.b_add_tache_template').off().on('click',function(){
    var el=$(this);
    var date=el.attr('date');
    if(date != '' && date.length==5){
        date=date.replaceAll('/','-')
        date= date.substring(3,5) + '-' + date.substring(0,2);
        
            var datej=new Date()
            date = datej.getFullYear() + '-' + date
        
    }
    var couleur=el.attr('couleur')
    if(couleur == ''){
        couleur='#F0B068'
    }
    create_sample_tache(el.attr('nom'),couleur,date,el.attr('type'))
})

function addTache(une_tache){

    if (init(une_tache) == '') {
      return;
    }
    var div = '<div class="col-lg-12 form-horizontal une_tache" id_tache="' + une_tache.id + '">';
    div += ' <a class="btn btn-danger  removeTache btn-xs pull-right"><i class="fas fa-minus-circle"></i> Supprimer tache</a> ';
    div += '<br/><br/><br/>';

    div += '<div class="bg-light">';
    div += ' <legend><i class="fas fa-star-of-life"></i>Général</legend>';
    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">Nom</label>';
    div += '<div class="col-sm-8"  >';
    div += '<input type="text" class="eqLogicAttr nom_tache form-control" placeholder="Nom de la tache" value="' + une_tache.nom + '"/>';
    div += '</div>';
    div += ' </div>';
    div += ' <br/>';

    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">Commentaire tache</label>';
    div += '<div class="col-sm-8" >';
    div += '<textarea style="" class="eqLogicAttr tache_commentaire form-control" >' + une_tache.commentaire + '</textarea>';
    div += '</div>';
    div += ' </div>';
    div += ' </div>';
    div += ' <br/>';

    div += '<div class="bg-light">';
    div += ' <legend><i class="fas fa-star-of-life"></i>Plannification</legend>';
   
    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">Date tache</label>';
    div += '<div class="col-sm-2"  >';
    div += '<input type="date" class="eqLogicAttr date_tache form-control" value="' + une_tache.date + '"/>';
    div += '</div>';
    div += ' </div>';

    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">Récurence</label>';
    div += '<div class="col-sm-2" >';
    div += '<select class="eqLogicAttr type_plan_tache eqLogicAttr form-control" value="' + une_tache.type_plan_tache + '">';
    div += '<option value="">Aucune</option>';
    div += '<option value="1j">Tous les jours</option>';
    div += '<option value="2j">Un jour sur 2</option>';
    div += '<option value="3j">Un jour sur 3</option>';
    div += '<option value="1s">Toutes les semaines</option>';
    div += '<option value="2s">Une semaine sur 2</option>';
    div += '<option value="3s">Une semaine sur 3</option>';
    div += '<option value="1m">Tous les mois</option>';
    div += '<option value="2m">Un mois sur 2</option>';
    div += '<option value="1a">Tous les ans</option>';
    div += '</select>';
    div += '</div>';
    div += '</div>';

    var def_c='checked';
    if(une_tache.vue_planning==false){
        def_c='';
    }
    

    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">Afficher sur la vue planning</label>';
    div += '<div class="col-sm-2"  >';
    div += ' <label class="checkbox-inline"><input type="checkbox" class="eqLogicAttr une_tache_vue_planning" ' + def_c + ' />Oui</label>';
    div += '</div>';
    div += ' </div>';

    div += '<div class="form-group une_tache_couleur_group" >';
    div += '<label class="col-sm-3 control-label">Couleur</label>';
    div += '<div class="col-sm-2" >';
    div += '<input type="color" class="eqLogicAttr tache_couleur form-control" value="' + une_tache.couleur + '"/>';
    div += '</div>';
    div += '</div>';


    var def_c='checked';
    if(une_tache.alert==false){
        def_c='';
    }
    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">Être alerté le jour de la tache (ou de sa récurrence)</label>';
    div += '<div class="col-sm-2"  >';
    div += ' <label class="checkbox-inline"><input type="checkbox" class="eqLogicAttr une_tache_alert" ' + def_c + ' />Oui</label>';
    div += '</div>';
    div += ' </div>';

    div += '</div>';
    div += '<br>';


   



    div += '</div>';
    $('#l_tache').append(div);
    var une_tacheD=$('#l_tache').find('.une_tache').last();

    
    une_tacheD.find('.type_plan_tache').last().val(une_tache.type_plan_tache)

    if(une_tache.vue_planning==false){
        une_tacheD.find('.une_tache_couleur_group').last().hide()
    }
}
    
$('#b_add_tache').off('click').on('click', function () {
    modifyWithoutSave=true;
    addTache({nom: 'Nouvelle tache ' + $('.une_tache').length,id: get_id_unique(),commentaire:'',couleur:'#F0B068'});
  });

$("body").off('click','.removeTache').on('click','.removeTache',function () {
var el = $(this);
bootbox.confirm('Etes-vous sûr de vouloir supprimer cette tache ?', function (result) {
    if (result !== false) {
        modifyWithoutSave=true;
        el.closest('.une_tache').remove();
    }
});
});

var tmp;
$("body").off('change','.une_tache_vue_planning').on('change','.une_tache_vue_planning',function () {
    var el = $(this);
    tmp=el;
    if(el.is(':checked')){
        el.parent().parent().parent().next().show()
    }else{
        el.parent().parent().parent().next().hide()
    }
    
});
    
function load_tache(_eqLogic){
    
    $('#l_tache').empty();
    if(_eqLogic.configuration == null){
      return
    }
    if (isset(_eqLogic.configuration.liste_tache) && _eqLogic.configuration.liste_tache != '') {
        for (var i in _eqLogic.configuration.liste_tache) {
            var une_tache=_eqLogic.configuration.liste_tache[i]
            
            var une_tache_add=addTache(une_tache);
        }
    }
}

function save_tache(_eqLogic){

    _eqLogic.configuration.liste_tache = [];
    $('.une_tache').each(function () {
        var une_tache={};
        une_tache.id=$(this).attr('id_tache');
        une_tache.nom=$(this).find('.nom_tache').last().val();
        une_tache.couleur=$(this).find('.tache_couleur').last().val();
        une_tache.date=$(this).find('.date_tache').last().val();
        
        une_tache.vue_planning=$(this).find('.une_tache_vue_planning').last().is(':checked')
        une_tache.alert=$(this).find('.une_tache_alert').last().is(':checked')
        

        une_tache.type_plan_tache=$(this).find('.type_plan_tache').last().val();
        une_tache.commentaire=$(this).find('.tache_commentaire').last().val();
        
        _eqLogic.configuration.liste_tache.push(une_tache)
    })
    return _eqLogic;

}