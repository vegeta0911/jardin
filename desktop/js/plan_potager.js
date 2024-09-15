object_selected=null;
object_selected_type='';
object_selected_father_type='';
move_all_obj=false;
is_resizing=false;
selection_multiple=false;
mode_nom_semence_more_info=false;




start_click = Date.now();


need_to_save_object=false;
var x_s=null;
var y_s=null;
// var dark_mode=false;

// if($($('body')[0]).attr('data-theme').indexOf('Dark') != -1){
//     dark_mode=true;
// }


function unselect_all(){
    move_all_obj=false;
    need_to_save_object=false;
    object_selected=null;

    is_resizing=false;
    object_selected_type='';
    object_selected_father_type='';
    $('.un_objet_selected').removeClass('un_objet_selected')
    //$('.resize_object_tmp').remove();
    $('.square_selection').remove();
    

    if(document.selection != null){
        document.selection.empty();
    }
    //$('#menu_obj').remove();
}

function get_current_potager(){
    return get_potager_byNode($($('#id_plan_potager').find('.un_plan_potager_father')[0]))
}

function allow_resize_object(target){
    if($('.resize_object_tmp').length == 0){
        var resize_el=$('<div class="resize_object_tmp"></div>').appendTo($(target));
        resize_el.attr('title','cliquez et maintenir pour redimensionner l\'objet')
        set_resize_event(resize_el)

        if(isTouchDevice){
            resize_el.css('width','20px')
            resize_el.css('height','20px')
        }
    }
}

function allow_turn_object(target){
    if($('.turn_object_tmp').length == 0){
        var resize_el=$('<div class="turn_object_tmp"></div>').appendTo($(target));
        resize_el.attr('title','cliquez et maintenir pour effectuer une rotation de l\'objet')
        set_turn_event(resize_el)
    }
}

