
var pays = JSON.parse(pays); 


for (const u_pays in pays) {
  var un_pays=$('<option/>', {
    "value": u_pays,
  }).appendTo($('#l_pays'));
  un_pays.text(pays[u_pays])
}

//recherche des images pour la liste
$('img[type_s="semence"][ia!="1"]').each(function(){
  var n_s=$(this).attr('nom_espece')
  var url_img_ia=$(this).attr('url_img_ia')

  //pour un chargement plus rapide :D
  if(url_img_ia !=''){
    $(this).attr('src',base_url + '/plugins/jardin/data/img/semences/' + url_img_ia);
    return
  }
  
  var u_semence=new semence();
  u_semence.nom=$(this).attr('nom_espece')
  u_semence.type_semence=$(this).attr('type_semence')
  u_semence.rechercher_espece_bdd('gestion');
  if(u_semence.match_bdd != null){
    if(u_semence.match_bdd.img != null)
    {
      $(this).attr('src',base_url + '/plugins/jardin/data/img/semences/' + u_semence.match_bdd.img);
    }
  }

  //u_semence.charger_more_info_from_serveur('planning');
})

$('#bt_voirplpotager').off('click').on('click', function () {
  window.open(base_url + "/index.php?v=d&m=jardin&p=planning","_self")
  // $('#md_modal').dialog({title: "{{Planning du potager}}"});
  // $('#md_modal').load('index.php?v=d&plugin=potager&modal=modal.plpotager').dialog('open');
});

$('#bt_potager_plan').off('click').on('click', function () {
  window.open(base_url + "/index.php?v=d&m=jardin&p=panel","_self")
  // $('#md_modal').dialog({title: "{{Plan du potager}}"});
  // $('#md_modal').load('index.php?v=d&plugin=potager&modal=modal.planpotager').dialog('open');
});


$('#sel_type').on('change',function(e){
  detect_semence();
  hide_visible_potager();
  if($('#sel_type').val() == 'potager' || $('#sel_type').val() == 'lune'){
    $('#detail_semence').hide();
    $('#detail_potager').hide();
  }else{
    $('#detail_semence').show();
    $('#detail_potager').hide();
  }
  if($('#sel_type').val() == 'lune'){
    $('#tab_arrosage').hide();
    supprimer_all_arrosage();
  }else{
    $('#tab_arrosage').show();
  }

  if($('#sel_type').val() == 'semence'){
    $('#tab_semis').show();
    $('#tab_tache').show();
    $('#tab_achat').show();
  }else{
    $('#tab_semis').hide();
    $('#tab_tache').hide();
    $('#tab_achat').hide();
  }
});

$('.b_open_link').on('click',function(){
  var url=$(this).parent().parent().children().first().val()//$('#url_origine_achat').val();
  if(url==''){
    return
  }
  if(url.substring(0, 4) != 'http'){
    url='http://' + url;
  }

  console.log(url)
  window.open(url,'_blank');
})

function export_semence_csv(){
  var items = [objT];
        const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
        const header = Object.keys(items[0]);
        let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        csv = csv.join('\r\n');
        download('test.csv',csv)
        // //Download the file as CSV
        // var downloadLink = document.createElement("a");
        // var blob = new Blob(["\ufeff", csv]);
        // var url = URL.createObjectURL(blob);
        // downloadLink.href = url;
 
 
       // downloadLink.download = "DataDump.csv";  //Name the file here
        // document.body.appendChild(downloadLink);
        // downloadLink.click();
        // document.body.removeChild(downloadLink);
}
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}



