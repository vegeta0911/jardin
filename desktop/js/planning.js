$('#b_more_filtre').off().on('click',function(){
    if($('#more_filtre').is(":hidden")){
        $('#more_filtre').show();
    }else{
        $('#more_filtre').hide();
    }
})
if(isTouchDevice && window.innerHeight > window.innerWidth){
    bootbox.alert("la vue planning est peu pratique en vue Portrait, veuillez basculer en vue Paysage !");
}
function date_ligne_semis(une_ligne,date_point,class_s,pre_title,nom_semis='',index_semis=0){

    
    //une_ligne.find('.' + class_s).remove();
    if(date_point == ''){
        return false;
    }
    mois=parseInt(date_point.substr(3,2));
    jour_s=parseInt(date_point.substr(0,2));
    annee_s=parseInt(date_point.substr(6,4));

    //console.log('date_ligne_semis ' + date_point)
    if(annee_s != parseInt($('#g_date_d').text())){
        //console.log('return année : ' + annee_s)
        return;
    }

    


    //console.log('date_ligne_semis ' + class_s + '-' + date_point + '-   '  + jour_s + '-' + mois + '-' + annee_s)
    nb_jour_mois_max=31;
    if(mois==4 || mois==6 ||mois==9 ||mois==11){
        nb_jour_mois_max=30;
    }
    if(mois==2){
        nb_jour_mois_max=28;
    }

    if(pre_title == null){
        pre_title=''
    }
    var class_base='date_point';

    if(class_s == 'date_peremption' || class_s == 'une_tache_planning'){
        class_base='';
        //alert('per ' + date_point)
    }

    if(class_base != ''){
        une_ligne.find('.' + class_s+'[index_semis="' + index_semis + '"]').remove();
    }
    

    if(nom_semis != ''){
        nom_semis='[' + nom_semis + '] ';
    }
    pl='calc(100% / 12 * ' + (mois-1) + ' + 100%/12 * ' + (jour_s) + '/' + (nb_jour_mois_max) + ' - 6px)';
    var le_point=$('<div index_semis="' + index_semis + '" title="' + nom_semis + pre_title + date_point + '" class="une_date_un_semis ' + class_base + ' ' + class_s + '" style="left:' + pl + '">'+ '</div>').appendTo($(une_ligne.find('.potager_ligne_planning')[0]));



    if($(une_ligne.find('.liste_semis')[0]).is(":hidden")==false){
        index_semis_affichage=get_index_affichage_semis(une_ligne,index_semis)
        le_point.css('top',((index_semis_affichage) * 20 + 34) + 'px')
    }

    return le_point
    
}
function generer_date_ligne_semis(une_ligne){
    une_ligne=$(une_ligne);
    
    une_ligne.find('.date_point').remove();

    // true_index=-1
    // une_ligne.parent().chlidren().children().each(function() {
    //     index_l=$(this).attr('index_semis')
    //     isHidden=$(this).is(":hidden");
    //     if(index_l<=true_index){
    //         if(isHidden==false){
    //             true_index++;
    //         }
    //     }
    // })

    var i=0;
    une_ligne.find('.un_semis').each(function() {
        var nom_semis=$(this).attr('nom');
        //if($(this).is(":hidden")==false){
            nom_key_date.forEach(kd => {
                var dt_semis=date_php_to_dateFR($(this).attr(kd.key));
                date_ligne_semis(une_ligne,dt_semis,kd.class,kd.text + ' ',nom_semis,i);
            })
    
            i++;
        //}

        
    })


    var date_peremption=une_ligne.attr('date_peremption');
    date_peremption_t=date_peremption.split('|');

    date_peremption_t.forEach(element => {
        date_ligne_semis(une_ligne,date_php_to_dateFR(element),'date_peremption','Date de péremption le ');
    });
    //console.log('date_peremption : ' + date_peremption)
    
}



$('#potager_planning').on( "click",  function(e) {
    $('#menu_potager').remove();
    e.stopPropagation();
});

function marque_comme(semence,ind_semis,type_date,date,nom_semis,event,force_custom_date=false){
    
    var class_p='dt_semis';

    const ref_key_date = nom_key_date.find(element => element.key == type_date);
    if(ref_key_date != null){
        class_p=ref_key_date['class']
    }
    var recherche_existant=$($('.potager_ligne[semence="' + semence + '"]')[0]).find('.' + class_p + '[index_semis=' + ind_semis + ']');
    if(recherche_existant.length > 0){
        marque_comme_suite(semence,ind_semis,type_date,date,nom_semis)
        return
    }

    if(event.ctrlKey || force_custom_date ){
        bootbox.prompt({
            title: "Veuillez choisir la date de votre choix !",
            inputType: 'date',
            callback: function (result) {
                if(result != null && result != ''){
                    marque_comme_suite(semence,ind_semis,type_date,result,nom_semis)
                }
            }
        });
    }else{
        marque_comme_suite(semence,ind_semis,type_date,date,nom_semis)
    }

}