//----Clic souris----------------------------
    $('#id_plan_potager').on('click',function(e){
        $('.recherche_semence_menu').remove();
        $('.plan_potager_liste_element_liste').remove();
        $('#menu_obj').remove();
        var potager_current=get_current_potager();
        if(potager_current != null){
            potager_current.mem_x=null;
            potager_current.mem_y=null;
        }
        console.log('remove')
        
    });
    $('#id_plan_potager').bind("contextmenu",function(event){
        //return false;
    });

    $('#id_plan_potager').on('mouseup',function(e){
        relache_clic_tactile(e);
    });
    $('#id_plan_potager').on('touchend',function(e){
        relache_clic_tactile(e);
    });
    //relache le click
    function relache_clic_tactile(e){
        add_debug('relache_clic_tactile ' + object_selected_type + ' ' + need_to_save_object)

        $('#id_plan_potager').removeClass('stop-scrolling')
        setTimeout(function(){
           is_resizing=false;
        },1)

        if(object_selected != null && object_selected_type == 'element_turn'){
            if(object_selected_father_type =='un_objet'){
                var objet=$($(object_selected).parent().parent().children()[0]);
                var objet_s=get_objet_byNode(objet)
                if(objet_s==null){
                    object_selected=null
                    return
                }

                var angle_o=objet_s.objet_cree_f.css('transform');
                //console.log('save a:'+angle_o)
                var angle_base=0
                if(angle_o == 'none'){
                    angle_base=0
                }else{
                    angle_o=objet_s.objet_cree_f.attr('style')
                    var is=angle_o.indexOf('rotate') + 7
                    
                    var ie=angle_o.indexOf('deg')
                    angle_base=parseInt(angle_o.substr(is,(ie-is)))
                }
                objet_s.angle=angle_base;
                add_cancel_action('Turn obj',objet_s)
                console.log('element_turn')
                objet_s.save();
            }
        }
        
        if(object_selected != null && object_selected_type == 'element_resize'){

            if(object_selected_father_type =='un_plan' && need_to_save_object){
                var plan_potager=$($(object_selected).parent().parent().children()[0]);
                console.log('element_resize')
                get_potager_byNode(plan_potager).save();
            }
            
            if(object_selected_father_type =='un_objet'){
                var objet=$($(object_selected).parent().parent().children()[0]);
                add_cancel_action('Resize obj',get_objet_byNode(objet))
                console.log('un_objet element_resize')
                get_objet_byNode(objet).save();
            }

            if(object_selected_father_type =='square_selection'){
                var objet=$(object_selected.parent().parent()[0]);
                if(e.shiftKey == false){
                    get_potager_byNode(objet).deselect_all_objet();
                }
                
                get_potager_byNode(objet).select_item_in_square(object_selected.position().top,object_selected.position().left,object_selected.height(),object_selected.width());
            }
            
        }

        if(object_selected != null && object_selected_type == 'un_objet' && need_to_save_object){

            if(move_all_obj || selection_multiple){
                var objet_s=get_objet_byNode(object_selected)
                if(objet_s==null){
                    object_selected=null
                    return
                }
                var potager=get_potager_byId(objet_s.id_father)
                if(potager == null){
                    return
                }
    
                list_to_save=[];
                var objs_action=potager.objs;
                if(selection_multiple){
                    objs_action=potager.get_objs_selected();
                }
                add_cancel_action('Déplacement objs',null,objs_action)
                objs_action.forEach(obj => {
                    obj.fin_de_mouvement();
                    obj.fin_selectionne();
                    list_to_save.push(obj);
                    //obj.save();
                });

                next_save_obj();

                
    
            }else{


                var un_obj=get_objet_byNode($(object_selected))
                if(un_obj==null){
                    object_selected=null
                    return
                }
                add_cancel_action('Déplacement obj',un_obj)
                un_obj.fin_de_mouvement();
                un_obj.fin_selectionne();
                un_obj.save();
                
                
            }
            
        }

        unselect_all();
    }

    
    

    //on clic sur un plan potager
    $('.un_plan_potager').on('mousedown',function(event){
        if(object_selected == null){
            object_selected=$(event.currentTarget);
            x_s=event.pageX;
            y_s=event.pageY;
            object_selected_type = 'un_plan';
            need_to_save_object=false;
        }

        event.stopPropagation();
    })

    //on clic sur un point de resize
    function set_resize_event(resize_el){
        $(resize_el).on('mousedown touchstart',function(event){
            if(object_selected == null){
                $('#id_plan_potager').addClass('stop-scrolling')
                if(event.touches != null){
                    //alert('touch')
                    x_s=event.touches[0].pageX;
                    y_s=event.touches[0].pageY;
                }else{
                    x_s=event.pageX;
                    y_s=event.pageY;
                }
                object_selected=$(event.currentTarget);
                
                object_selected_type = 'element_resize';
                
                object_selected_father_type='';
                if(object_selected.parent().parent().attr('class') =='un_objet_father'){
                    object_selected_father_type='un_objet';
                }
                if(object_selected.parent().parent().attr('class') =='un_plan_potager_father'){
                    object_selected_father_type='un_plan';
                }
            }

            event.stopPropagation();
        })
    }

        //on clic sur un point de turn
    function set_turn_event(turn_el){
        $(turn_el).on('mousedown touchstart',function(event){
            if(object_selected == null){
                $('#id_plan_potager').addClass('stop-scrolling')
                object_selected=$(event.currentTarget);
                if(event.touches != null){
                    //alert('touch')
                    x_s=event.touches[0].pageX;
                    y_s=event.touches[0].pageY;
                }else{
                    x_s=event.pageX;
                    y_s=event.pageY;
                }
                object_selected_type = 'element_turn';
                
                correcteur_rot=0
                mem_rot=0

                object_selected_father_type='';
                if(object_selected.parent().parent().attr('class') =='un_objet_father'){
                    object_selected_father_type='un_objet';
                   
                    var objet_s=get_objet_byNode(object_selected.parent())
                    if(objet_s==null){
                        object_selected=null
                        return
                    }
                    objet_s.set_offset();

                }
                if(object_selected.parent().attr('class') =='un_plan_potager_father'){
                    object_selected_father_type=''; //un_plan
                }
            }

            event.stopPropagation();
        })


    }
    
//----Clic souris END----------------------------


// $("body").on('touchstart',function(event){
//     if(event.touches.length == 2){
//         var potager=get_current_potager();
//         if(potager != null && selection_multiple){
//             if(potager.get_objs_selected().length ==1){
//                 console.log('element_resize TACTILE')
//                 object_selected_type='element_resize'
//                 object_selected=potager.get_objs_selected()[0].objet_cree
//             }
//         }
        
//     }
// })

//----Move souris----------------------------

//this.node.bind("touchs",function(event){
    //     if(event.touches.length == 2){
    //         that.menu_clic_droit(event.pageX,event.pageY)
    //         event.stopPropagation();
    //         return false;
    //     }
        
    // });
$("#id_plan_potager").mousemove(function(event){
    if(isTouchDevice==false){
        souris_tactile_deplacement(event);
    }
    //console.log('mousemove')
})