function refresh_delete_date(){
  $('.delete_date').off().on('click',function(e){
      var d_semis=$(this).prev().val('');
  })
}
refresh_delete_date();
var current_element;
function printEqLogic(_eqLogic) {

  
  current_element=_eqLogic;
  load_arrosage(_eqLogic)
  load_semis(_eqLogic)
  load_tache(_eqLogic)
  load_achat(_eqLogic)

  

  

  detect_semence();
  $('#page_edition').scrollTop(0);
  setTimeout(() => {
    setHeight('c_commentaire') 
    
    $('#sel_type_semence').off().on('change',function(){
      if(no_ia.indexOf($('#sel_type_semence').val()) != -1){

          bootbox.alert("Pour ce type de semence, la détection automatique est par défaut désactivée (mais vous pouvez la réactiver manuellement ) !");
          $("#cb_ia").prop( "checked", true );
          $("#cb_ia_g").css( "color", "red" );
        }else{
          $("#cb_ia_g").css( "color", "" );
        }
    
      detect_semence();
    })
  }, 500);
  
}
$('#fleche_retour').off().on('click',function(){
  $('#sel_type_semence').off()
  $('.detect_as').hide();
})

function detect_semence(){
  var is_v = $('.detect_as').first().is(":visible");
  $('.detect_as').hide();
  $('#cb_ia_g').show();
  $('#url_img_ia').val('')
  if($('#sel_type').val() == 'semence' && $('#cb_ia').is(":checked")==false){
    var u_semence=new semence();
    u_semence.nom=$('#nom_semence').val();
        u_semence.rechercher_espece_bdd('gestion_edition',$('#sel_type_semence').val())
        if(u_semence.match_bdd != null){
          $('.detect_as').show();
          if(u_semence.match_bdd.img != null){
            $('.img_semence').show();
            $('.img_semence').attr('src',base_url + '/plugins/jardin/data/img/semences/' + u_semence.match_bdd.img);
            $('#url_img_ia').val(u_semence.match_bdd.img)
          }else{
            $('.img_semence').hide();
          }

          console.log(u_semence)
          $('#ia_text').empty();
          if(u_semence.match_bdd.associations.length > 0){
            $('#ia_text').html($('#ia_text').html() + '<br/><b><u>Associations</u></b><br/>');
            u_semence.match_bdd.associations.forEach(element => {
              $('#ia_text').html($('#ia_text').html() + element + '<br/>');
            })
          }

          if(u_semence.match_bdd.incompatibilites.length > 0){
            $('#ia_text').html($('#ia_text').html() + '<br/><b><u>Incompatibilites</u></b><br/>');
            u_semence.match_bdd.incompatibilites.forEach(element => {
              $('#ia_text').html($('#ia_text').html() + element + '<br/>');
            })
          }

          if(u_semence.match_bdd.hasOwnProperty('conseil')){
            if(u_semence.match_bdd.conseil != ''){
              $('#ia_text').html($('#ia_text').html() + '<br/><br/><b><u>Conseils & Autres</u></b><br/>');
              $('#ia_text').html($('#ia_text').html() + u_semence.match_bdd.conseil + '<br/>');
            }
          }

          
          $('.nom_detect').text(strUcFirst(u_semence.match_bdd.espece))

          //seulement si création
          if(current_element != null){
            if(current_element.configuration.hasOwnProperty('type')==false){
              for (let i = 0; i <= 9; i++) {
                $( "input[data-l2key='semis_" + i + "']" ).prop( "checked", false)
                $( "input[data-l2key='semis_terre_" + i + "']" ).prop( "checked", false)
                $( "input[data-l2key='recolte_" + i + "']" ).prop( "checked", false)
              }
  
              if(u_semence.match_bdd.hasOwnProperty('mois_semis')){
                u_semence.match_bdd.mois_semis.forEach(element => $( "input[data-l2key='semis_" + (parseInt(element) -1) + "']" ).prop( "checked", true));
              }
              if(u_semence.match_bdd.hasOwnProperty('mois_plantation')){
                u_semence.match_bdd.mois_plantation.forEach(element => $( "input[data-l2key='semis_terre_" + (parseInt(element) -1) + "']" ).prop( "checked", true));
              }
              if(u_semence.match_bdd.hasOwnProperty('mois_recolte')){
                u_semence.match_bdd.mois_recolte.forEach(element => $( "input[data-l2key='recolte_" + (parseInt(element) -1) + "']" ).prop( "checked", true));
              }
              
              function remplir_auto(data,key=null){
                if(key==null){
                  key=data;
                }
                $( "input[data-l2key='" + key + "']" ).val('');
                if(u_semence.match_bdd.hasOwnProperty(data)){
                  $( "input[data-l2key='" + key + "']" ).val(u_semence.match_bdd[data]); 
                }
              }
              remplir_auto('arrosage');
              remplir_auto('ensoleillement');
              remplir_auto('distance_plantation');
            }
          }

          icon_widget('arrosage',$( "input[data-l2key='arrosage']" ).first().val())
          icon_widget('ensoleillement',$( "input[data-l2key='ensoleillement']" ).first().val())
          icon_widget('distance_plantation',$( "input[data-l2key='distance_plantation']" ).first().val())
          
        }
    
  }

  var scroll_e = $('#page_edition').scrollTop();
  var is_v_e = $('.detect_as').first().is(":visible");

  if(is_v==false && is_v_e){
    $('#page_edition').scrollTop(scroll_e + 138);
  }


}