var liste_semis_multiple=null;
function marque_comme_suite(semence,ind_semis,type_date,date,nom_semis){
    var class_p='dt_semis';
    const ref_key_date = nom_key_date.find(element => element.key == type_date);
    if(ref_key_date != null){
        class_p=ref_key_date['class']
    }
    var recherche_existant=$($('.potager_ligne[semence="' + semence + '"]')[0]).find('.' + class_p + '[index_semis=' + ind_semis + ']');
    

    if(mode_selection_multiple){
        //on a pas encore récupéré la sélection multiple
        if(liste_semis_multiple == null){
            liste_semis_multiple=get_list_selection_semis();
        }
        if(liste_semis_multiple.length == 0){
            //on a fini
            liste_semis_multiple=null;
        }else{
            //on prend le premier element et on le traite et le supprime
            var semis=liste_semis_multiple[0];
            liste_semis_multiple.splice(0, 1);
            //marque_comme(semis.attr('semence'),element.attr('index_semis'),kd.key,date_s,element.attr('nom'),e);
            setTimeout(() => {
                marque_comme_suite2(semis.attr('semence'),semis.attr('index_semis'),type_date,date,semis.attr('nom'))
            }, 200);
            
        }
        
    }else
    {
        if(recherche_existant.length > 0){
            marque_comme_suite2(semence,ind_semis,type_date,date,nom_semis)
            return
        }
        if(type_date == 'd_recolte'){
            bootbox.prompt({
                title: "Quelle poid de la récolute (en gramme) ? (si vide - la réponse sera ignorée)",
                inputType: 'number',
                callback: function (result) {
                    if(result != null ){
                        marque_comme_suite2(semence,ind_semis,type_date,date,nom_semis,result)
                    }
                }
            });
        }else {
            bootbox.prompt({
                title: "Quelle quantitée ? (si vide - la réponse sera ignorée)",
                inputType: 'number',
                callback: function (result) {
                    if(result != null ){
                        marque_comme_suite2(semence,ind_semis,type_date,date,nom_semis,result)
                    }
                }
            });
        
        }
        
        //marque_comme_suite2(semence,ind_semis,type_date,date,nom_semis)
    }
    
}



function marque_comme_suite2(semence,ind_semis,type_date,date,nom_semis,qte=''){
    var class_p='dt_semis';
    var text='';

    const ref_key_date = nom_key_date.find(element => element.key == type_date);
    if(ref_key_date != null){
        class_p=ref_key_date['class']
        text=ref_key_date['text'] + ' ';
    }

    var recherche_existant=$($('.potager_ligne[semence="' + semence + '"]')[0]).find('.' + class_p + '[index_semis=' + ind_semis + ']');
    if(recherche_existant.length > 0){
        date=''
    }
    $.ajax({
        type: 'POST',
        url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'set_date_semis',
            object_id: init(semence),
            ind_semis: init(ind_semis),
            type_date: init(type_date),
            qte: init(qte),
            date_s:init(date)
        },
        dataType: 'json',
        error: function (request, status, error) {
            console.error('erreur !')
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                if(mode_selection_multiple){
                    marque_comme_suite(semence,ind_semis,type_date,date,nom_semis)
                   
                }
                return;
            }

            

            var recherche_existant=$($('.potager_ligne[semence="' + semence + '"]')[0]).find('.' + class_p + '[index_semis=' + ind_semis + ']');
            if(recherche_existant.length > 0){
                recherche_existant.remove();
                $($($('.potager_ligne[semence="' + semence + '"]')[0]).find('.un_semis[index_semis="' + ind_semis + '"]')[0]).attr(type_date,'')
            }else{
                date_ligne_semis($($('.potager_ligne[semence="' + semence + '"]')[0]),date_php_to_dateFR(date),class_p,text,nom_semis,ind_semis);
                $($($('.potager_ligne[semence="' + semence + '"]')[0]).find('.un_semis[index_semis="' + ind_semis + '"]')[0]).attr(type_date,date)
            }

            if(mode_selection_multiple){
                marque_comme_suite(semence,ind_semis,type_date,date,nom_semis)
            }

            
        }
    });
}