$("#id_plan_potager").on('touchmove',function(event){
    souris_tactile_deplacement(event);
})
function souris_tactile_deplacement(event){
    
    var eX=null;
    var eY=null;
    if(event.originalEvent.touches){
        // console.log(event)
        // if(event.originalEvent == null){
        //     return
        // }
        var touch = event.originalEvent.touches[0]
        eX=touch.pageX
        eY=touch.pageY
        add_debug('souris_tactile_deplacement tact',3)
    }else{
        eX=event.pageX
        eY=event.pageY
        add_debug('souris_tactile_deplacement mouse',3)
    }
    


    
    //on déplace un objet
    if(object_selected != null && object_selected_type == 'un_objet'){
        $('#menu_obj').remove();
        if(move_all_obj || selection_multiple){ //si on a appuyer sur CTR , on déplace tout
            var objet_s=get_objet_byNode(object_selected)
            if(objet_s==null){
                object_selected=null
                return
            }
            var potager=get_potager_byId(objet_s.id_father)
            if(potager == null){
                return
            }

            var objs_action=potager.objs;
            if(selection_multiple){
                objs_action=potager.get_objs_selected();
            }
            objs_action.forEach(obj => {
                obj.mouvement(eX,eY);
            });

            x_s=eX;
            y_s=eY;

        }else{
            var objet_s=get_objet_byNode(object_selected)
            if(objet_s==null){
                object_selected=null
                return
            }
            console.log('move')
            objet_s.mouvement(eX,eY);
            x_s=eX;
            y_s=eY;
        }

    }

    //on redim un objet
    if(object_selected != null && object_selected_type == 'element_resize'){
        $('#menu_obj').remove();
        var objet_select=$($(object_selected).parent().parent().children()[0]);
        if(object_selected_father_type == 'un_plan'){

            objet_select=$($(object_selected).parent().parent().children()[0]);
        }

        if(object_selected_father_type == 'square_selection'){
            objet_select=object_selected;
        }


        var x_coor=parseInt(objet_select.css('width').replace('px','')) + eX-x_s+0;
        var y_coor=parseInt(objet_select.css('height').replace('px','')) + eY-y_s+0;

        if(object_selected_father_type == 'square_selection'){
            $('#menu_obj').remove();
            x_coor=parseInt(objet_select.attr('v_width').replace('px','')) + eX-x_s+0;
            y_coor=parseInt(objet_select.attr('v_height').replace('px','')) + eY-y_s+0;

            var t=parseInt(objet_select.attr('p_clic_t')) ;
            var l=parseInt(objet_select.attr('p_clic_l')) ;

            if(y_coor < 0){
                t=t+y_coor;
            }
            if(x_coor < 0){
                l=l+x_coor;
            }


            objet_select.css('height', Math.abs(y_coor)+ 'px')
            objet_select.css('width', Math.abs(x_coor) + 'px')
            objet_select.css('top', t+ 'px')
            objet_select.css('left', l + 'px')
            objet_select.attr('v_height', y_coor)
            objet_select.attr('v_width', x_coor)
        }
        if(object_selected_father_type == 'un_plan'){
            $('#menu_obj').remove();
            var le_potager=get_potager_byNode(objet_select)
            le_potager.h=y_coor;
            le_potager.w=x_coor;
            console.log('square_selection')
            le_potager.refresh();
            console.log('square_selection ends')
        }
        
        if(object_selected_father_type == 'un_objet'){
            $('#menu_obj').remove();
            x_coor=parseInt(objet_select.css('width').replace('px',''));// + event.pageX-x_s+1;
            y_coor=parseInt(objet_select.css('height').replace('px',''));// + event.pageY-y_s+1;

            var objet_s=get_objet_byNode(objet_select)
            if(objet_s==null){
                object_selected=null
                return
            }
            var pi = Math.PI;
            //objet_s.angle=90
            //objet_s.objet_cree.css('transform','rotate(' + objet_s.angle + 'deg)') //angle_base

            objet_s.is_resiziing();
            var facteur=1.02
            if(objet_s.allow_resize_h){
                objet_s.h=y_coor + (eY-y_s) *  facteur * Math.cos(objet_s.angle * pi / 180)  - (eX-x_s) * facteur * Math.sin(objet_s.angle * pi / 180)  ;
                //objet_s.h=y_coor
            }


            if(objet_s.allow_resize_w){
                objet_s.w=x_coor + (eX-x_s) *  facteur * Math.cos(objet_s.angle * pi / 180) *1 + (eY-y_s) * facteur *Math.sin(objet_s.angle * pi / 180) * 1;
            }

            
            
            objet_s.refresh();
        }

        x_s=eX;
        y_s=eY;
        is_resizing=true;
        need_to_save_object=true;
    }


    //element_turn
    //on tourne un objet
    if(object_selected != null && object_selected_type == 'element_turn'){
        if(object_selected_father_type == 'un_objet'){
        var objet_select=$(object_selected).parent().parent();
        var objet_s=get_objet_byNode(objet_select)
        if(objet_s==null){
            object_selected=null
            return
        }
        var pi = Math.PI;
        
        var angle_e=Math.atan2((eY - objet_s.offset_t),(eX - objet_s.offset_l))* (180/pi)
        var angle_init=Math.atan2((y_s - objet_s.offset_t),(x_s - objet_s.offset_l))* (180/pi)
        //console.log('angle_init : ' + angle_init)
        //console.log('angle_e : ' + angle_e)

        var angle_a_appliquer=(angle_init-angle_e)
        var angle_n=( objet_s.angle - angle_a_appliquer );

        //console.log('angle_a_appliquer : ' + angle_a_appliquer)
        //console.log('objet_s.angle : ' + objet_s.angle)
        //console.log('angle_n : ' + angle_n)

        var angle_n_mod=Math.abs(angle_n%90);
        var signe=1;
        if(angle_n%90 < 0){
            signe=-1
        }
        if(angle_n_mod <=3){
            angle_n=angle_n-(angle_n_mod) * signe;
        }
        
        
        //angle_n=( objet_s.angle - angle_a_appliquer );
        //objet_s.objet_cree.attr('angle_tmp',angle_n)


             
             objet_s.is_resiziing();
             objet_s.objet_cree_f.css('transform-origin','top left')
             objet_s.objet_cree_f.css('transform','rotate(' + angle_n + 'deg)') //angle_base

        }

        is_resizing=true;
        need_to_save_object=true;
    }

    event.stopPropagation();
};
//----Move souris END----------------------------