$('#cb_ia').on('change',function(){
  detect_semence();
})

$( "input[data-l2key='arrosage']" ).on('change input',function(){
  icon_widget('arrosage',$( "input[data-l2key='arrosage']" ).first().val())
})

function icon_widget(key,txt){
  $('.img_' + key).hide();
  $('.grp_img_' + key).hide();
  $('.img_' + key).removeClass('animate__heartBeat')
  var img=ia_analyse_text(null,txt,key,true)
  if(img != null){
    $('.grp_img_' + key).show();
    $('.img_' + key).show();
    $('.img_' + key).addClass('animate__heartBeat')
    $('.img_' + key).attr('src',base_url + "plugins/jardin/data/img/" + img);
    $('.img_' + key).attr('title',txt);
    $('.grp_img_' + key).css('display','flex');addCmdToTable
    $('.txt_img_' + key).text(txt);
  }
  
}

$( "input[data-l2key='ensoleillement']" ).on('change input',function(){
  icon_widget('ensoleillement',$( "input[data-l2key='ensoleillement']" ).first().val())
})
$( "input[data-l2key='distance_plantation']" ).on('change input',function(){
  // $('.img_ensoleillement').hide();
  // var img=ia_analyse_text(null,$(this).val(),'ensoleillement',true)
  // if(img != null){
  //   $('.img_ensoleillement').show();
  //   $('.img_ensoleillement').attr('src',base_url + "plugins/potager/data/img/distance.png");
  // }

  // $('.img_ensoleillement').addClass('animate__heartBeat')
  icon_widget('distance_plantation',$( "input[data-l2key='distance_plantation']" ).first().val())
})



$('#nom_semence').off().on('input',function(){
  detect_semence();
})

function saveEqLogic(_eqLogic) {
  if (!isset(_eqLogic.configuration)) {
    _eqLogic.configuration = {};
  }
  _eqLogic=save_arrosage(_eqLogic)
  _eqLogic=save_tache(_eqLogic)
  _eqLogic=save_semis(_eqLogic)
  _eqLogic=save_achat(_eqLogic)
  
  

  $('#sel_type_semence').off()
  return _eqLogic;
}

/*
* Permet la réorganisation des commandes dans l'équipement
*/
$("#table_cmd").sortable({axis: "y", cursor: "move", items: ".cmd", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true});

/*
* Fonction permettant l'affichage des commandes dans l'équipement
*/
function remove_cmd(id){
  $('tr[data-cmd_id="' + id + '"').remove();
}

