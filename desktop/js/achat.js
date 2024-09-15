$('#b_add_achat').off('click').on('click', function () {
    modifyWithoutSave=true;
    add_achat({origine_achat:'',nom_origine:'',commentaire:''});
});

$("body").off('click','.removeAchat').on('click','.removeAchat',function () {
    var el = $(this);
    bootbox.confirm('Etes-vous sûr de vouloir supprimer cet achat ?', function (result) {
        if (result !== false) {
          modifyWithoutSave=true;
          el.closest('.un_achat').remove();
        }
    });
  });

function add_achat(un_achat){
    console.log(un_achat)
    if (init(un_achat) == '') {
        return;
    }
    var div = '<div class="col-lg-12 form-horizontal un_achat">';
    div += ' <a class="btn btn-danger btn-xs removeAchat pull-right"><i class="fas fa-minus-circle"></i> Supprimer achat</a> ';

    div += '<div class="form-group" style="margin-top:35px;">';
        div += '<label class="col-sm-3 control-label">Origine d\'obtention</label>';
        div += '<div class="col-sm-2" >';
        div += '<input type="text" list="origine" class="origine_achat eqLogicAttr form-control"  value="' + un_achat.origine_achat + '"  placeholder="kokopelli / Voisin / ..."/>';
            div += '<datalist id="origine">';
            div += '<option value="Magasin"></option>';
            div += '<option value="Magasin en ligne"></option>';
            div += '<option value="Sur le bon coin"></option>';
            div += '<option value="Ma production"></option>';
            div += '<option value="Un ami"></option>';
            div += '<option value="Le marché"></option>';
            div += '<option value="Un voisin"></option>';
            div += '<option value="Ma famille"></option>';
            div += '</datalist>';
        div += '</div>';

        div += '<label class="col-sm-5 control-label">Nom de l\'origine</label>';
        div += '<div class="col-sm-2"  >';
            div += '<input type="text" class="nom_origine eqLogicAttr form-control"  value="' + un_achat.nom_origine + '" placeholder=""/>';
        div += '</div>';
    div += '</div>';

    div += '<div class="form-group">';
        div += '<label class="col-sm-3 control-label">Quantité totale acquise</label>';
        div += '<div class="col-sm-2"  >';
            div += '<input type="number" class="qte_achat eqLogicAttr form-control"  placeholder="Quantité totale" value="' + un_achat.qte_achat + '"/>';
        div += '</div>';
    div += '</div>';

    div += '<div class="form-group"> ';
        div += '<label class="col-sm-3 control-label">Prix d\'achat</label>';
        div += '<div class="col-sm-2"  style="display:flex;align-items:center">';
            div += '<input type="number" style="text-align:right" class="prix_achat eqLogicAttr form-control"  value="' + un_achat.prix_achat + '" placeholder="prix"/><div style="margin-left :5px">€</div>';
        div += '</div>';
        div += '<label class="col-sm-5 control-label">Date d\'achat</label>';
        div += '<div class="col-sm-2" >';
            div += '<input type="date" class="date_achat eqLogicAttr form-control"  placeholder="" value="' + un_achat.date_achat + '"/>';
        div += '</div>';
    div += '</div>';

    div += '<div class="form-group"> ';
        
        div += '<label class="col-sm-3 control-label">Date de péremption</label>';
        div += '<div class="col-sm-2" >';
            div += '<input type="date" class="date_peremption eqLogicAttr form-control"  placeholder="" value="' + un_achat.date_peremption + '"/>';
        div += '</div>';
        div += '<label class="col-sm-3 control-label"></label>';
        div += '<p class="col-sm-9 aide_champ hide_print">Vous pourrez ainsi être prévenu par message (si configuré dans les paramètres du plugin) de la péremption de la semence.</p>';
    div += '</div>';

    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">Commentaire achat</label>';
    div += '<div class="col-sm-8" >';
    div += '<textarea style="" class="eqLogicAttr achat_commentaire form-control" >' + un_achat.commentaire + '</textarea>';
    div += '</div>';
    div += ' </div>';

    div += '</div>';
    $('#l_achat').append(div);
    setHeightC('achat_commentaire')
    


}

debugS=null;
function load_achat(_eqLogic){
    console.log('load achat')
    
    debugS=_eqLogic;
    $('#l_achat').empty();
    if(_eqLogic.configuration == null){
        return
    }
    if (isset(_eqLogic.configuration.liste_achat) && _eqLogic.configuration.liste_achat != '') {
        for (var i in _eqLogic.configuration.liste_achat) {
            add_achat(_eqLogic.configuration.liste_achat[i]);
        }
    }
}

function save_achat(_eqLogic){
    //console.log(_eqLogic.configuration.liste_semis)
    _eqLogic.configuration.liste_achat = [];
    $('.un_achat').each(function () {
      var un_achat = {}
      //un_achat.nom = $($(this).find('.nom_semis')[0]).val();

      un_achat.commentaire = $($(this).find('.achat_commentaire')[0]).val();
      un_achat.origine_achat = $($(this).find('.origine_achat')[0]).val();
      un_achat.nom_origine = $($(this).find('.nom_origine')[0]).val();
      un_achat.qte_achat = $($(this).find('.qte_achat')[0]).val();
      un_achat.prix_achat = $($(this).find('.prix_achat')[0]).val();
      un_achat.date_achat = $($(this).find('.date_achat')[0]).val();
      un_achat.date_peremption = $($(this).find('.date_peremption')[0]).val();
      
      _eqLogic.configuration.liste_achat.push(un_achat);
    });
  
    
    console.log(_eqLogic.configuration.liste_achat)
    return _eqLogic
  }