//--MOUSE OVER---------------------------------------



$('.un_plan_potager_father').on('mouseenter ',function(event){
    if($('#menu_obj').length != 0){
        return false;
    }

    if(object_selected == null){
        var plan_son=$($(event.currentTarget).children()[0]);
        plan_son.addClass('un_objet_selected')
        allow_resize_object(plan_son[0])
    }
})
//--MOUSE OVER---------------------------------------





function un_plan_potager_father_mouseleave(un_plan_potager_father){
    un_plan_potager_father.removeClass('un_objet_selected')
    $('.resize_object_tmp').remove();
}
$('.un_plan_potager_father').on('mouseleave',function(event){
    if(object_selected == null){
        un_plan_potager_father_mouseleave($($(event.currentTarget).children()[0]));
    }
})


// //------------event bouton---------------------
// $('.plan_potager_un_ensemble_bouton').on('click',function(event){
//     alert('ok')
//     var lebouton=$(event.currentTarget);
//     if(lebouton.attr('type_bouton') == ''){
//         return false;
//     }

    
//     var le_potager=$(lebouton.parent().next().children()[0])

//     var obj=new un_objet();
//     obj.type=lebouton.attr('type_bouton')
//     get_potager_byNode(le_potager).ajouter_obj(obj)
//     obj.afficher();
//     obj.charger_more_info_from_serveur();
//     obj.save();
//     alert('ok')
//     add_cancel_action('Ajout élément',obj,null,false,true)
//     event.stopPropagation();

// });

//ajax element----------------------------
function ajax_search_semence(recherche){
    $.ajax({
        type: 'POST',
        url: base_url + '/plugins/potager/core/ajax/potager.ajax.php',
        data: {
            action: 'chercher_semences',
            recherche: init(recherche)
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

            set_resultat_recherche_semence(data);
        }
        });
}