function addCmdToTable(_cmd) {
  if (!isset(_cmd)) {
     var _cmd = {configuration: {}};
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
      tr += '<td style="display:none">';
      tr += '<span class="type" type="' + init(_cmd.type) + '">' + jeedom.cmd.availableType() + '</span>';
      tr += '<span class="subType" subType="' + init(_cmd.subType) + '"></span>';
      tr += '</td>';
   tr += '<td>';
   tr += '<span class="cmdAttr" data-l1key="htmlstate"></span>';
   tr += '</td>';
   tr += '<td>';
   if (is_numeric(_cmd.id)) {
     tr += '<a class="btn btn-default btn-xs cmdAction" data-action="configure"><i class="fas fa-cogs"></i></a> ';
     tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test" style="display:initial !important"><i class="fas fa-rss"></i> Tester</a>';
   }
   tr += '<i class="fas fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i></td>';
   tr += '</tr>';
   $('#table_cmd tbody').append(tr);
   var tr = $('#table_cmd tbody tr').last();
  
   jeedom.eqLogic.buildSelectCmd({
     id:  $('.eqLogicAttr[data-l1key=id]').value(),
     filter: {type: 'info'},
     error: function (error) {
       $('#div_alert').showAlert({message: error.message, level: 'danger'});
     },
     success: function (result) {
       tr.find('.cmdAttr[data-l1key=value]').append(result);
       tr.setValues(_cmd, '.cmdAttr');
       jeedom.cmd.changeType(tr, init(_cmd.subType));
     }
   });
 }

 
 if(getCookie('add_item')=='oui'){
  eraseCookie('add_item');
  setTimeout(function(){
    $("div[data-action='add']")[0].click();
  },1000);
 }

if(version_potager_mig != '4' && conf_mode_potager!='standalone'){
  bootbox.alert({
    message: "<h2>Bienvenue sur Potager !</h2> <br/><br/>Je me permets de soliciter <u>votre aide</u> !<br/><br/> Accepteriez vous de laisser un avis sur le Marquet de JEEDOM <a href='https://market.jeedom.com/index.php?v=d&p=market_display&id=4130'><u>CLIQUEZ ICI POUR LE FAIRE</u></a> ? <br/><br/>Et de plus : je cherche à <b>faire connaître</b> l'application POTAGER , et qui mieux que <b>VOUS</b> pour en faire la promotion ! Je compte sur vous pour en parler autour de vous !<br/><br/><i>Ce message ne s'affichera plus , soyez tranquille</i>",
  })
  $.ajax({
    type: 'POST',
    url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
    data: {
        action: 'set_version_potager_mig',
        version_potager_mig: init('4'),
    },
    dataType: 'json',
    error: function (request, status, error) {
        handleAjaxError(request, status, error);
    },
    success: function (data) {
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: 'Erreur message migration potager', level: 'danger'});
            return;
        }
    }
  })
}

function imprimer(){
  printdiv('eqlogictab')
}

$('#b_print').off().on('click',function(){
  imprimer();
});
function printdiv(divName) {

  var printContents = document.getElementById(divName).cloneNode(true);

  w = window.open();
  //w.document.body.appendChild( "<title>Test</title>" );
  w.document.body.appendChild(printContents);

  function add_css(url){
    var link = w.document.createElement('link');
    // set the attributes for link element 
    link.rel = 'stylesheet'; 
    link.type = 'text/css';
    link.href =  window.location.origin + url; 
    var head = w.document.getElementsByTagName('HEAD')[0]; 
    head.appendChild(link); 
  }

  add_css(base_url + '/plugins/jardin/desktop/css/potager_main_print.css')
  add_css(base_url + '/3rdparty/font-awesome5/css/all.min.css')

  //add_css('/desktop/css/desktop.main.css')
  add_css(base_url + '/core/themes/core2019_Dark/desktop/core2019_Dark.css')
  add_css(base_url + '/desktop/css/bootstrap.css')
  //desktop/css/bootstrap.css?md5=5c9d33ccd0cbf6944614d6b7357a424c

  w.print();
  setTimeout(() => {
           //w.self.focus();
           //w.self.print();

      }, 1000);    
  //w.close();
  //return true;
}

  
function recap_semence(){
  $.ajax({
    type: 'GET',
    url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
    data: {
        action: 'get_recap_semence',
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
        var data=data.result
        console.log(data);

        $('#recap_semence').remove();
        var recap=$('<div/>', {
        "id": "recap_semence",
        }).appendTo($('#menu_top_potager'));

        Object.keys(data).forEach(element => {
          console.log(element)
          var un_recap=$('<div/>', {
            "class": "un_recap_semence",
            }).appendTo(recap);
            un_recap.text(element + ' : ' + data[element])
        })
      }
    })

    

    

    
}
recap_semence();