function menu_clic_droit_semis(element,event){
    $('.pop_up_detail_semence').remove();
    $('#menu_potager').remove();
    $('<div id="menu_potager"></div>').appendTo($('#potager_planning').parent());
    $('#menu_potager').css('top',(element.offset().top-20) + 'px');
    $('#menu_potager').css('left',event.pageX+ 'px');

    var menu_potager_col_m=$('<div/>', {
        "class": 'menu_potager_col_m',
    }).appendTo($('#menu_potager'));

    var menu_potager_col_m_aide=$('<div/>', {
        "class": 'menu_potager_col_m_aide',
    }).appendTo($('#menu_potager'));
    menu_potager_col_m_aide.text('Maintenez CTRL lors du clic pour choisir la date !')
    if(isTouchDevice){
        menu_potager_col_m_aide.text('Appuyer longtemps lors de la sélection pour choisir la date !')
    }

    if(mode_selection_multiple){
        var menu_potager_col_m_aide=$('<div/>', {
            "class": 'menu_potager_col_m_aide',
        }).appendTo($('#menu_potager'));
        menu_potager_col_m_aide.text('L\'action que vous allez effectuer sera répercuptée sur la sélection !')
        menu_potager_col_m_aide.css('color','red')
    }

    //$('#menu_potager').css('flex-direction','row');
    var ladate=new Date()
    var mois=(ladate.getMonth()+1);
    if(mois.toString().length == 1){
        //console.log('bm')
        mois='0' + mois.toString();
    }
    var jour=ladate.getDate();
    if(jour.toString().length == 1){
        jour='0' + jour.toString();
    }
    var date_s=ladate.getFullYear() + '-' + mois + '-' + jour
    //console.log(date_s)

    nom_key_date.forEach(kd => {
        var action_b=$('<div/>', {
            "class": 'menu_potager_col',
        }).appendTo(menu_potager_col_m);
        action_b.addClass(kd.class)
        action_b.css('background-image','url(\'' + base_url + kd.img + '\')')
        action_b.attr('title','Marquée comme ' + kd.adj)

        if($($('.potager_ligne[semence="' + element.attr('semence') + '"]')[0]).find('.' + kd.class + '[index_semis=' + element.attr('index_semis') + ']').length > 0){
            action_b.attr('title' , 'Marquer comme NON ' + kd.adj)
            var barre=$('<div/>', {
                "class": 'menu_potager_col_barre',
            }).appendTo(action_b);
        }

        action_b.on('click',function(e){
            $('#menu_potager').remove();
            marque_comme(element.attr('semence'),element.attr('index_semis'),kd.key,date_s,element.attr('nom'),e);
        })
       
        action_b.bind("contextmenu",function(e){
            $('#menu_potager').remove();
            marque_comme(element.attr('semence'),element.attr('index_semis'),kd.key,date_s,element.attr('nom'),e,true);
            return false;
        })
    })

    var text_semis='le semis';
    if(mode_selection_multiple){
        text_semis='la sélection de semis';
    }
    var l_fiche=$('<div class="menu_potager_ligne" >Renommer ' + text_semis + '</div>').appendTo('#menu_potager');
    l_fiche.css('margin-top','20px')
    l_fiche.on( "click",  function(e) {
        $('#menu_potager').remove();
        bootbox.prompt({
            title: "Vous pouvez définir un nom pour le semis :",
            value: element.find('.un_semis_nom').last().text(),
            callback: function(result) {
                if(result==null){
                    return
                }
                rename_semis(result,element)
            }
        })
        
    })

    var l_fiche=$('<div class="menu_potager_ligne" >Supprimer ' + text_semis + '</div>').appendTo('#menu_potager');
    l_fiche.on( "click",  function(e) {
        bootbox.confirm("Veuillez confirmer la demande de suppression", function(result){ 
            if(result==null || result==false){
                return
            }
            $('#menu_potager').remove();
            delete_semis(element)
        });
        
    })

    
    

}
function rename_semis(nom,element){
    if(mode_selection_multiple){
        //on a pas encore récupéré la sélection multiple
        if(liste_semis_multiple == null){
            liste_semis_multiple=get_list_selection_semis();
        }
        if(liste_semis_multiple.length == 0){
            //on a fini
            liste_semis_multiple=null;
        }else{
            //on prend le premier element et on le traite et le supprime
            var semis=liste_semis_multiple[0];
            liste_semis_multiple.splice(0, 1);
            //marque_comme(semis.attr('semence'),element.attr('index_semis'),kd.key,date_s,element.attr('nom'),e);
            setTimeout(() => {
                rename_semis_suite(nom,semis)
            }, 200);
            
        }

    }else{
        rename_semis_suite(nom,element)
    }
}

function rename_semis_suite(nom,element){
    
            $.ajax({
                type: 'POST',
                url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
                data: {
                    action: 'rename_semis',
                    id_semence: init(element.attr('semence')),
                    nom_semis:init(nom),
                    ind_semis:init(element.attr('index_semis')),
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

                    element.find('.un_semis_nom').last().text(nom);
                    if(mode_selection_multiple){
                        rename_semis(nom,element)
                    }

                }
            });

           
        
}

function rupture_semence(element,id_semence,rupture='oui'){
    $.ajax({
        type: 'POST',
        url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'rupture_semence',
            id_semence: init(id_semence),
            rupture: init(rupture)
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


            element.attr('rupture',rupture)
            element.find('.rupture_semence').hide();
            if(rupture=='oui'){
                element.find('.rupture_semence').show();
            }

        }
    });
    
}

function delete_semis(element){
    if(mode_selection_multiple){
        //on a pas encore récupéré la sélection multiple
        if(liste_semis_multiple == null){
            liste_semis_multiple=get_list_selection_semis();
        }
        if(liste_semis_multiple.length == 0){
            //on a fini
            liste_semis_multiple=null;
        }else{
            //on prend le premier element et on le traite et le supprime
            var semis=liste_semis_multiple[0];
            liste_semis_multiple.splice(0, 1);
            setTimeout(() => {
                delete_semis_suite(semis)
            }, 200);
            
        }

    }else{
        delete_semis_suite(element)
    }
}
function delete_semis_suite(element){
    
            $.ajax({
                type: 'POST',
                url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
                data: {
                    action: 'delete_semis',
                    id_semence: init(element.attr('semence')),
                    ind_semis:init(element.attr('index_semis')),
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
                    element.remove();
                    if(mode_selection_multiple){
                        delete_semis(element)
                    }

                }
            });
            
}