$('.recherche_semence').on('click',function(e){
    if($('.recherche_semence_menu').length != 0){
        $('.recherche_semence_menu').remove();
        return
    }
    $('.plan_potager_liste_element_liste').remove();
    recherche_semence();
    e.stopPropagation();
})
$('.recherche_semence').on('input',function(e){
    recherche_semence(e)
    
})
function recherche_semence(){
    var recherche_semence=$($('.recherche_semence')[0]);
    if($('.recherche_semence_menu').length == 0){
        var recherche_semence_menu=$('<div/>', {
            "class": 'recherche_semence_menu',
        }).appendTo(recherche_semence.parent().parent());
    }
    recherche_semence_menu=$($('.recherche_semence_menu')[0]);

    recherche_semence_menu.empty();
    recherche_semence_menu.text('Recherche...')

    ajax_search_semence(recherche_semence.val())

}
function set_resultat_recherche_semence(data){


    recherche_semence_menu=$($('.recherche_semence_menu')[0]);
    recherche_semence_menu.empty();

    if(data.result.length == 0){
        recherche_semence_menu.text('Aucun résultat !')
    }

    data.result.sort((a, b) => a.nom.localeCompare(b.nom));

    for(var i=0;i<data.result.length;i++){
        var un_resultat_recherche=$('<div/>', {
            "class": 'un_resultat_recherche',
        }).appendTo(recherche_semence_menu);
        un_resultat_recherche.text(data.result[i].nom + ' ' + data.result[i].variete + ' ' + data.result[i].couleur);
        un_resultat_recherche.attr('id_s',data.result[i].id)
        un_resultat_recherche.attr('i_r',i)

        un_resultat_recherche.on('click',function(e){
            get_current_potager().deselect_all_objet()
            var recherche_semence_menu=$($('.recherche_semence_menu')[0]);
            //var le_potager=$(recherche_semence_menu.parent().next().children()[0]);

            
            var un_resultat_recherche=$(e.currentTarget);

            var obj=new semence();
            obj.id_bdd = un_resultat_recherche.attr('id_s')
            var potager=get_current_potager()
            if(potager.mem_x != null && potager.mem_y != null){
                obj.l=potager.mem_x
                obj.t=potager.mem_y
                potager.mem_x = null
                potager.mem_y = null
            }
            potager.unlock_semence();
            potager.ajouter_obj(obj)
            obj.afficher();
            obj.charger_more_info_from_serveur();
            obj.save();
            add_cancel_action('Ajout semence',obj,null,false,true)
            recherche_semence_menu.remove();
        })
    }

}


$('.bouton_print').on('click',function(e){
    $('.pop_up_detail_semence').remove();
    var plan_potager_father=$(e.currentTarget).parent().next();
    //alert(plan_potager_father.attr('class'))
    var nom=$('#nom_potager option:selected').text();

    // if(detectBrowser() == 'Firefox'){
    //     alert('Pensez a activer "Imprimer les arrière-plans" dans "Plus de paramètres" (ne peux être activé par defaut sous Firefox)');
    // }


    printdiv(plan_potager_father,nom)
})


function printdiv( node , nom) {
    if(nom == null){
        nom='';
    }
    var content=node.html();
    var strWindowFeatures = "menubar=no,location=yes,resizable=yes,scrollbars=no,status=no";

    var mywindow = window.open( "#Print potager", "new div",strWindowFeatures );
    mywindow.document.write( "<!DOCTYPE html><html><head><title></title>" );
    mywindow.document.write( "<link rel=\"stylesheet\" href=\"" + base_url + "/plugins/potager/desktop/css/plan_potager_print.css\" type=\"text/css\"/>" );
    mywindow.document.write( "</head><body style=\"color-adjust: exact; -webkit-print-color-adjust: exact\"><h1>Plan du potager '" + nom + "'</h1><br/>" );
    mywindow.document.write(content);
    mywindow.document.write( "</body></html>" );

     setTimeout(() => {
        mywindow.self.focus();
        mywindow.self.print();
     }, 1000);                      
       

    
    //mywindow.close();

    return true;

}


potagers=[];
$('.un_plan_potager_father').each(function() {
    var un_potager=new potager_obj($(this).attr('nom_plan'),parseInt($(this).attr('id_plan')),$(this));
    var node_son=$($(this).children()[0])
    un_potager.h=parseInt(node_son.attr('height').replace('px',''));
    un_potager.w=parseInt(node_son.attr('width').replace('px',''));
    potagers.push(un_potager);
})
potagers.forEach(un_potager => {
    un_potager.get_info_from_server();
})


document.documentElement.style.setProperty('--animate-duration', '0.6s');

var el = '';
function ajouter_info_action(potager,x,y){
    //var el = '';
    jeedom.cmd.getSelectModal({cmd: {}}, function (result) {
        el=result;
        var obj=new cmd_action_info();
        if(x!= null && y!= null){
            obj.l=x;
            obj.t=y;
        }
        obj.id_bdd = result.cmd.id;
        potager.ajouter_obj(obj)
        potager.unlock();
        obj.afficher();
        obj.charger_more_info_from_serveur();
        obj.save();
        add_cancel_action('Ajout info',obj,null,false,true)
    });
}

