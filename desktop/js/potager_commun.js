
var nom_key_date=[{"nom":"Date de semis","key":"d_semis","class":"dt_semis","text":"Semée le","img":"/plugins/jardin/data/img/semis_godet.png","adj":"semée","qte_ass":"qte_seme"},
    {"nom":"Date de germination","key":"d_germination","class":"dt_germination","text":"Germée le","img":"/plugins/jardin/data/img/germe.png","adj":"germée","qte_ass":"qte_germe"},
    {"nom":"Date de plantation","key":"d_plantation","class":"dt_semis_terre","text":"Plantée le","img":"/plugins/jardin/data/img/terre.png","adj":"plantée","qte_ass":"qte_plante"},
    {"nom":"Date d'éclaircissage","key":"d_eclaircissage","class":"dt_eclaircissage","text":"Eclaircie le","img":"/plugins/jardin/data/img/eclaircie.png","adj":"éclaircie","qte_ass":"qte_eclairci"},
    {"nom":"Date de rempotage","key":"d_rempotage","class":"dt_rempotage","text":"Rempotée le","img":"/plugins/jardin/data/img/rempotage.png","adj":"rempotée","qte_ass":"qte_rempote"},
    {"nom":"Date de récolte","key":"d_recolte","class":"dt_recolte","text":"Récoltée le","img":"/plugins/jardin/data/img/recolte.png","adj":"récoltée","qte_ass":"poid_recolte"}
]
var no_ia=['fleur','arbre','arbuste','autre','aromate']

var isTouchDevice = 'ontouchstart' in document.documentElement;
get_config('alert_tablette',alert_tablette_fn);
function alert_tablette_fn(data){
    console.log('alert_tablette_fn')
    if(isTouchDevice && data.result == ''){
        save_config('alert_tablette','oui');
        bootbox.alert("POTAGER aime le tactile ! <br/><br/>Sur Ecran tactile, pour simuler le clic droit, veuillez appuyer 2sec !");
    }
}


function strUcFirst(a){
    if(a == null){
        return '';
    }
    return (a+'').charAt(0).toUpperCase()+a.substr(1);
}

function ia_analyse_text(vars=null,valeur,defaut=null,normalize=false,min_len=3){
    
     
    if(valeur == null){
        return null
    }
    
    if(normalize){
        valeur=normalize_txt(valeur)
        valeur=valeur.replaceAll(' ','').replaceAll('/','').replaceAll('-','')
    }


    if(defaut == 'distance_plantation'){
        min_len=1;
    }
    
    
    if(valeur.length<=min_len){
        return null
    }

    if(defaut == 'distance_plantation'){
        return 'distance.png'
    }

    if(defaut == 'ensoleillement'){
        vars=[
            {"img":"moyen.png",
            "mc":['miombre','normal','soleilmiombre','soleilmiombreombre']
            },
            {"img":"ombre.png",
            "mc":['couvert','ombre','miombreombre']
            },
            {"img":"soleil.png",
            "mc":['soleil']
            }
        ]
    }

    if(defaut == 'arrosage'){
        vars=[
            {"img":"a_faible.png",
            "mc":['faible','leger']
            },
            {"img":"a_moyen.png",
            "mc":['moyen','normal']
            },
            {"img":"a_ab.png",
            "mc":['abondant','beaucoup']
            }
          ];
    }
    var result=null;
    console.log('ia_analyse_text : ' + valeur)
    vars.forEach(function(item){
        item['mc'].forEach(function(un_mc){
            if(un_mc.indexOf(valeur) != -1){
                
                result=item['img']
            }
        })
    });
    return result;
}