function nouveau_semis(id_semence,index_semis){
    bootbox.prompt({
        title: "Vous pouvez définir un nom pour le semis :",
        value: 'Semis du ' + get_date_du_jour(),
        callback: function(result) {
            if(result==null){
                return
            }

            
            //afficher_detail_semis();
            var ligne_planning=$('.potager_ligne[semence="' + id_semence + '"]')
            if(ligne_planning.length !=1){
                return
            }
            ligne_planning=$(ligne_planning[0]);
            afficher_detail_semis(ligne_planning)
            var liste_semis=$(ligne_planning.find('.liste_semis')[0])

            var nom_semis=result

            var un_semis=$('<div/>', {
                "class": 'un_semis',
            }).appendTo(liste_semis);
            un_semis.attr('nom',nom_semis);
            un_semis.attr('semence',id_semence);
            un_semis.attr('masque','non');
            un_semis.attr('index_semis',index_semis);
            //index_semis



            var un_semis_case=$('<div/>', {
                "class": 'case_selection_semis',
            }).appendTo(un_semis);
            un_semis_case.hide();

            var un_semis_nom=$('<div/>', {
                "class": 'un_semis_nom',
            }).appendTo(un_semis);
            un_semis_nom.text(nom_semis)

            var un_semis_potager_ligne_planning=$('<div/>', {
                "class": 'potager_ligne_planning',
            }).appendTo(un_semis);

            for(var i=1;i<=12;i++){
                var un_semis_mois=$('<div/>', {
                    "class": 'potager_ligne_planning_mois',
                }).appendTo(un_semis_potager_ligne_planning);
            }



            $.ajax({
                type: 'POST',
                url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
                data: {
                    action: 'nouveau_semis',
                    id_semence: init(id_semence),
                    nom_semis:init(nom_semis)
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
            });
            action_semis();
        }
    });
    




                
    
}


function menu_clic_droit(element,id_semence,event){
    $('.pop_up_detail_semence').remove();
    $('#menu_potager').remove();
    $('<div id="menu_potager"></div>').appendTo($('#potager_planning').parent());
    $('#menu_potager').css('top',(element.offset().top-20 )+ 'px');
    $('#menu_potager').css('left',event.pageX+ 'px');
    var l_fiche=$('<div class="menu_potager_ligne" >Accéder à la fiche de la semence</div>').appendTo('#menu_potager');
    l_fiche.on( "click",  function(e) {
        $('#menu_potager').remove();
        window.open(base_url + '/index.php?v=d&m=potager&p=potager&id=' +id_semence ,'_blank');
    })

    var ind_semis_new=element.parent().find('.un_semis').length;
    //alert(ind_semis_new)
    var l_semis_new=$('<div class="menu_potager_ligne" >Nouveau semis</div>').appendTo('#menu_potager');
    l_semis_new.on( "click",  function(e) {
        mode_selection_semis(false);
        $('#menu_potager').remove();
        nouveau_semis(id_semence,ind_semis_new);
    })


    //var l_semis_new=$('<div class="menu_potager_ligne" >Marquer la semence en rupture de stock</div>').appendTo('#menu_potager');
    var l_semis_new=$('<div/>', {
        "class": 'menu_potager_ligne',
    }).appendTo('#menu_potager');
    l_semis_new.text('Marquer la semence en rupture de stock')
    l_semis_new.on( "click",  function(e) {
        mode_selection_semis(false);
        $('#menu_potager').remove();
        mode='oui'
        if(element.parent().attr('rupture')=='oui'){
            mode='non'
        }
        rupture_semence(element.parent(),id_semence,mode);
    })
    console.log(element)
    if(element.parent().attr('rupture')=='oui'){
        l_semis_new.text('Ne plus marquer la semence en rupture de stock')
    }


}

function get_index_affichage_semis(ligne_planning,index_semis){
    i_a=-1;
    i=0;
    ligne_planning.find('.un_semis').each(function() {
        if(i<=index_semis){
            if($(this).is(":hidden")==false){
                console.log('visible');
                i_a++;
            }
        }
        i++;
    })
    console.log('ia : ' + index_semis + ' - ' + i_a)
    return i_a;
}


function afficher_detail_semis(ligne_planning){
    //console.log(ligne_planning)
    var liste_semis=$(ligne_planning.find('.liste_semis')[0])
    if(liste_semis.is(":hidden")){
        liste_semis.show();
        ligne_planning.find('.date_point').each(function() {

            var i_s=get_index_affichage_semis(ligne_planning,parseInt($(this).attr('index_semis')));
            $(this).css('top',((i_s) * 20 + 34) + 'px')
        });
    }else{
        //console.log('deja ouvert')
    }
}
function masquer_detail_semis(ligne_planning){
    var liste_semis=$(ligne_planning.find('.liste_semis')[0])
    if(liste_semis.is(":hidden")==false){
        liste_semis.hide();
        ligne_planning.find('.date_point').each(function() {
            $(this).css('top','')
        })
    }
}

$('.potager_ligne_principale').on("click",function(e){
    $('#menu_potager').remove();
    var liste_semis=$($(this).parent().find('.liste_semis')[0])
    if(liste_semis.is(":hidden")){
        afficher_detail_semis($(this).parent());
    }else{
        masquer_detail_semis($(this).parent());
    }
});


$('.potager_ligne_principale').off("contextmenu").on("contextmenu",function(e){
    console.log('contextmenu')
    menu_clic_droit($(e.currentTarget),$(e.currentTarget).parent().attr('semence'),e);
    e.stopPropagation();
    return false;
});
$('.potager_ligne_principale').on("dblclick",function(e){
    window.open('/index.php?v=d&m=potager&p=potager&id=' +$(e.currentTarget).parent().attr('semence') ,'_self');
});


function action_semis(){
    $('.un_semis').off().bind("contextmenu",function(e){
        menu_clic_droit_semis($(e.currentTarget),e);
        e.stopPropagation();
        return false;
    }); 
    event_selection_multiple();
}
action_semis();


var hover;
$('.nom_semence').on("mouseleave",function(e){
    if(hover != null){
        clearTimeout(hover)
    }

    function test(){

            var stop=0;
            $('.pop_up_detail_semence').on('mouseover',function(){
                stop=1;
                $('.pop_up_detail_semence').on('mouseleave',function(){

                    test();
                })
            })
            
            hover=setTimeout(() => {
                if(stop==1){
                    return
                }else{
                    $('.pop_up_detail_semence').remove();
                }
                
            },1000);
            

    }
    if($('.pop_up_detail_semence').length>0){
        test();
    }
    
})


$('.nom_semence').on("mouseenter",function(e){
    var ligneS=$(this).parent().parent().parent();
    if(ligneS.find('.pop_up_detail_semence').length!=0){
        //console.log('do nothing')
        return
    }
    if(hover != null){
        clearTimeout(hover)
    }
    hover=setTimeout(() => {
        if($('#menu_potager').length != 0){
            return
        }
        var u_semence=new semence();
        u_semence.id_bdd=ligneS.attr('semence')
        u_semence.objet_cree_f=ligneS;
        u_semence.charger_more_info_from_serveur('planning');

    }, (1000));

}); 

$('#potager_planning').bind("contextmenu",function(e){
return false;
});

function normalize(text){
    if(text == null){
        return '';
    }
return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}


function filter_affichage(){
    console.log('filter_affichage')
    $('#menu_potager').remove();
    $('.potager_ligne').show();
    $('.une_date_un_semis').show();
    $('.un_semis').attr('masque','non');
    $('.potager_ligne').removeClass('couleur1');
    $('.potager_ligne').removeClass('couleur2');

    if($('#filtre_potager').val() =='rupture_only'){
        $('.potager_ligne').hide();
        $('.potager_ligne[rupture=\'oui\']').show();
    }




    var lignes=$('.potager_ligne');
    var annee_en_cours=$('#g_date_d').text()
    couleur='couleur1'
    $('.potager_ligne').each(function() {
        //console.log(normalize($('#filtre_recherche').val()))
        if(!normalize($($(this)).text()).includes(normalize($('#filtre_recherche').val()))){
            $(this).hide();
        }

        //semis_annee
        $(this).find('.un_semis').show();
        $(this).find('.un_semis').each(function() {
            annee_semis=$(this).attr('d_semis');
            if(annee_semis==''){
                annee_semis=$(this).attr('d_plantation');
            }
            if(annee_semis==''){
                annee_semis=$(this).attr('d_germination');
            }
            if(annee_semis==''){
                annee_semis=$(this).attr('d_eclaircissage');
            }
            if(annee_semis==''){
                annee_semis=$(this).attr('d_rempotage');
            }
            if(annee_semis==''){
                annee_semis=$(this).attr('d_recolte');
            }

            if(annee_semis!=null && annee_semis.length>4){
                annee_semis=annee_semis.substring(0, 4)
                //console.log('annee semis : ' + annee_semis)
            }

            function hide_semis(semis){
                console.log('hide_semis')
                if(semis.attr('masque') == 'non'){
                    console.log('hide_semis non')
                    semis.hide();
                    semis.parent().parent().find('.une_date_un_semis[index_semis="' + semis.attr('index_semis') + '"]').hide();
                    semis.attr('masque','oui');
                }else{
                    semis.attr('masque','non');
                }
            }
            
            if($('#filtre_semis').val() != '' && ($('#filtre_semis').val() == 'semis_annee' && annee_semis!=annee_en_cours)){
                hide_semis($(this));
            //     $(this).hide();
            //     $(this).parent().parent().find('.une_date_un_semis[index_semis="' + $(this).attr('index_semis') + '"]').hide();
            //     $(this).attr('masque','oui');
            // }else{
            //     $(this).attr('masque','non');
            }

            if($(this).attr('masque')=='non' && $('#filtre_potager').val() =='plante_seme_only_non_germe'){
                if($(this).attr('d_germination')!='' || ($(this).attr('d_semis')=='' && $(this).attr('d_plantation')=='')){
                    // $(this).hide();
                    // $(this).attr('masque','oui');
                    hide_semis($(this));
                }
            }
        });

        // if($('#filtre_semis').val() == 'semis_annee' && $(this).find('.un_semis[masque!=\'oui\']').length ==0){
        //     $(this).hide();
        // }
        

        if($('#filtre_potager_type').val() != '' && $('#filtre_potager_type').val() != $(this).attr('type_s')){
            $(this).hide();
        }

        if($('#filtre_rupture').val() =='afficher'){
            if(($(this).attr('rupture')!='oui')){
                $(this).hide();
            }
        }
        if($('#filtre_rupture').val() =='masquer'){
            if(($(this).attr('rupture')=='oui')){
                $(this).hide();
            }
        }

        if($('#filtre_potager_enso').val() != '' && normalize($(this).attr('ensoleillement')).indexOf(normalize($('#filtre_potager_enso').val())) == -1){
            $(this).hide();
        }

        if($('#filtre_potager').val() =='seme_only'){
            if(($(this).find('.un_semis[d_semis!=\'\'][masque!=\'oui\']').length ==0)){
                $(this).hide();
            }
        }
        if($('#filtre_potager').val() =='plante_only'){
            if(($(this).find('.un_semis[d_plantation!=\'\'][masque!=\'oui\']').length ==0)){
                $(this).hide();
            }
        }
        if($('#filtre_potager').val() =='plante_seme_only'){
            if(($(this).find('.un_semis[d_semis!=\'\'][masque!=\'oui\']').length ==0) && ($(this).find('.un_semis[d_plantation!=\'\'][masque!=\'oui\']').length ==0)){
                $(this).hide();
            }
        }
        if($('#filtre_potager').val() =='plante_seme_only_non_germe'){
            if(($(this).find('.un_semis[d_semis!=\'\'][d_germination=\'\'][masque!=\'oui\']').length ==0) && ($(this).find('.un_semis[d_plantation!=\'\'][d_germination=\'\'][masque!=\'oui\']').length ==0)){
                $(this).hide();
            }
        }

        if($('#filtre_potager').val() =='non_seme_only'){
            if((($(this).find('.un_semis[d_semis=\'\'][masque!=\'oui\']').length ==0) || ($(this).find('.un_semis[d_plantation=\'\'][masque!=\'oui\']').length ==0)) && ($(this).find('.un_semis[masque!=\'oui\']').length !=0)){
                $(this).hide();
            }
        }

        if($('#filtre_comestible').val() != '' && normalize($(this).attr('comestible')).indexOf(normalize($('#filtre_comestible').val())) == -1){
            $(this).hide();
        }

        if($('#filtre_eclaircissage').val() != '' && normalize($(this).attr('eclaircissage')).indexOf(normalize($('#filtre_eclaircissage').val())) == -1){
            $(this).hide();
        }

        if($(this).is(":visible")){
            $(this).addClass(couleur)
            if(couleur=='couleur1'){
                couleur='couleur2'
            }else{
                couleur='couleur1'
            }
        }

    });
}

$('.un_filtre').on('change',function(e){
    filter_affichage();
    refresh_all_point();
});
$('.un_filtre_i').on('input',function(e){
    filter_affichage();
    refresh_all_point();
});

$('#bouton_print').on('click',function(){print_liste()});

    function print_liste(){
    var content=$('#potager_planning').html();
    content=content.replaceAll('_d.png', '.png')
    var strWindowFeatures = "menubar=no,location=yes,resizable=yes,scrollbars=no,status=no,height=600,width=600";

    var mywindow = window.open( "#Print potager", "new div",strWindowFeatures );
    mywindow.document.write( "<!DOCTYPE html><html><head><title></title>" );
    mywindow.document.write( "<link rel=\"stylesheet\" href=\"" + base_url + "plugins/jardin/desktop/css/planning_print.css\" type=\"text/css\"/><style type=\"text/css\" media=\"print\">*{-webkit-print-color-adjust: exact !important; /*Chrome, Safari */ color-adjust: exact !important;  /*Firefox*/}</style>" );
    mywindow.document.write( "</head><body><h1>" + $('#g_date_d').text() + " - Planning de mes semences</h1><br/>" );
    mywindow.document.write(content);
    mywindow.document.write( "</body></html>" );

    setTimeout(() => {
    mywindow.self.focus();  
    mywindow.self.print();
    }, 1000);                      
    


    //mywindow.close();

return true;

}


$('body').on('click',()=>{
    $('.pop_up_detail_semence').remove();
    $('#menu_potager').remove();
})

function show_all_semis(show_all){
    if(show_all){
        $('#bouton_open_all_c').removeClass('fa-angle-double-down')
        $('#bouton_open_all_c').addClass('fa-angle-double-up')
        $('#bouton_open_all').attr('openO','oui')
        $('.potager_ligne').each(function(){
            afficher_detail_semis($(this))
        })
    }else{
        $('#bouton_open_all_c').addClass('fa-angle-double-down')
        $('#bouton_open_all_c').removeClass('fa-angle-double-up')
        $('#bouton_open_all').attr('openO','non')
        $('.potager_ligne').each(function(){
            masquer_detail_semis($(this))
        })
    }
}

$('#bouton_open_all').on('click',function(){
     show_all_semis($(this).attr('openO')=='non');//){
})

function refresh_all_point(){
    $('.date_peremption').remove();
    $('.date_point').remove();
    $('.potager_ligne').each(function() {
        generer_date_ligne_semis(this);
    });
    trier_liste();
}

$('#b_date_plus').on('click',()=>{
    $('#g_date_d').text(parseInt($('#g_date_d').text()) + 1);
    update_ligne_year();
})
$('#b_date_moins').on('click',()=>{
    $('#g_date_d').text(parseInt($('#g_date_d').text()) - 1);
    update_ligne_year();
})

function update_ligne_year(){
    refresh_all_point();

    if(parseInt($('#g_date_d').text()) == (new Date).getFullYear()){
        $('#ligne_date').addClass('ligne_date')
        $('#ligne_date').removeClass('ligne_date_d')
    }else{
        $('#ligne_date').removeClass('ligne_date')
        $('#ligne_date').addClass('ligne_date_d')
    }

    //trier_liste();
    
}


$('#g_date_d').text((new Date).getFullYear())
refresh_all_point();



function mode_selection_semis(force_mode=null){
    if(force_mode != null){
        mode_selection_multiple=!force_mode;
    }
    if(mode_selection_multiple == false){
        show_all_semis(true)
        $('.case_selection_semis').show();
        mode_selection_multiple=true;
    }else{
        show_all_semis(false)
        $('.case_selection_semis').hide();
        mode_selection_multiple=false;
    }
    
}

$('#b_selection_multiple').on('click',function(){
    mode_selection_semis()})

var mode_selection_multiple=false;

function event_selection_multiple(){
    $('.case_selection_semis').off().on('click',function(){
        if($(this).hasClass('case_selection_semis_coche')){
            $(this).removeClass('case_selection_semis_coche')
        }else{
            $(this).addClass('case_selection_semis_coche')
        }
    })
}
event_selection_multiple();


function get_list_selection_semis(){
    var result=[];
    $('.case_selection_semis_coche').each(function(){
        var ligne_semis=$(this).parent();
        result.push(ligne_semis)
    })
    return  result;
}


//trier_liste();
function trier_liste(){
    console.log('trier_liste')
    var annee_en_cours=$('#g_date_d').text()
    var that=$(this);
    that.hide();
    $.ajax({
        type: 'POST',
        url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
        data: {
            action: 'get_nbr_info_all',
            annee: init(annee_en_cours)
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
            data.result.forEach(element => {
                refresh_un_element_ligne(null,element)
            })
            filter_affichage();
            //refresh_all_point();
        }
    })
        
    
    
    afficher_tache_planning()
}



get_config('trie_planning',set_init_trie);
function set_init_trie(data){
    console.log('set_init_trie');
    if(data != null){
        //console.log(data);
        $('#filtre_trie').val(data.result)
        trier_liste();
    }
    console.log('set_init_trie 2');
    $('#filtre_trie').on('change',function(){
        save_config('trie_planning',$('#filtre_trie').val());
        trier_liste();
    })
    
}

mode_trie="qte_puis_alpha"//alpha_puis_qte
function refresh_un_element_ligne(un_element=null,data){
    mode_trie=$('#filtre_trie').val();
    if(mode_trie==''){
        mode_trie="qte_puis_alpha"
    }

    //console.log('trie ' + mode_trie)
    filtre_trie
    var annee_en_cours=$('#g_date_d').text()
    data.valeur=0;
    if(data.d_semis == ''){
        data.d_semis=0
    }
    if(data.d_plantation == ''){
        data.d_plantation=0
    }
    if(data.d_recolte == ''){
        data.d_recolte=0
    }
    if(data.d_recolte == ''){
        data.d_recolte=0
    }

    if(data.d_semis != 0){
        data.valeur=data.d_semis
    }else{
        data.valeur=data.d_plantation
    }

    var log=false;

    if(un_element == null){
        un_element=$('.potager_ligne[semence=' + data.id + ']')
    }
    if(un_element.attr('semence') == '345'){
        log=false
    }

    if(log){
        console.log(data)
        console.log(un_element.attr('semence') + ' - ' + data.valeur)
        console.log('> start insert')
    }
    
    un_element.find('.potager_ligne_semence_qte').first().text(data.valeur) // a modifier
    un_element.find('.potager_ligne_semence_qte').first().attr('title','Quantité totale : ' + un_element.find('.potager_ligne_semence_qte').first().attr('qte_total') + '<br/>' + annee_en_cours + '<br>Quantité semée : ' + data.d_semis + '<br/>Quantité plantée : '+ data.d_plantation + '<br/>Poid récolte : '+ data.d_recolte +'g')
    
    var insertOk=false;
    
    $('.potager_ligne').each(function(){
        if(mode_trie=="qte_puis_alpha"){
            if(log){
                console.log($(this).find('.potager_ligne_semence_qte').first().text() + ' - ' + (parseInt($(this).find('.potager_ligne_semence_qte').first().text()) || 0))
            }
            if($(this).attr('semence') != un_element.attr('semence')){
                //pour le trie , d'abord on favorise la qté
                if((parseInt($(this).find('.potager_ligne_semence_qte').first().text()) || 0) < data.valeur){
                    un_element.insertBefore($(this));
                    insertOk=true;
                    return false 
                }
                //et si pour une meme qté, on regarde l'ordre alpha
                if((parseInt($(this).find('.potager_ligne_semence_qte').first().text()) || 0) == data.valeur){
                    //on compare le nom
                    var nomElement=un_element.find('.nom_semence').first().text()
                    var noomLigne=$(this).find('.nom_semence').first().text()
                    if(nomElement.localeCompare(noomLigne)<0){
                        un_element.insertBefore($(this));
                        insertOk=true;
                        return false 
                    }
                }
            }
        }

        if(mode_trie=="alpha_puis_qte"){
            if(log){
                console.log($(this).find('.potager_ligne_semence_qte').first().text() + ' - ' + (parseInt($(this).find('.potager_ligne_semence_qte').first().text()) || 0))
            }
            if($(this).attr('semence') != un_element.attr('semence')){
                var nomElement=un_element.find('.nom_semence').first().text()
                var noomLigne=$(this).find('.nom_semence').first().text()
                if(nomElement.localeCompare(noomLigne)<0){
                    un_element.insertBefore($(this));
                    insertOk=true;
                    return false 
                }else if(nomElement.localeCompare(noomLigne)==0){
                    //si exactement meme nom, on regarde la qté
                    if((parseInt($(this).find('.potager_ligne_semence_qte').first().text()) || 0) < data.valeur){
                        un_element.insertBefore($(this));
                        insertOk=true;
                        return false 
                    }
                }

                

                // if((parseInt($(this).find('.potager_ligne_semence_qte').first().text()) || 0) == data.valeur){
                //     //on compare le nom
                //     var nomElement=un_element.find('.nom_semence').first().text()
                //     var noomLigne=$(this).find('.nom_semence').first().text()
                //     if(nomElement.localeCompare(noomLigne)<0){
                //         un_element.insertBefore($(this));
                //         insertOk=true;
                //         return false 
                //     }
                // }
            }
        }
        
    })
    if(insertOk == false){

    }
    if(log){
        console.log('fin')
    }
    un_element.show();
    
}





//--------------tache planning
function dateDiff(date1, date2){
    var diff = {}                           // Initialisation du retour
    var tmp = date2 - date1;
 
    tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60;                    // Extraction du nombre de secondes
 
    tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
    diff.min = tmp % 60;                    // Extraction du nombre de minutes
 
    tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
    diff.hour = tmp % 24;                   // Extraction du nombre d'heures
     
    tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
    diff.day = tmp;

    diff.week = Math.floor(tmp/7);
    diff.year = date2.getFullYear() - date1.getFullYear();


    diff.month = date2.getMonth() - date1.getMonth() + diff.year * 12;
    return diff;
}
function date_compare_tache(date_i,dateTMP,spec='1j'){
    var indexJ=spec.indexOf('j');
    var indexS=spec.indexOf('s');
    var indexM=spec.indexOf('m');
    var indexA=spec.indexOf('a');
    var nbrJ=-1;
    var nbrS=-1;
    var nbrM=-1;
    var nbrA=-1;
    var diff = dateDiff(date_i, dateTMP);

    if(spec == ''){
        if(date_i.getDate() == dateTMP.getDate() && date_i.getMonth() == dateTMP.getMonth() && date_i.getFullYear() == dateTMP.getFullYear()){
            return 1;
        }
    }


    if(indexJ != -1){
        nbrJ=parseInt(spec.substring(0,indexJ))
        if(diff.day % nbrJ == 0&& diff.day>=0){
            return 1
        }else{
            return -1;
        }
    }
    if(indexS != -1){
        nbrS=parseInt(spec.substring(0,indexS))
        if(diff.week % nbrS == 0 && diff.week>=0){
            return 7
        }else{
            return -1;
        }
    }
    if(indexM != -1){
        nbrM=parseInt(spec.substring(0,indexM))
        if(diff.month % nbrM == 0 && diff.month>=0 && date_i.getDate() == dateTMP.getDate()){
            return 27
        }else{
            return -1;
        }
    }
    if(indexA != -1){
        nbrA=parseInt(spec.substring(0,indexA))
        if(diff.year % nbrA == 0 && diff.year>=0 && date_i.getMonth() == dateTMP.getMonth() && date_i.getDate() == dateTMP.getDate()){
            return 365
        }else{
            return -1;
        }
    }
     
     return -1;

}

function afficher_tache_planning(){
    $('.une_tache_planning').remove();

    $('.une_tache').each(function () {
        var el=$(this);
        var ligne_semence=$(this).parent().parent();
        var date_i=new Date(el.attr('date'));
        var type=el.attr('type');
        var couleur=el.attr('couleur');

        // console.log(date_i + ' - ' + type)
        // console.log('date : ' + date_i.getDate() + '/' + (date_i.getMonth() + 1))

        var dateTMP=new Date(parseInt($('#g_date_d').text()), 0, 1)
        while (dateTMP.getFullYear() == parseInt($('#g_date_d').text())) {
            var resultCT=date_compare_tache(date_i,dateTMP,type)

            if(resultCT != -1){
                var point=date_ligne_semis(ligne_semence,dateJS_to_dateFR(dateTMP),'une_tache_planning','test',nom_semis='')
                point.css('border-top-color',couleur)
                point.attr('title',el.attr('nom') + '\n\nDate initiale de la tache : ' + dateJS_to_dateFR(date_i) + '\nDate de la tache : ' + dateJS_to_dateFR(dateTMP) + '\n\nCommentaire : \n' + el.attr('commentaire'))
            }else{
                resultCT=1;
            }

            
            dateTMP.setDate(dateTMP.getDate() + resultCT);
        }
        
        //console.log('fin');

    })
}