function ajouter_equipement(potager,x,y){
    //var el = '';
    jeedom.eqLogic.getSelectModal({cmd: {}}, function (result) {
        el=result;
        var obj=new equipement();
        if(x!= null && y!= null){
            obj.l=x;
            obj.t=y;
        }
        
        obj.id_bdd = result.id;
        potager.ajouter_obj(obj)
        potager.unlock();
        obj.afficher();
        obj.charger_more_info_from_serveur();
        obj.save();
        add_cancel_action('Ajout équi',obj,null,false,true)
    });
}
$('.b_add_equipement').on('click',function(){
    var le_potager=$($(this).parent().next().children()[0])
    var potager=get_potager_byNode(le_potager)
    
    ajouter_equipement(potager)
});
$('.b_add_cmd').on('click',function(){
    var le_potager=$($(this).parent().next().children()[0])
    var potager=get_potager_byNode(le_potager)
    ajouter_info_action(potager)
});


$('.plan_potager_liste_element').on('click',function(e){
    ouvrir_menu_add_element(e);
})
function ouvrir_menu_add_element(e){
    $('#menu_obj').remove();
    //var plan_potager_liste_element=$($('.plan_potager_liste_element')[0])
    $('.recherche_semence_menu').remove();
    if($('.plan_potager_liste_element_liste').length != 0){
        $('.plan_potager_liste_element_liste').remove();
       
        return
    }
    $('.plan_potager_liste_element_liste').remove();


    

    var liste_element=$('<div/>', {
        "class": 'plan_potager_liste_element_liste',
    }).appendTo($('#div_pageContainer'));
    liste_element.css('left',$('.plan_potager_liste_element').first().position().left + 'px')
    liste_element.css('top','calc(' + $('.plan_potager_liste_element').first().offset().top + 'px + 0px)')

    if(window.innerWidth <=800){
        liste_element.css('left','0px')
    }
    //plan_potager_liste_element

    var champ_recherche_liste_element=$('<input/>', {
        "id": 'champ_recherche_liste_element',
        "placeholder" : "Rechercher",
        "type" : "text"
    }).appendTo(liste_element);
    champ_recherche_liste_element.select();

    champ_recherche_liste_element.on('click',function(e){
        e.stopPropagation();
    })
    champ_recherche_liste_element.on('input',function(e){
        peupler_liste($(this).val())
        e.stopPropagation();
    })

    var liste_element=$('<div/>', {
        "class": 'plan_potager_liste_element_liste_scroll',
    }).appendTo(liste_element);

    function ajouter_demarcation(entete){
        var element=$('<div/>', {
            "class": 'plan_potager_un_ensemble_bouton2_demarcation',
        }).appendTo(liste_element);
        element.text(entete)
    }

    function ajouter_element(filtre,nom,type,style_spec){
        if(type == null){
            type='';
        }
        if(filtre != ''){
            if(compare_string_simple(nom,filtre) == false){
                return;
            }
        }
        var element=$('<div/>', {
            "class": 'plan_potager_un_ensemble_bouton2',
        }).appendTo(liste_element);
        element.attr('type_bouton',type)

        var img=$('<div/>', {
            "class": 'plan_potager_un_ensemble_bouton2_img',
        }).appendTo(element);
        img.addClass(type + '_img');
        if(style_spec != null){
            img.attr('style',style_spec);
        }else{
            img.attr('style','background-color:none');
        }

        var txt=$('<div/>', {
            "class": 'plan_potager_un_ensemble_bouton2_txt',
        }).appendTo(element);
        txt.text(nom)


        element.on('click',function(event){
            get_current_potager().deselect_all_objet()
            
            var lebouton=$(this);
            if(lebouton.attr('type_bouton') == ''){
                return false;
            }

            
            //var le_potager=$(lebouton.parent().parent().parent().parent().next().children()[0])

            var obj=new un_objet();
            obj.type=lebouton.attr('type_bouton')
            var potager=get_current_potager()
            potager.unlock();
            if(potager.mem_x != null && potager.mem_y != null){
                obj.l=potager.mem_x
                obj.t=potager.mem_y
                potager.mem_x = null
                potager.mem_y = null
            }
            potager.ajouter_obj(obj)
            obj.afficher();
            obj.charger_more_info_from_serveur();
            obj.save();
            add_cancel_action('Ajout élément',obj,null,false,true)

            event.stopPropagation();
            $('.plan_potager_liste_element_liste').remove();
            
        })
    }

    function peupler_liste(filtre){
        liste_element.empty();
        ajouter_demarcation('Séparation')
        ajouter_element(filtre,'Un grillage','grillage')
        ajouter_element(filtre,'Un muret','muret')
        ajouter_element(filtre,'Une haie','haie')
        ajouter_element(filtre,'Un cours d\'eau','cours_d_eau')

        ajouter_demarcation('Potager')
        ajouter_element(filtre,'Un carré potager','carre_potager','background-color:white')
        ajouter_element(filtre,'De l\'herbe','herbe','background-color:white')
        ajouter_element(filtre,'Une serre','serre','background-color:white')
        ajouter_element(filtre,'Un composteur','composteur')
        ajouter_element(filtre,'Une cuve d\'eau','cuve_eau')

        ajouter_demarcation('Décoration')
        ajouter_element(filtre,'Une dalle','dalle_jardin')
        ajouter_element(filtre,'Un rocher','rocher')
        ajouter_element(filtre,'Une terrasse','terrasse')
        ajouter_element(filtre,'Une marre','mare')
        ajouter_element(filtre,'Un arbre','arbre')
        ajouter_element(filtre,'Un puit','puit')
        
        ajouter_demarcation('Accessoires') 
        ajouter_element(filtre,'Une table','table')
        ajouter_element(filtre,'Un évier','evier')
        ajouter_element(filtre,'Un arrosoir','arrosoir')
        ajouter_element(filtre,'Un tas de bois','bois')
        ajouter_element(filtre,'Une poubelle','poubelle')
        ajouter_element(filtre,'Un robot tondeuse','robot')
        ajouter_element(filtre,'Un barbecue','barbecue')

        ajouter_demarcation('Annimaux') 
        ajouter_element(filtre,'Un poulailler','poulailler')

        ajouter_demarcation('Autre') 
        ajouter_element(filtre,'Un abris de jardin','cabane')
        ajouter_element(filtre,'Une étiquette','etiquette')
        ajouter_element(filtre,'Un fil d\'arrosage','fil_arrosage')
    }
    peupler_liste('')
    

    if(e!=null){
        e.stopPropagation();
    }
    
    
}