function add_debug(txt,niv_lg=1){
    return //off
    $('#debug').show();
    $('#debug').html(txt + '<br/>' + $('#debug').html())
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function setHeight(fieldId){
    document.getElementById(fieldId).style.height = document.getElementById(fieldId).scrollHeight+'px';
}
function setHeightC(fieldId){
    $('.' + fieldId).each(function(){
        ///this.style.height = this.scrollHeight+'px';
        var tmph=$(this).val().split('\n').length*20
        if(tmph<50){
            tmph=50
        }
        this.style.height=tmph+'px'
    })
}

function dateJS_to_dateFR(dateJS){
    var jour=dateJS.getDate().toString()
    if(jour.length==1){
        jour='0' + jour;
    }
    var mois=(dateJS.getMonth() + 1).toString()
    if(mois.length==1){
        mois='0' + mois;
    }
    return jour + '/' + mois + '/' + dateJS.getFullYear();
}

function date_php_to_dateFR(date){
    if(date==null){
        return '';
    }

    if(date.length != 10){
        return '';
    }


    return date.substring(8,10) + '/' + date.substring(5,7) + '/' + date.substring(0,4);
}



function migrer_semence(id){
    $.ajax({
        type: 'POST',
        url: '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'migrer_une_semence',
            id: init(id)
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





function get_id_unique(){
    var date=new Date()
    var id_u=date.getYear().toString() + date.getMonth().toString() + date.getDate().toString() + date.getHours().toString() + date.getMinutes().toString() + date.getMilliseconds()
    return id_u;
}

$('#b_debug').off().on('click',function(){
    var id=prompt('id ?');
    if(id != null && id!=false){
        debug_ajax(id)
    }
})
function debug_ajax(id){
    $.ajax({
        type: 'POST',
        url: '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'debug',
            id: init(id)
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


function get_date_du_jour()
{
 
var newDate = new Date();
var DateYear = newDate.getFullYear();
var DateMonth = (newDate.getMonth())+1;
var DateDay = newDate.getDate();
 
if(DateMonth.toString().length == 1)
{
    DateMonth = '0' + DateMonth;
}
if(DateDay.toString().length == 1)
{
    DateDay = '0' + DateDay;
}
 
var dateMyFormat = DateDay + '/' + DateMonth + '/' + DateYear;
 
return dateMyFormat;
 
}



function getSelectCmdExpressionMessage(subType, cmdHumanName) {
    if (!['numeric', 'string', 'binary'].includes(subType)) return '{{Aucun choix possible}}'
  
    var message =  '<div class="row">'
    message += '<div class="col-md-12">'
    message += '<form class="form-horizontal" onsubmit="return false;">'
    message += '<div class="form-group">'
    message += '<label class="col-xs-5 control-label" >' + cmdHumanName + ' {{est}}</label>'
  
    if (subType == 'numeric') {
      message += '<div class="col-xs-3">'
      message += '  <select class="conditionAttr form-control" data-l1key="operator">'
      message += '    <option value="==">{{égal}}</option>'
      message += '    <option value=">">{{supérieur}}</option>'
      message += '    <option value="<">{{inférieur}}</option>'
      message += '    <option value="!=">{{différent}}</option>'
      message += '  </select>'
      message += '</div>'
      message += '<div class="col-xs-4">'
      message += '  <input class="conditionAttr form-control radio-inline" data-l1key="operande" style="width: calc(100% - 45px);" />'
      message += '  <button type="button" class="btn btn-default cursor bt_selectCmdFromModal"><i class="fas fa-list-alt"></i></button>'
      message += '</div>'
      message += '</div>'
    }
  
    if (subType == 'string') {
      message += '<div class="col-xs-2">'
      message += '  <select class="conditionAttr form-control" data-l1key="operator">'
      message += '    <option value="==">{{égale}}</option>'
      message += '    <option value="matches">{{contient}}</option>'
      message += '    <option value="!=">{{différent}}</option>'
      message += '  </select>'
      message += '</div>'
      message += '<div class="col-xs-4">'
      message += '  <input class="conditionAttr form-control radio-inline" data-l1key="operande" style="width: calc(100% - 45px);" />'
      message += '  <button type="button" class="btn btn-default cursor bt_selectCmdFromModal"><i class="fas fa-list-alt"></i></button>'
      message += '</div>'
      message += '</div>'
    }
  
    if (subType == 'binary') {
      message += '<div class="col-xs-7">'
      message += '<input class="conditionAttr" data-l1key="operator" value="==" style="display : none;" />'
      message += '  <select class="conditionAttr form-control" data-l1key="operande">'
      message += '    <option value="1">{{Ouvert}}</option>'
      message += '    <option value="0">{{Fermé}}</option>'
      message += '    <option value="1">{{Allumé}}</option>'
      message += '    <option value="0">{{Eteint}}</option>'
      message += '    <option value="1">{{Déclenché}}</option>'
      message += '    <option value="0">{{Au repos}}</option>'
      message += '  </select>'
      message += '</div>'
      message += '</div>'
    }
  
    message += '<div class="form-group">'
    message += '<label class="col-xs-5 control-label" >{{Ensuite}}</label>'
    message += '<div class="col-xs-3">'
    message += '  <select class="conditionAttr form-control" data-l1key="next">'
    message += '    <option value="">{{rien}}</option>'
    message += '    <option value="ET">{{et}}</option>'
    message += '    <option value="OU">{{ou}}</option>'
    message += '  </select>'
    message += '</div>'
    message += '</div>'
    message += '</div></div>'
    message += '</form></div></div>'
    return message
  }

  function singulier(mot){
    if(mot.length < 3){
        return mot;
    }

    //si on a plsuieurs mot on doit d'abord tout scinder
    var mots=mot.split(' ');
    var resultat='';

    mots.forEach(element => {
        // if(mot == 'haricots vert'){
        //     console.log('singulier : ' + element)
        // }

        if(element != ' '){
            if(resultat != ''){
                resultat=resultat+' '
            }
            if(element.substr(element.length-1,1) == 's' || element.substr(element.length-1,1) == 'x'){
                resultat = resultat + element.substr(0,element.length-1);
            }else{
                resultat = resultat + element
            }
        }
    });

    // if(mot == 'haricots vert'){
    //     console.log('singulier F : ' + mot + '->' + resultat)
    // }

    
    return resultat;
}

function save_config(config,value){
    console.log('save_config ' + config + ' : ' + value)
    $.ajax({
        type: 'POST',
        url: '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'set_config',
            config: init(config),
            value: init(value)
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
function get_config(config,callback){
    $.ajax({
        type: 'POST',
        url: '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'get_config',
            config: init(config)
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            callback(data)
        }
    })
}

function normalize_txt(txt){
    txt=txt.toLowerCase();
    txt=txt.replace('-',' ')
    return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u0153]/g, "oe").replace(/[\u0152]/g, "oe").replace(/-/g, " ").replaceAll("tt","t").replaceAll("'","")
}

function compare_string_simple(t1,t2){
    t1=normalize_txt(t1);
    t2=normalize_txt(t2);

    if(t1.indexOf(t2) != -1 || t2.indexOf(t1) != -1){
        return true
    }

    return false;
}


  function recherche_similitude(nom_a,nom_b_ref,len_min=3){ //on regarde si nom_b_ref contient nom_a
    nom_a=nom_a.toLowerCase();
    nom_b_ref=nom_b_ref.toLowerCase();

    nom_a=nom_a.replace('-',' ')
    nom_b_ref=nom_b_ref.replace('-',' ')

    function remove_special_char(txt){
        return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u0153]/g, "oe").replace(/[\u0152]/g, "oe").replace(/-/g, " ").replaceAll("tt","t").replaceAll("'","")
    }

    var debug_ia=false
    if(nom_a=='Oiseau du paradis'){
        debug_ia=false;
        if(debug_ia){
            console.log(' - ')
            console.log(nom_a + ' - ' + nom_b_ref)
        }
        
    }
    nom_a=remove_special_char(nom_a)
    nom_b_ref=remove_special_char(nom_b_ref)
    if(debug_ia){
        console.log(' - remove_special_char')
        console.log(nom_a + ' - ' + nom_b_ref)
    }


    nom_a=singulier(nom_a);
    nom_b_ref=singulier(nom_b_ref);

    if(debug_ia){
        console.log(' - singulier')
        console.log(nom_a + ' - ' + nom_b_ref)
    }


    
        //console.log('             ' + nom_a + '        ' + nom_b_ref)

    if(nom_a.length<len_min || nom_b_ref.length<len_min){
        var resultat_match={"etat" : -1 , "length" : 0 , "score" : 0}
        return resultat_match;
    }

    var score=0;

    var position_reference=nom_a.indexOf(nom_b_ref)

    
    

    if(position_reference != -1){
        score=nom_b_ref.length*nom_a.length

        //si on a trouvé, on va vérifier qu'on est bien sur un mot entier , et donc qu'il se termine soit par la fin du champ, soit par un ' ' soit par un 's' ou 'x'
        if(nom_b_ref.length == nom_a.length){
            //si les 2 ont exactement la même taille
            score = score + nom_b_ref.length
            if(debug_ia){
                console.log('ia > les 2 ont exactement la même taille - position_reference:' + position_reference)
            }
        }

        if(nom_b_ref.length > nom_a.length){ //cas imposible normalement
            //si les 2 ont exactement la même taille
            //score = score + nom_b_ref.length
            console.error('recherche_similitude : nom_b_ref.length > nom_a.length')
            position_reference=-1;
            score=0;

            if(debug_ia){
                console.log('ia > nom_b_ref.length > nom_a.length')
            }
        }

        if(nom_b_ref.length < nom_a.length){ 
            if(debug_ia){
                console.log('ia > nom_b_ref.length < nom_a.length')
            }

            //on regarde alors ce qu'il y avait avant
            var check_avant=false;

            //soit ya rien avant
            if(debug_ia){
                console.log('ia > position_reference=' + position_reference)
            }

            if(position_reference == 0){
                check_avant=true;
                //score = score + nom_b_ref.length

            }else{
                //soit avant il y a un espace , c'est ok
                
                var char_avant=nom_a.substring((position_reference-1),position_reference)
                if(debug_ia){
                    console.log('ia > char_avant=' + char_avant)
                }

                if(char_avant==' '){
                    check_avant=true;
                }else{
                    check_avant=false;
                }
            }

            if(check_avant==true){
                if(debug_ia){
                    console.log('ia > check_avant = true')
                }

                //on regarde desormais ce qu'il y a apres
                var char_apres=nom_a.substring((position_reference+nom_b_ref.length),(position_reference+nom_b_ref.length + 1))

                if(debug_ia){
                    console.log('ia > char_apres=' + char_apres)
                }


                if(char_apres==' ' || char_apres=='x' || char_apres=='s' || char_apres=='@'){
                    score = score + nom_b_ref.length
                }else{
                    position_reference=-1;
                    score=0;
                }
            }else{
                position_reference=-1;
                score=0;
            }

        }


        

        if(position_reference == 0){
            score = score + nom_b_ref.length
        }
    }

    var resultat_match={"etat" : position_reference , "length" : nom_b_ref.length , "score" : score , data : null}
    // if(nom_a == 'oeillet dinde'){
    //     console.log('debug')
    //     console.log(nom_a + ' - ' + nom_b_ref)
    //     console.log(resultat_match)
    // }

    if(debug_ia){
        console.log(resultat_match)
    }

    return resultat_match;
    // if(nom_a.localeCompare(nom_b) == 0){
    //     return true
    // }
    // return false;
}



var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

$('#b_fs').on('click',function(){
  if($('#b_fs').attr('fs') == 'oui'){
    $('#b_fs').attr('fs','non')
    $('#b_fs').removeClass('fas fa-compress-arrows-alt')
    $('#b_fs').addClass('fas fa-expand-alt')
    closeFullscreen();
  }else{
    $('#b_fs').removeClass('fas fa-expand-alt')
    $('#b_fs').addClass('fas fa-compress-arrows-alt')
    $('#b_fs').attr('fs','oui')
    openFullscreen();
  }
})