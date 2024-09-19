$('#b_add_semis').off('click').on('click', function () {
    modifyWithoutSave=true;
    addSemis({nom: 'Semis du ' + get_date_du_jour(),commentaire:''});
});
  
$("body").off('click','.removeSemis').on('click','.removeSemis',function () {
  var el = $(this);
  bootbox.confirm('Etes-vous sûr de vouloir supprimer ce semis ?', function (result) {
      if (result !== false) {
        modifyWithoutSave=true;
        el.closest('.un_semis').remove();
      }
  });
});

function addSemis(un_semis){
    //console.log(un_semis)
if (init(un_semis) == '') {
    return;
}
var div = '<div class="col-lg-12 form-horizontal un_semis">';
div += ' <a class="btn btn-danger btn-xs removeSemis pull-right"><i class="fas fa-minus-circle"></i> Supprimer semis</a> ';

div += '<div class="form-group" >';
div += '<label class="col-sm-3 control-label">Nom du semis</label>';
div += '<div class="col-sm-2"  >';
div += '<input type="text" class="eqLogicAttr nom_semis form-control" placeholder="Nom optionnel du semis" value="' + un_semis.nom + '"/>';
div += '</div>';
div += ' </div>';

nom_key_date.forEach(element => {
    div += '<div class="form-group" >';
    div += '<label class="col-sm-3 control-label">' + element.nom + '</label>';
    div += '<div class="col-sm-2" style="display:flex;align-items:center" >';
    div += '<input style="width:160px" type="date" key="' + element.key + '" class="eqLogicAttr input_date form-control" value="' + un_semis[element.key] + '"/><div class="delete_date" title="Supprimer la date" style="cursor:pointer;margin-left :10px"><i class="fas fa-times"></i></div>';
    div += '</div>';

    div += '<label class="col-sm-3 control-label">Quantité ' + element.adj + '</label>';
    
    if(element.adj=='récoltée'){
      div += '<div class="col-sm-2" style="display:flex;align-items:center">';
    }else{
      div += '<div class="col-sm-2"  >';
    }
    div += '<input type="number" style="width:50px" class="eqLogicAttr ' + element.qte_ass + ' form-control" placeholder="" value="' + un_semis[element.qte_ass] + '"/>';
    if(element.adj=='récoltée'){
      div += '<div style="margin-left :5px">g</div>';
    }
    div += '</div>';


    div += '</div>';
})



div += '<div class="form-group" >';
div += '<label class="col-sm-3 control-label">Commentaire semis</label>';
div += '<div class="col-sm-8" >';
div += '<textarea style="" class="eqLogicAttr semis_commentaire form-control" >' + un_semis.commentaire + '</textarea>';
div += '</div>';
div += ' </div>';


div += '</div>';
$('#l_semis').append(div);
refresh_delete_date();
setHeightC('semis_commentaire')

}

debugS=null;
  function load_semis(_eqLogic){
    debugS=_eqLogic;
    $('#l_semis').empty();
    if(_eqLogic.configuration == null){
      return
    }
    if (isset(_eqLogic.configuration.liste_semis) && _eqLogic.configuration.liste_semis != '') {
        // var qte_seme_total=0;
        // var qte_germe_total=0;
        // var poid_recolte_total=0;
        for (var i in _eqLogic.configuration.liste_semis) {
          addSemis(_eqLogic.configuration.liste_semis[i]);
        }
    
        if(_eqLogic.configuration.liste_semis == ''){
          $('#qte_seme').prop( "disabled", false );
          $('#qte_germe').prop( "disabled", false );
          $('#qte_plante').prop( "disabled", false );
          $('#qte_rempote').prop( "disabled", false );
          $('#poid_recolte').prop( "disabled", false );
        }else{
          $('#qte_seme').prop( "disabled", true );
          $('#qte_germe').prop( "disabled", true );
          $('#qte_plante').prop( "disabled", true );
          $('#qte_rempote').prop( "disabled", true );
          $('#poid_recolte').prop( "disabled", true );
        }
      }
  }

  function save_semis(_eqLogic){
    console.log('save_semis')
    _eqLogic.configuration.liste_semis = [];
    $('.un_semis').each(function () {
      var un_semis = {}
      un_semis.nom = $($(this).find('.nom_semis')[0]).val();

      nom_key_date.forEach(element => {
        un_semis[element.qte_ass] = $($(this).find('.' + element.qte_ass)[0]).val();
      })
      // un_semis.qte_seme = $($(this).find('.qte_seme')[0]).val();
      // un_semis.qte_germe = $($(this).find('.qte_germe')[0]).val();
      // un_semis.qte_plante = $($(this).find('.qte_plante')[0]).val();
      // un_semis.qte_rempote = $($(this).find('.qte_rempote')[0]).val();
      
      // un_semis.poid_recolte = $($(this).find('.poid_recolte')[0]).val();
      un_semis.commentaire = $($(this).find('.semis_commentaire')[0]).val();
  
      nom_key_date.forEach(element => {
        un_semis[element.key] = $($(this).find('.input_date[key="'+ element.key + '"]')[0]).val();
      })
      _eqLogic.configuration.liste_semis.push(un_semis);
    });
  
    var qte_seme_total=0;
    var qte_germe_total=0;
    var qte_plante_total=0
    var qte_rempote_total=0
    var qte_ecl_total=0
    var poid_recolte_total=0;
    if(_eqLogic.configuration.liste_semis.length > 0){
      
      for (var i in _eqLogic.configuration.liste_semis) {
        qte_seme_total+=(parseInt(_eqLogic.configuration.liste_semis[i].qte_seme) ||0)
        qte_germe_total+=(parseInt(_eqLogic.configuration.liste_semis[i].qte_germe) ||0)
        qte_plante_total+=(parseInt(_eqLogic.configuration.liste_semis[i].qte_plante) ||0)
        qte_rempote_total+=(parseInt(_eqLogic.configuration.liste_semis[i].qte_rempote) ||0)
        //qte_ecl_total+=(parseInt(_eqLogic.configuration.liste_semis[i].qte_eclairci) ||0)
        poid_recolte_total+=(parseInt(_eqLogic.configuration.liste_semis[i].poid_recolte) ||0)
        console.log('poid_recolte_total :' + poid_recolte_total)
      }

      _eqLogic.configuration.quantite=qte_seme_total;
      _eqLogic.configuration.quantite_germe=qte_germe_total;
      _eqLogic.configuration.quantite_plante=qte_plante_total;
      _eqLogic.configuration.quantite_rempote=qte_rempote_total;
      _eqLogic.configuration.poid_recolte=poid_recolte_total;
    }
      
     // _eqLogic.configuration.poid_recolte=qte_ecl_total;
  
    
    //console.log(_eqLogic.configuration.liste_semis)
    return _eqLogic
  }