function lock_potager(){
    var potager=get_current_potager()
    if(potager != null){
        potager.lock();
    }
}
function unlock_potager(){
    var potager=get_current_potager()
    if(potager != null){
        potager.unlock();
    }
    
}

$('.lock_background').on('click',function(){
    var potager=get_current_potager()
    potager.deselect_all_objet();
    if(potager.get_option('lock')=='oui'){
        potager.unlock();
    }else{
        potager.lock();
    }
})
$('.lock_semence').on('click',function(){
    var potager=get_current_potager()
    potager.deselect_all_objet();
    if(potager.get_option('lock_s')=='oui'){
        potager.unlock_semence();
    }else{
        potager.lock_semence();
    }
})

var potager_index_edition_en_cours=null;
var nombre_potager=$('#les_potagers').children().length
$('#les_potagers').children().each(function(index){
    var un_potager_option=$('<option/>', {
        "class": 'un_nom_potager',
    }).appendTo($('#nom_potager'));
    un_potager_option.text($(this).attr('nom_plan'))
    un_potager_option.val(index)
})
$('#nom_potager').on('change',function(){
    select_potager($('#nom_potager').val())
})
function select_potager(index){
    clear_cancel_actions();
    setCookie('memoire_select_potager',index)
    var les_potagers=$('#les_potagers').children();
    if(index >nombre_potager){
        return
    }
    //console.log(potager_index_edition_en_cours + '-' + index + '-' + nombre_potager)
    var potager_edition=$('#id_plan_potager').find('.un_plan_potager_father')
    if(potager_index_edition_en_cours != null && potager_edition.length == 1){
        if(potager_index_edition_en_cours == (nombre_potager -1)){
            $(potager_edition[0]).insertAfter($(les_potagers[(nombre_potager-2)]))
        }else{
            $(potager_edition[0]).insertBefore($(les_potagers[potager_index_edition_en_cours]))
        }
        
        les_potagers=$('#les_potagers').children();
    }
    
    potager_index_edition_en_cours=index;
    
    //$(les_potagers[index]).insertAfter($($('#id_plan_potager').find('.plan_potager_bouton')[0]))
    $('#id_plan_potager').prepend($(les_potagers[index]))
    if($(les_potagers[index]).attr('lock')=='oui'){
        lock_potager();
    }else{
        unlock_potager();
    }

    if($(les_potagers[index]).attr('lock_s')=='oui'){
        get_current_potager().lock_semence();
    }else{
        get_current_potager().unlock_semence();
    }

    get_current_potager().refresh_affichage_contenu();

}

$('#nom_potager').hide();
$('#id_plan_potager').hide();
$('#aucun_potager').hide();
$('.plan_potager_bouton').hide();

function check_potagers_loaded(){
    //console.log('check_potagers_loaded')
    is_all_l=true;
    potagers.forEach(un_potager => {
        if(un_potager.is_load==false){
            is_all_l=false;
            //console.log('   > un_potager false ' + un_potager.nom)
        };
    })
    return is_all_l;
}

function wait_all_potager_loaded(){
    if(check_potagers_loaded() == false){
        setTimeout(function(){
            wait_all_potager_loaded();
        },100);
    }else{
        $('#load_wait').hide();
        if(nombre_potager > 0){
            $('#id_plan_potager').show();
            $('#nom_potager').show();
            $('.plan_potager_bouton').show();
            var memoire=getCookie('memoire_select_potager')
            if(memoire){
                if(memoire < nombre_potager){
                    $('#nom_potager').val(memoire)
                    select_potager(memoire)
                }else{
                    select_potager(0)
                }
            }else{
                select_potager(0)
            }

            cp=get_current_potager();
            if(cp!=null){
                cp.refresh_affichage_contenu();
            }
            
        }else{
            $('.plan_potager_bouton').hide();
            $('#nom_potagers').hide();
            $('#aucun_potager').show();
            
        }
        
    }
}



//le bouton SUPPR : supprimer la selection
var ctrlDown = false
var ctrlKey = 17
var cmdKey = 91
$(document).keydown(function(e) {
    if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
}).keyup(function(e) {
    if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
});

$('html').keyup(function(e){
    
    console.log('key : ' + e.keyCode)
    if(e.keyCode == 27) {
        $('#menu_obj').remove();
        $('.recherche_semence_menu').remove();
        $('.plan_potager_liste_element_liste').remove();
    }
    if(e.keyCode == 46) {
        var current_potager=get_current_potager()
        if(current_potager != null){
            current_potager.delete_selection(true);
        }
        
        //alert('Delete key released');
    }
    if(e.keyCode == 90 && ctrlDown) { //CTR Z
        var current_potager=get_current_potager()
        if(current_potager != null){
            cancel_one_action();
        }
    }
    if(e.keyCode == 89 && ctrlDown) { //CTR Y
        var current_potager=get_current_potager()
        if(current_potager != null){
            redo_one_action();
        }
    }
});

$('#b_set').on('click',function(){
    afficher_parametre_potager()
})
function afficher_parametre_potager(){
    if($('#parametre_potage_fond').length!=0){
        $('#parametre_potage_fond').remove()
        return
    }
    var parametre_potage_fond=$('<div/>', {
        "id": 'parametre_potage_fond',
    }).appendTo($('body'));

    var parametre_potage=$('<div/>', {
        "id": 'parametre_potage',
    }).appendTo(parametre_potage_fond);

    var parametre_potage_titre=$('<div/>', {
        "id": 'parametre_potage_titre',
    }).appendTo(parametre_potage);
    parametre_potage_titre.text('Paramètres')

    var un_parametre=$('<div/>', {
        "class": 'un_parametre_plan',
    }).appendTo(parametre_potage);

    var un_parametre_nom=$('<div/>', {
        "class": 'un_parametre_plan_nom',
    }).appendTo(un_parametre);
    un_parametre_nom.text('Nom des semences détaillées')

    var un_parametre_plan_set=$('<input/>', {
        "class": 'un_parametre_plan_set',
        "id":'semence_detaille',
    }).appendTo(un_parametre);
    un_parametre_plan_set.attr('type','checkbox')
    un_parametre_plan_set.prop('checked',mode_nom_semence_more_info)

    var parametre_potage_close=$('<div/>', {
        "id": 'parametre_potage_close',
    }).appendTo(parametre_potage);
    parametre_potage_close.text('Enregistrer')
    parametre_potage_close.on('click',function(){
        save_parametre_potager()
    })
}

function save_parametre_potager(){
    mode_nom_semence_more_info=$('#semence_detaille').prop('checked')
    save_config('mode_nom_semence_more_info',mode_nom_semence_more_info);
    $('#parametre_potage_fond').remove()
    get_current_potager().refresh_affichage_contenu()
}


parametre_potager_loaded=false
function load_parametre_potager(){
    get_config('mode_nom_semence_more_info',function(data){
        if(data!=null){
            if(data.result == 'false'){
                mode_nom_semence_more_info=false
            }else{
                mode_nom_semence_more_info=true
            }
            
        }
        console.log(data)
        parametre_potager_loaded=true
        wait_all_potager_loaded();
    });
}


function init_chargement_affichage_potager(){
    load_parametre_potager();
}
init_chargement_affichage_potager()