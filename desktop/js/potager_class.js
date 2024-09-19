

var touch_start_time = null;

//beta
var potagers=[];

var list_to_save=[];
var list_to_del=[];
function next_save_obj(){
   // alert('test')
   setTimeout(function(){
    if(list_to_save.length != 0){
        var item_to_save=list_to_save[0];
        list_to_save.splice(0, 1);
        item_to_save.save();
        
    }
}, 200);
}

function next_del_obj(){
    // alert('test')
    setTimeout(function(){
        if(list_to_del.length != 0){
            var item_to_del=list_to_del[0];
            list_to_del.splice(0, 1);
            item_to_del.supprimer();
        }
     }, 200);
     
 }


var potager_obj=class potager_obj {
    nom = '';
    id = null;
    objs = [];
    node_father = null;
    node = null;
    w = 50; //Defaut
    h = 50; //Defaut
    options='';
    is_load=false;

    constructor(nom, id,node_father) {
        var that=this;
        this.nom = nom;
        this.id = id;
        this.node_father=node_father //le potager father
        this.node = $(this.node_father.children()[0])
        

        this.node.on('mousedown',function(event){
                
            if(event.which!=1)
            {
                return true
            }

                // object_selected=$(event.currentTarget);
                // x_s=event.pageX;
                // y_s=event.pageY;
                object_selected_father_type = 'square_selection';
                object_selected_type = 'element_resize'
                object_selected=$('<div/>', {
                    "class": 'square_selection',
                }).appendTo(that.node);
                object_selected.css('top',event.pageY - that.node.offset().top);
                object_selected.css('left',event.pageX - that.node.offset().left);
                object_selected.css('width','3px');
                object_selected.css('height','3px');


                object_selected.attr('p_clic_t',event.pageY - that.node.offset().top) ;
                object_selected.attr('p_clic_l',event.pageX - that.node.offset().left) ;
                object_selected.attr('v_height','3') ;
                object_selected.attr('v_width','3') ;
                // need_to_save_object=false;


            
            event.stopPropagation();
        })

        this.node.on('touchstart',function(event){
            
            touch_start_time = Date.now();
        });
        this.node.on('touchend',function(event){


            if(event.touches != null){
                if(event.touches.length > 0){
                    var tmp = Date.now();
                    if(tmp-touch_start_time > 2000){
                        that.menu_clic_droit(event.touches[0].pageX,event.touches[0].pageY,event)
                    }
                    touch_start_time=null;
                }
            }
        });

        this.node.bind("contextmenu",function(event){
            that.menu_clic_droit(event.pageX,event.pageY)
            event.stopPropagation();
            return false;
        });

        this.charger_contenu();
    }

    lock(){
        this.node_father.attr('lock','oui')
        var lock_e=$(this.node_father.parent().prev().find('.lock_background')[0])
        this.set_option('lock','oui')
        lock_e.find('i').removeClass('fa-unlock')
        lock_e.find('i').addClass('fa-lock')
        lock_e.find('p').text('Déverrouiller l\'arrière plan')
    }

    unlock(){
        this.node_father.attr('lock','non')
        var lock_e=$(this.node_father.parent().prev().find('.lock_background')[0])
        this.set_option('lock','non')
        lock_e.find('i').removeClass('fa-lock')
        lock_e.find('i').addClass('fa-unlock')
        lock_e.find('p').text('Verrouiller l\'arrière plan')
    }

    lock_semence(){
        this.node_father.attr('lock_s','oui')
        var lock_e=$(this.node_father.parent().prev().find('.lock_semence')[0])
        this.set_option('lock_s','oui')
        lock_e.find('i').removeClass('fa-unlock')
        lock_e.find('i').addClass('fa-lock')
        lock_e.find('p').text('Déverrouiller les semences')
    }

    unlock_semence(){
        this.node_father.attr('lock_s','non')
        var lock_e=$(this.node_father.parent().prev().find('.lock_semence')[0])
        this.set_option('lock_s','non')
        lock_e.find('i').removeClass('fa-lock')
        lock_e.find('i').addClass('fa-unlock')
        lock_e.find('p').text('Verrouiller les semences')
    }
    //lock_semence

    remove_item(item){
        var i=this.objs.indexOf(item);
        if(i>=0){
            this.objs.splice(i, 1);
        }
    }

    get_option(nom){
        if(this.options == null){
            this.options='';
        }
        this.options=this.options.replaceAll('#','¤');
        var opts=this.options.split('¤');
        var r=opts.indexOf(nom);
        if(r >=0){
            return opts[(r+1)];
        }
        return null
    }

    set_option(nom,valeur){
        var ve=this.get_option(nom)
        if(ve==valeur){
            return true
        }
        if(this.options == null){
            this.options='';
        }
        valeur=valeur.replaceAll('#','');
        valeur=valeur.replaceAll('¤','');
        valeur=valeur.replaceAll('|','');
        
        this.options=this.options.replaceAll('#','¤');
        var opts=this.options.split('¤');
        var r=opts.indexOf(nom);
        if(r >=0){
            opts[(r+1)] = valeur
            this.options='';
            var i=0;
            opts.forEach(element => {
                i++;
                //console.log('e ' + element + '-' + i)
                if(element != '' || i!=opts.length){
                    this.options=this.options + element + '¤';
                }
                
            });
            this.save();
            return true;
        }
        this.options=this.options + nom + '¤' + valeur + '¤';
        this.save();
        return true;
    }

    select_item_in_square(top,left,height,width){
        var that=this;
        this.objs.forEach( (un_obj) => {
            if(parseInt(un_obj.t) > top && parseInt(un_obj.t) < (top + height) && parseInt(un_obj.l) > left && parseInt(un_obj.l) < (left + width)){
                if(that.get_option('lock') !='oui' || un_obj.type=='semence'){
                    if(that.get_option('lock_s') !='oui' || un_obj.type!='semence'){
                        if(un_obj.get_option('verouille')!='oui'){
                            selection_multiple=true;
                            un_obj.click();
                        }
                    }
                    
                }
                
            }
        })

        $('#menu_obj').remove();
    }

    select_all_semence_id(id_bdd){
        
        selection_multiple=true;
        this.objs.forEach( (un_obj) => {
            if(un_obj.type=='semence'){
                if(un_obj.id_bdd==id_bdd){
                    un_obj.click();
                }
            }
        })

       // $('#menu_obj').remove();
    }

    deselect_all_objet(){
        selection_multiple=false;
        this.objs.forEach( (un_obj) => {
            if(un_obj.is_selected){
                un_obj.unclick();
            }
        })
    }

    duplicate_selection(){
        var newO=[];
        this.objs.forEach( (un_obj) => {
            if(un_obj.is_selected){
                un_obj.unclick();
                newO.push(un_obj.duppliquer());
            }
        })

        add_cancel_action('Dupplicate selection ',null,newO,false,true)

        setTimeout(function(){
            selection_multiple=true;
            newO.forEach( (un_obj) => {
                un_obj.click();
            }); 
    
        }, 500);
       
    }

    delete_selection(save_cancel_action=false){
        list_to_del=[];
        this.objs.forEach( (un_obj) => {
            if(un_obj.is_selected){
                list_to_del.push(un_obj)
            }
        })

        if(save_cancel_action){
            add_cancel_action('Delete objs ',null,list_to_del,true)
        }
        
        next_del_obj();
        selection_multiple=false;
    }

    get_obj_by_id(id){
        var objF=null;
        this.objs.forEach( (un_obj) => {
            if(un_obj.id_spec == id){
                objF=un_obj
                return un_obj
            }
        })
        
        return objF;
    }

    replace_obj_by_id(id,new_obj){
        var index=0;
        var objF=false;
        this.objs.forEach( (un_obj) => {
            if(un_obj.id_spec == id){
                objF=true;
                this.objs[index]=new_obj
                return true
            }
            index++;
        })
        
        return objF;
    }

    get_objs_selected(){
        var obj_s=[];
        this.objs.forEach( (un_obj) => {
            if(un_obj.is_selected){
                obj_s.push(un_obj)
            }
        })

        return obj_s;
    }

    save_obj_s(){
        list_to_save=this.get_objs_selected();
        next_save_obj();
    }

    selectionner_toutes_les_semences(){
        this.deselect_all_objet();
        selection_multiple=true;
        this.objs.forEach( (un_obj) => {
            if(un_obj.type=='semence'){
                un_obj.click();
            }

        });

    }

    organiser_semence_magic(need_save_cancel=false){
        var that=this;
        bootbox.confirm("ATTENTION : cette fonction peut modifier profondement l'affichage de votre potager ! Elle va tenter d'aligner en quadrillage vos semences sélectionnées tout en respectant votre positionnement ! Voulez vous continuer ?", function(result){ 
            setTimeout(function(){
                if(result == true){
                    that.organiser_semence_magic_suite(need_save_cancel);
                }
            },1);
            // if(result == true){
            //     that.organiser_semence_magic_suite(need_save_cancel);
            // }
        });

    }
    organiser_semence_magic_suite(need_save_cancel){

        var obs_s=this.get_objs_selected();


        if(this.objs.length<2){
            return;
        }
         const marge_s=45;
         //on commence  par identifier le l_min, l_max, t_min, t_max
         var l_min=9999999999;
         var t_min=9999999999;
         var l_max=0;
         var t_max=0;
         obs_s.forEach( (un_obj) => {

                if(t_max<parseInt(un_obj.t)){
                    t_max=parseInt(un_obj.t)
                }
                if(l_max<parseInt(un_obj.l)){
                    l_max=parseInt(un_obj.l)
                }
                if(t_min>parseInt(un_obj.t)){
                    t_min=parseInt(un_obj.t)
                }
                if(l_min>parseInt(un_obj.l)){
                    l_min=parseInt(un_obj.l)
                }
            
         });

        //  console.log('l_min ' + l_min)
        //  console.log('l_max ' + l_max)
        //  console.log('t_min ' + t_min)
        //  console.log('t_max ' + t_max)

        //on commence par aligner la première ligne
        var obj_l_min=null;
        var obj_l_max=null;
        this.deselect_all_objet();
        selection_multiple=true;
        obs_s.forEach( (un_obj) => {

                if(Math.abs(parseInt(un_obj.t)-t_min)<marge_s){
                    if(obj_l_min==null){
                        obj_l_min=un_obj
                    }
                    if(obj_l_max==null){
                        obj_l_max=un_obj
                    }
                    un_obj.t=t_min;
                    un_obj.refresh();
                    un_obj.click();

                    if(parseInt(obj_l_max.l)<parseInt(un_obj.l)){
                        obj_l_max=un_obj
                    }
                    if(parseInt(obj_l_min.l)>parseInt(un_obj.l)){
                        obj_l_min=un_obj
                    }
                }
            
        });
        obj_l_min.l=l_min
        obj_l_max.l=l_max
        // console.log(obj_l_min);
        // console.log(obj_l_max);
        obj_l_min.refresh();
        obj_l_max.refresh();
        this.espacer_h_obj_s();
        


        //on parcours ligne après ligne
        //et on positionne le premier élément en l_min, et le dernier élément en l_max

        var t_ligne_not_found=false;
        var t_ligne_min=99999999;
        t_nbr=0;
        var t_ligne_min_ref=t_min;
       while (t_ligne_not_found==false) {
           t_ligne_not_found=true;
           obs_s.forEach( (un_obj) => {

                  if(t_ligne_min>parseInt(un_obj.t) && parseInt(un_obj.t)>t_ligne_min_ref){
                   t_ligne_min=parseInt(un_obj.t);
                   t_ligne_not_found=false;
                  }
              
           });
           t_ligne_min_ref=t_ligne_min;
           t_ligne_min=99999999
           //si on a pas encore depasser la dernière ligne alors on alligne
           if(t_ligne_not_found==false){
               t_nbr++;
               //alert(t_nbr)
               var obj_l_min=null;
               var obj_l_max=null;
               this.deselect_all_objet();
               selection_multiple=true;
               obs_s.forEach( (un_obj) => {

                       if(Math.abs(parseInt(un_obj.t)-t_ligne_min_ref)<marge_s){
                           if(obj_l_min==null){
                               obj_l_min=un_obj
                           }
                           if(obj_l_max==null){
                               obj_l_max=un_obj
                           }
                           un_obj.t=t_ligne_min_ref;
                           un_obj.refresh();
                           un_obj.click();

                           if(parseInt(obj_l_max.l)<parseInt(un_obj.l)){
                               obj_l_max=un_obj
                           }
                           if(parseInt(obj_l_min.l)>parseInt(un_obj.l)){
                               obj_l_min=un_obj
                           }
                       }
                   
               });
               obj_l_min.l=l_min

               if(obj_l_max != obj_l_min){
                obj_l_max.l=l_max
                obj_l_max.refresh();
                }

               //return
               obj_l_min.refresh();
               obj_l_max.refresh();

           }
       }


        //puis la 1ere colonne
        var obj_t_max=null;
        this.deselect_all_objet();
        selection_multiple=true;
        var t_nbr=0;
        obs_s.forEach( (un_obj) => {

                if(Math.abs(parseInt(un_obj.l)-l_min)<marge_s){
                    t_nbr++;
                    if(obj_t_max==null){
                        obj_t_max=un_obj
                    }
                    un_obj.l=l_min;
                    un_obj.refresh();
                    un_obj.click();

                    if(parseInt(obj_t_max.t)<parseInt(un_obj.t)){
                        obj_t_max=un_obj
                    }
                }
            
        });

        
        obj_t_max.t=t_max
        obj_t_max.refresh();
        this.espacer_v_obj_s();
        
        //alert('pauise')
        //return
        //on parcours ligne après ligne
        //et on aligne et espace

         t_ligne_not_found=false;
         t_ligne_min=99999999;
         t_nbr=0;
         t_ligne_min_ref=t_min;
        while (t_ligne_not_found==false) {
            t_ligne_not_found=true;
            obs_s.forEach( (un_obj) => {

                   if(parseInt(un_obj.l) == l_min && t_ligne_min>parseInt(un_obj.t) && parseInt(un_obj.t)>t_ligne_min_ref){
                    t_ligne_min=parseInt(un_obj.t);
                    t_ligne_not_found=false;
                   }
               
            });
            t_ligne_min_ref=t_ligne_min;
            t_ligne_min=99999999
            //si on a pas encore depasser la dernière ligne alors on alligne
            if(t_ligne_not_found==false){
                t_nbr++;
                //alert(t_nbr)
                var obj_l_min=null;
                var obj_l_max=null;
                this.deselect_all_objet();
                selection_multiple=true;
                obs_s.forEach( (un_obj) => {

                        if(Math.abs(parseInt(un_obj.t)-t_ligne_min_ref)<marge_s){
                            if(obj_l_min==null){
                                obj_l_min=un_obj
                            }
                            if(obj_l_max==null){
                                obj_l_max=un_obj
                            }
                            un_obj.t=t_ligne_min_ref;
                            un_obj.refresh();
                            un_obj.click();

                            if(parseInt(obj_l_max.l)<parseInt(un_obj.l)){
                                obj_l_max=un_obj
                            }
                            if(parseInt(obj_l_min.l)>parseInt(un_obj.l)){
                                obj_l_min=un_obj
                            }
                        }
                    
                });

                obj_l_min.l=l_min
                if(obj_l_max != obj_l_min){
                    obj_l_max.l=l_max
                    obj_l_max.refresh();
                }
                
                obj_l_min.refresh();
                this.espacer_h_obj_s();
            }
        }
        


        
        this.deselect_all_objet();

        list_to_save=[];
        obs_s.forEach( (un_obj) => {
                list_to_save.push(un_obj)
        });

        if(need_save_cancel){
            add_cancel_action('espacer magic',null,obs_s,false,false)
        }

        next_save_obj();

    }


    espacer_v_obj_s(need_save_cancel=false){
        var obj_s=this.get_objs_selected();
        if(obj_s.length<=1){
            return;
        }

        var min=obj_s[0].t;
        var max=0;
        obj_s.forEach( (un_obj) => {
            if(max<parseInt(un_obj.t)){
                max=parseInt(un_obj.t)
            }
            if(min>parseInt(un_obj.t)){
                min=parseInt(un_obj.t)
            }
        });

        var espacement=parseFloat((max-min) / (obj_s.length - 1));

        // console.log('min ' + min)
        // console.log('max ' + max)
        // console.log('espacement ' + espacement)
        obj_s=obj_s.sort((a,b) => (parseInt(a.t) > parseInt(b.t)) ? 1 : ((parseInt(b.t) > parseInt(a.t)) ? -1 : 0))
        for(var i=1;i<(obj_s.length -0);i++){
            var t=parseFloat(parseFloat(min)+parseFloat(espacement)*i);
            obj_s[i].t=t;
            obj_s[i].refresh();
        }
        if(need_save_cancel){
            add_cancel_action('espacer_v_obj_s',null,obj_s,false,false)
        }
        
        this.save_obj_s();
    }

    espacer_h_obj_s(need_save_cancel=false){
        var obj_s=this.get_objs_selected();
        if(obj_s.length<=1){
            return;
        }

        var min=obj_s[0].l;
        var max=0;
        obj_s.forEach( (un_obj) => {
            if(max<parseInt(un_obj.l)){
                max=parseInt(un_obj.l)
            }
            if(min>parseInt(un_obj.l)){
                min=parseInt(un_obj.l)
            }
        });

        var espacement=parseFloat((max-min) / (obj_s.length - 1));

        //console.log('min ' + min)
        //console.log('max ' + max)
        //console.log('espacement ' + espacement)
        obj_s=obj_s.sort((a,b) => (parseInt(a.l) > parseInt(b.l)) ? 1 : ((parseInt(b.l) > parseInt(a.l)) ? -1 : 0))
        for(var i=1;i<(obj_s.length -0);i++){
            var l=parseFloat(parseInt(min)+parseFloat(espacement)*i);
            obj_s[i].l=l;
            obj_s[i].refresh();
        }

        if(need_save_cancel){
            add_cancel_action('espacer_h_obj_s',null,obj_s,false,false)
        }
        this.save_obj_s();
    }

    aligner_h_obj_s(need_save_cancel=false){
        var obj_s=this.get_objs_selected();
        var s_t=0;
        var max_h=0;
        obj_s.forEach( (un_obj) => {
            s_t=parseInt(un_obj.t) + s_t;
            if(max_h<parseInt(un_obj.h)){
                max_h=parseInt(un_obj.h)
            }
        });
        s_t=s_t/obj_s.length;

        obj_s.forEach( (un_obj) => {
            un_obj.t=s_t + (max_h-parseInt(un_obj.h))/2;
            un_obj.refresh();
        });
        if(need_save_cancel){
            add_cancel_action('aligner_h_obj_s',null,obj_s,false,false)
        }
        this.save_obj_s();
    }

    aligner_v_obj_s(need_save_cancel=false){
        var obj_s=this.get_objs_selected();
        var s_t=0;
        var max_w=0;
        obj_s.forEach( (un_obj) => {
            s_t=parseInt(un_obj.l) + s_t;
            if(max_w<parseInt(un_obj.w)){
                max_w=parseInt(un_obj.w)
            }
        });
        s_t=s_t/obj_s.length;

        obj_s.forEach( (un_obj) => {
            un_obj.l=s_t  + (max_w-parseInt(un_obj.w))/2;
            un_obj.refresh();
        });
        if(need_save_cancel){
            add_cancel_action('aligner_v_obj_s',null,obj_s,false,false)
        }
        this.save_obj_s();
    }

    mem_x=null;
    mem_y=null;
    menu_insert(elemnt,x,y){
        var that=this;

        var menu_obj=$('<div/>', {
            "id": 'menu_insert',
        }).appendTo(elemnt);
        menu_obj.css('top',"0px")
        menu_obj.css('left',"398px")

        if(window.innerWidth <=800){
            menu_obj.css('top','')
            menu_obj.css('left',"0px")
            menu_obj.css('right',"0px")
            menu_obj.css('margin-right',"auto")
            menu_obj.css('margin-left',"auto")
            menu_obj.css('bottom',"0px")
            menu_obj.css('position',"fixed")
        }

        var menu_obj_titre=$('<div/>', {
            "class": 'menu_obj_titre',
        }).appendTo(menu_obj);
        menu_obj_titre.text('Insérer')
    
        //equipement
        if(conf_mode_potager =='jeedom'){
            var item_q=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item_q);
                icon_item.attr('src',base_url +  '/plugins/potager/data/img/equipement.png')
    
                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item_q);
                text_item.text('Un équipement')
    
                item_q.on('click',function(){
                    var yP=$($('#id_plan_potager').find('.un_plan_potager_father')[0]).position().top + $('#id_plan_potager').scrollTop()
                    ajouter_equipement(that,x,(y - yP))
                })
    
    
                //cmd
                var item_q=$('<div/>', {
                    "class": 'menu_obj_item',
                }).appendTo(menu_obj);
                    var icon_item=$('<img/>', {
                        "class": 'menu_obj_item_icon',
                    }).appendTo(item_q);
                    icon_item.attr('src',base_url +  '/plugins/potager/data/img/cmd.png')
        
                    var text_item=$('<div/>', {
                        "class": 'menu_obj_item_text',
                    }).appendTo(item_q);
                    text_item.text('Une commande')
        
                    item_q.on('click',function(){
                        var yP=$($('#id_plan_potager').find('.un_plan_potager_father')[0]).position().top + $('#id_plan_potager').scrollTop()
                        ajouter_info_action(that,x,(y - yP))
                })
        }
        


        //element déco
        var item_q=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_q);
            icon_item.attr('src',base_url + '/plugins/potager/data/img/arbre.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_q);
            text_item.text('Un élément décoratif')

            item_q.on('click',function(e){
                e.stopPropagation();
                var yP=$($('#id_plan_potager').find('.un_plan_potager_father')[0]).position().top + $('#id_plan_potager').scrollTop()
                that.mem_x=x;
                that.mem_y=(y - yP);
                ouvrir_menu_add_element()
                $('#menu_obj').remove();
            })

        //semence
        var item_q=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_q);
            icon_item.attr('src',base_url +  '/plugins/potager/data/img/semence.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_q);
            text_item.text('Une semence')

            item_q.on('click',function(e){
                e.stopPropagation();
                var yP=$($('#id_plan_potager').find('.un_plan_potager_father')[0]).position().top + $('#id_plan_potager').scrollTop()
                that.mem_x=x;
                that.mem_y=(y - yP);
                $('.plan_potager_liste_element_liste').remove();
                $('.recherche_semence').val('');
                recherche_semence();
                $('.recherche_semence').select();
                $('#menu_obj').remove();
            })
            
    }

    menu_clic_droit(x,y){
        $('.recherche_semence_menu').remove();
        var that=this;
        $('#menu_obj').remove();
        $('.pop_up_detail_semence').remove();

        var menu_obj=$('<div/>', {
            "id": 'menu_obj',
        }).appendTo($('#id_plan_potager'));
    
    
        y=y-$('#id_plan_potager').offset().top + $('#id_plan_potager').scrollTop();
        x=x-$('#id_plan_potager').offset().left+ $('#id_plan_potager').scrollLeft();
        var trueX=x;
        var trueY=y;
        //on rectifie si ca deborde trop 
        //debug=get_potager_byId(this.id_father)
        var x_p=this.node.offset().left + this.node.width()+ $('#id_plan_potager').scrollLeft();
        var y_p=this.node.offset().top + this.node.height()

        if(x + 420 > x_p){
            //alert('max x')
            x=x-(x+420 - x_p)
        }

        if(x < 3){
            x=3;
        }

        menu_obj.css('top',(y + 10) + "px")
        menu_obj.css('left',x + "px")

        if(window.innerWidth <=800){
            menu_obj.css('top','')
            menu_obj.css('left',"0px")
            menu_obj.css('right',"0px")
            menu_obj.css('margin-right',"auto")
            menu_obj.css('margin-left',"auto")
            menu_obj.css('bottom',"0px")
            menu_obj.css('position',"fixed")
        }
    
        
        var menu_obj_titre=$('<div/>', {
            "class": 'menu_obj_titre',
        }).appendTo(menu_obj);
        menu_obj_titre.text('Menu Potager')
    

        var item_q=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_q);
            icon_item.attr('src',base_url +  '/plugins/potager/data/img/add.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_q);

            var icon_item=$('<i/>', {
                "class": 'fas fa-chevron-right menu_obj_item_fleche',
            }).appendTo(item_q);

            

            


        text_item.text('Ajouter ici')
        
        item_q.on('mouseleave click',function(e){
            $('#menu_insert').remove();
            e.stopPropagation();
         })
        item_q.on('mouseenter click',function(e){
            e.stopPropagation();
            if(window.innerWidth <=800){
                setTimeout(() => {
                    that.menu_insert($(this),trueX,trueY)
                }, 700);
            }else{
                that.menu_insert($(this),trueX,trueY)
                }
            
            
        })
        

        
        var item_q=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_q);
            icon_item.attr('src',base_url +  '/plugins/potager/data/img/quadrillage.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_q);


        text_item.text('Afficher le quadrillage')
        if(this.node.find('.quadrillage_potager').length > 0){
            text_item.text('Masquer le quadrillage')
        }

        item_q.on('click',function(){
            if(that.node.find('.quadrillage_potager').length > 0){
                that.masquer_quadrillage();
            }else{
                that.afficher_quadrillage();
            }
        })



        //background
        var item_q=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_q);
            icon_item.attr('src',base_url +  '/plugins/potager/data/img/herbe.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_q);


        text_item.text('Choisir un fond Herbe')
        if(this.get_option('bck')=='herbe'){
            text_item.text('Choisir un fond Terre')
        }

        item_q.on('click',function(){
            if(that.get_option('bck')=='herbe'){
                that.set_option('bck','terre')
            }else{
                that.set_option('bck','herbe')
            }
            that.refresh();
        })


        




    }

    afficher_quadrillage(){
        $('.quadrillage_potager').remove();
        var quadrillage=$('<div/>', {
            "class": 'quadrillage_potager',
        }).appendTo(this.node);
    }
    masquer_quadrillage(){
        this.node.find('.quadrillage_potager').remove();
    }

    refresh_affichage_contenu(){
        this.objs.forEach( (un_obj) => {
            un_obj.afficher();
        })
    }

    refresh(){
        if(this.h == ''){
            this.h=200;
        }
        if(this.w == ''){
            this.w=400;
        }
        this.node.css('height',this.h + 'px');
    
        this.node.css('width',this.w + 'px');
    
        if(this.get_option('bck') == 'herbe'){
            this.node.addClass('un_plan_potager_bk_herbe')
            this.node.removeClass('un_plan_potager_bk_terre')
        }else{
            this.node.addClass('un_plan_potager_bk_terre')
            this.node.removeClass('un_plan_potager_bk_herbe')
        }

        if(this.get_option('lock') == 'oui'){
            this.lock();
        }else{
            this.unlock();
        }
        if(this.get_option('lock_s') == 'oui'){
            this.lock_semence();
        }else{
            this.unlock_semence();
        }

        this.node.show();
    }

    

    creer_objet_from_ajax (type,l,t,w,h,id_spec,id_bdd,angle,options){
        var resultat;
        if(type == "semence"){
            resultat= new semence();
        }else if(type == "equipement"){
            resultat= new equipement();
        }else if(type == "cmd_action_info"){
            resultat= new cmd_action_info();
        }else{
            resultat=new un_objet();
        }
        //return new un_objet(type,l,t,w,h,id_spec,id_bdd)
        resultat.type=type;
        resultat.l=l;
        resultat.t=t;
        resultat.h=h;
        resultat.w=w;
        resultat.id_spec=id_spec;
        resultat.id_bdd=id_bdd;
        resultat.angle=angle;
        resultat.options=options;



        return resultat;
    
    }

    

    charger_contenu(){
        var that=this
        if(this.id == null){
            return
        }

        $.ajax({
            type: 'POST',
            url: '/plugins/jardin/core/ajax/jardin.ajax.php',
            data: {
                action: 'get_elements_plan',
                object_id: init(this.id),
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
                for(var i=0;i<data.result.length;i++){
                    var un_element=data.result[i]
                    
                    var un_element_from_ajax_l=un_element.split('|');
                    var type=un_element_from_ajax_l[0]
                    var l=un_element_from_ajax_l[1]
                    var t=un_element_from_ajax_l[2]
                    var w=un_element_from_ajax_l[3]
                    var h=un_element_from_ajax_l[4]
                    var id_spec=un_element_from_ajax_l[5]
                    var id_bdd=un_element_from_ajax_l[6]
                    var angle=0;
                    var options='';
                    if(un_element_from_ajax_l.length>=8){
                        angle=un_element_from_ajax_l[7]
                    }

                    if(un_element_from_ajax_l.length>=9){
                        options=un_element_from_ajax_l[8]
                    }
                    

                    var obj=that.creer_objet_from_ajax(type,l,t,w,h,id_spec,id_bdd,angle,options)
                    that.ajouter_obj(obj)
                    
                    obj.afficher();
                    obj.charger_more_info_from_serveur();
                    
                }
            }
            });
    }

    ajouter_obj(obj){
        obj.node_father=this.node
        obj.id_father=this.id;
        if(obj.obj_original ==null){
            obj.obj_original=Object.assign(Object.create(Object.getPrototypeOf(obj)), obj); 
        }
        this.objs.push(obj)
    }

    get_info_from_server(){
        var that=this;
        $.ajax({
            type: 'POST',
            url: '/plugins/jardin/core/ajax/jardin.ajax.php',
            data: {
                action: 'get_info_plan',
                object_id: init(this.id)
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

                var opts=[];
                var vals=[];
                var i=0;
                if(that.options != ''){
                    var opt=that.options.split('#');
                    opt.forEach( el => {
                        if(el != ''){
                            if(i%2==0){
                                opts.push(el)
                                vals.push(that.get_option(el));
                            }
                            i++;
                        }
                    })
                    //var l=that.get_option('bck');
                }
                that.options=data.result.options;
                i=0;
                opts.forEach(el => {
                    that.set_option(el,vals[i])
                    i++;
                })
                

                that.h=data.result.h;
                that.w=data.result.w;
                that.refresh();
                that.is_load=true;
            }
        })
    }

    save(){
        console.log('save_plan')
        $.ajax({
            type: 'POST',
            url: '/plugins/jardin/core/ajax/jardin.ajax.php',
            data: {
                action: 'save_plan',
                object_id: init(this.id),
                width:init(this.w),
                height:init(this.h),
                options:init(this.options)
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
}



function get_potager_byId(id_plan){
    return potagers.find(element => element.id == parseInt(id_plan));
}
function get_potager_byNode(node_potager){
    return get_potager_byId(node_potager.attr('id_plan'));
}

function get_objets_byReff_bdd(reff_bdd){
    var result=[];

    potagers.forEach( (un_potager) => {
        un_potager.objs.forEach( (un_obj) => {
            if(un_obj.type == 'semence'){
                if(un_obj.match_bdd != null){
                    if(un_obj.match_bdd.espece == reff_bdd){
                        result.push(un_obj)
                    }
                }
            }
        })
    })

    return result;
}

function get_objet_byNode(node){
    var node_potager=node.parent().parent();
    var le_potager=get_potager_byNode(node_potager)
    if(le_potager == null){
        console.error('Potager not found by node (get_objet_byNode)')
        return
    }
    var obj=le_potager.objs.find(element => element.id_spec == parseInt(node.attr('id_spec')));
    return obj;
}

function refresh_une_semence2(id_semence,data){
    potagers.forEach( (un_potager) => {
        semence_to_kill=[];
        var i=0;
        un_potager.objs.forEach( (une_espece) => {
            if(une_espece.id_bdd == parseInt(id_semence)){
                if(data == "null"){
                    semence_to_kill.insert(0,i)
                }else{
                    une_espece.nom = data.nom;
                    une_espece.img = data.img;
                    une_espece.rechercher_espece_bdd();
    
                    une_espece.afficher();
                }
                
            }
            i++;
        })

        if(data == "null"){
            semence_to_kill.forEach((i) => {
                un_potager.objs.splice(i, 1);
            })
        }


    })

}






var un_objet=class un_objet {
    l=0;
    t = 0;

    //pour rotation
    offset_l=0;
    offset_t = 0;
    angle = 0;

    w = 50;
    h = 50;
    id_spec = '' //id unique
    id_bdd = '';
    id_father=null;
    type = null;
    img = null
    nom = ''
    options=''

    node_father = null;
    objet_cree_f = null
    objet_cree = null

    allow_resize_h=true;
    allow_resize_w=true;
    allow_turn=true;

    is_selected=false;
    is_selected_bs=false;
    obj_original=null;

    constructor() {
        this.id_spec=Math.round(+new Date());
    }

    dupplication_multiple(){
        var nX=0;
        var nY=0;

        var that=this;
        bootbox.prompt({
            title: "Combien de ligne (vers le bas) ?<br/><br/>De 1 à ? => <b>l'élément à dupliquer est inclus</b>",
            inputType: 'number',
            callback: function (result) {
                nY=result
                if(result != null && result!=false){
                    bootbox.prompt({
                        title: "Combien de colonne (vers la droite) ?<br/><br/>De 1 à ? => <b>l'élément à dupliquer est inclus</b>",
                        inputType: 'number',
                        callback: function (result) {
                            nX=result
                            that.dupplication_multiple_suite(1,1,nX,nY)
                        }
                    });
                }
                
            }
        });
    }

    dupplication_multiple_suite(x,y,nX,nY){
        
        var that=this;
        var margeD=2;
        if(x>nX){
            x=1
            y++
        }
        if(y>nY){
            get_potager_byId(that.id_father).deselect_all_objet();
            return
        }
        setTimeout(function(){
            if(x>1 || y>1){
                var obj=that.duppliquer(false)
                add_cancel_action('Dupplicate obj (multiple)',obj,null,false,true)
                obj.t = parseInt(that.t) + (parseInt(that.h) + margeD) * (y-1);
                obj.l = parseInt(that.l) + (parseInt(that.w) + margeD) * (x -1);
                obj.refresh();
                obj.save();
            }
            x++;
            that.dupplication_multiple_suite(x,y,nX,nY)
        },500)
        
    }

    duppliquer(save=true,obj=new un_objet()){


        //var obj=new un_objet();
        obj.type=this.type
        obj.angle=this.angle;
        obj.l=parseInt(this.l)+10;
        obj.t=parseInt(this.t)+10;
        obj.w=parseInt(this.w);
        obj.h=parseInt(this.h);
        obj.options=this.options;
        obj.id_bdd = this.id_bdd
        get_potager_byId(this.id_father).ajouter_obj(obj)
        obj.afficher();
        obj.charger_more_info_from_serveur();
        if(save){
            obj.save();
        }

        

        return obj;

    }

    get_option(nom){
        if(this.options == null){
            this.options='';
        }
        this.options=this.options.replaceAll('#','¤');
        var opts=this.options.split('¤');
        var r=opts.indexOf(nom);
        if(r >=0){
            return opts[(r+1)];
        }
        return null
    }


    set_option(nom,valeur){
        var ve=this.get_option(nom)
        if(ve==valeur){
            return true
        }
        if(this.options == null){
            this.options='';
        }
        valeur=valeur.replaceAll('¤','');
        valeur=valeur.replaceAll('#','');
        valeur=valeur.replaceAll('|','');
        
        this.options=this.options.replaceAll('#','¤');
        var opts=this.options.split('¤');
        var r=opts.indexOf(nom);
        if(r >=0){
            opts[(r+1)] = valeur

            this.options='';
            var i=0;
            opts.forEach(element => {
                i++;
                if(element != '' || i!=opts.length){
                    this.options=this.options + element + '¤';
                }
            });
            this.save();
            return true;
        }
        this.options=this.options + nom + '¤' + valeur + '¤';
        this.save();

        return true;
    }



    set_offset(){
        this.offset_l=this.objet_cree_f.offset().left
        this.offset_t=this.objet_cree_f.offset().top
    }

    charger_more_info_from_serveur(){


    }

    selectionne(e){ //click gardé appuyé
        console.log('selectionne')
        selection_multiple=true;
        //if(isTouchDevice==false){
            this.is_selected_bs=this.is_selected;
            if(e != null && this.is_selected==false){
                if((e.shiftKey == false && e.ctrlKey == false)  && isTouchDevice==false){
                    //console.log('selectionne NOT SHIFT')
                    get_potager_byId(this.id_father).deselect_all_objet();
                }
            }
            this.click();
        // }else{
            
        //     if(this.is_selected){
        //         this.unclick();
        //     }else{
        //         this.click();
        //     }
        // }
        

    }

    is_resiziing(){
        this.fin_hoover()
    }

    is_turnining(){
        this.fin_hoover()
    }

    fin_selectionne(){

    }

    is_click(e){
        console.log('is_click')
        this.fin_selectionne();
        if(e != null && isTouchDevice==false){
            if(e.shiftKey == false && e.ctrlKey == false){
                get_potager_byId(this.id_father).deselect_all_objet();
            }
        }
        
        this.is_selected=this.is_selected_bs;
        if(this.is_selected){
            this.unclick();
        }else{
            this.click();
        }
    }

    click(){
        this.is_selected=true;

        this.objet_cree.addClass('un_objet_selected_h')

        if(get_potager_byId(this.id_father).get_objs_selected().length == 1){
            if(this.allow_resize_h || this.allow_resize_w){
                allow_resize_object(this.objet_cree)
            }
            if(this.allow_turn){
                allow_turn_object(this.objet_cree)
            }
        }else{
            $('.resize_object_tmp').remove();
            $('.turn_object_tmp').remove();
        }
    }

    unclick(){
        this.is_selected=false;
        this.objet_cree.removeClass('un_objet_selected_h')
        $('.resize_object_tmp').remove();
        $('.turn_object_tmp').remove();
        if(get_potager_byId(this.id_father).get_objs_selected().length==0){
            selection_multiple=false;
            get_potager_byId(this.id_father).deselect_all_objet();
        }

        if(isTouchDevice){
            //console.log('unclick fin_selectionne')
            this.fin_selectionne();
        }
    }

    mouvement(var_x,var_y){
        console.log('mouve : '+var_x + ' - ' + x_s)
        this.en_mouvement();
        var tmpT=this.objet_cree_f.css('transform');
        this.objet_cree_f.css('transform','');
        var x_coor=this.objet_cree_f.position().left + var_x-x_s;
        var y_coor=this.objet_cree_f.position().top + var_y-y_s;
        this.objet_cree_f.css('transform',tmpT);

        if(x_coor<0){
            x_coor=0;
        }
        if(y_coor<0){
            y_coor=0;
        }

        
        this.t=y_coor;
        this.l=x_coor;
        this.refresh();


        
        is_resizing=true;
        need_to_save_object=true;
    }

    en_mouvement(){

    }

    fin_de_mouvement(){

    }

    hoover(){

    }

    fin_hoover(){

    }

    pop_up(){
        return
        this.objet_cree.addClass('animate__animated  animate__heartBeat') //rubberBand
        var that=this;
        setTimeout(function(){
            that.objet_cree.removeClass('animate__animated  animate__heartBeat') //rubberBand
        },1000)
    }

    refresh(){

        var potager_pere = get_potager_byId(this.id_father);

        var pi = Math.PI;
        if(this.h != null  && this.allow_resize_h){
            this.objet_cree.css('height',this.h + 'px');
        }else{
            this.h=30;
        }
        if(this.w != null && this.allow_resize_w){
            this.objet_cree.css('width',this.w + 'px');
        }else{
            this.w=30;
        }
        if(this.t != null){
            if(parseInt(this.t) + (parseInt(this.h) * Math.cos(this.angle * pi / 180)) + (parseInt(this.w) * Math.sin(this.angle * pi / 180)) > parseInt(potager_pere.h)){
                this.t=parseInt(potager_pere.h) - ((parseInt(this.h) * Math.cos(this.angle * pi / 180)) + (parseInt(this.w) * Math.sin(this.angle * pi / 180)));
            }
            this.objet_cree_f.css('top',this.t + 'px')
        }
        if(this.l != null){
            if(parseInt(this.l) + (parseInt(this.w) * Math.cos(this.angle * pi / 180))- (parseInt(this.h) * Math.sin(this.angle * pi / 180)) > parseInt(potager_pere.w)){
                this.l=parseInt(potager_pere.w) - ((parseInt(this.w) * Math.cos(this.angle * pi / 180))- (parseInt(this.h) * Math.sin(this.angle * pi / 180)));
            }
            this.objet_cree_f.css('left',this.l + 'px')
        }
        
        
    }

    

    save(){


        var that=this;
        var objet_to_save_s=this.type + '|' + this.l + '|' + this.t + '|' + this.w + '|' +  this.h + '|' +  this.id_spec + '|' +  this.id_bdd + '|' +  this.angle + '|' +  this.options
        $.ajax({
            type: 'POST',
            url: '/plugins/jardin/core/ajax/jardin.ajax.php',
            data: {
                action: 'save_one_element_plan',
                object_id : this.id_father,
                objet: init(objet_to_save_s)
            },
            dataType: 'json',
            error: function (request, status, error) {
                handleAjaxError(request, status, error);
                next_save_obj();
            },
            success: function (data) {
                if (data.state != 'ok') {
                    $('#div_alert').showAlert({message: data.result, level: 'danger'});
                    return;
                }
                that.obj_original=Object.assign(Object.create(Object.getPrototypeOf(that)), that); 
                next_save_obj();
            }
            });
    }

    supprimer(){
        var that=this
        $.ajax({
            type: 'POST',
            url: '/plugins/jardin/core/ajax/jardin.ajax.php',
            data: {
                action: 'del_one_element_plan',
                object_id : this.id_father,
                id_to_dell: init(this.id_spec)
            },
            dataType: 'json',
            error: function (request, status, error) {
                handleAjaxError(request, status, error);
                alert('erreur suppression')
                next_del_obj();
            },
            success: function (data) {
                if (data.state != 'ok') {
                    $('#div_alert').showAlert({message: data.result, level: 'danger'});
                    return;
                }else{
                    get_potager_byId(that.id_father).remove_item(that);
                    that.objet_cree_f.remove();
                }
                next_del_obj();
                
            }
            });
    }

    afficher(){

        


        var that=this;
        if(this.objet_cree_f != null){
            this.objet_cree_f.remove();
        }

        this.objet_cree_f=$('<div/>', {
            "class": 'un_objet_father',
        }).appendTo(this.node_father);
        this.objet_cree_f.attr('media','print');
        
        //semence en z-index 5 
        this.objet_cree_f.css('z-index','4')
        if(this.type=='carre_potager'){
            this.objet_cree_f.css('z-index','2')
        }
        if(this.type=='herbe'){
            this.objet_cree_f.css('z-index','2')
        }
        if(this.type=='serre'){
            this.objet_cree_f.css('z-index','1')
        }
        if(this.type=='dalle_jardin'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='grillage'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='fil_arrosage'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='cours_d_eau'){
            this.objet_cree_f.css('z-index','3')
        }
        if(this.type=='marre'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='cabane'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='muret'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='haie'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='poulailler'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='cuve_eau'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='terrasse'){
            this.objet_cree_f.css('z-index','1')
        }
        if(this.type=='rocher'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='barbecue'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='robot'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='poubelle'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='bois'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='puit'){
            this.objet_cree_f.css('z-index','4')
        }
        if(this.type=='etiquette'){
            this.objet_cree_f.css('z-index','5')
        }
        

        this.objet_cree=$('<div/>', {
            "class": 'un_objet',
        }).appendTo(this.objet_cree_f);
        this.objet_cree_f.css('transform-origin','top left')
        this.objet_cree_f.css('transform','rotate(' + this.angle + 'deg)') 

        
        this.un_objet_true=$('<div/>', {
            "class": 'un_objet_true',
        }).appendTo(this.objet_cree);

        
        
        if(this.type=='grillage'){
            this.allow_resize_h=false;
        }
        if(this.type=='fil_arrosage'){
            this.allow_resize_h=false;
        }
        if(this.type=='muret'){
            this.allow_resize_h=false;
            this.h=10;
            this.un_objet_true.css('height',this.h + 'px');
            this.objet_cree.css('height',this.h + 'px');
            this.objet_cree.css('min-height','10px')
        }
        if(this.type=='haie'){
            this.allow_resize_h=false;
            this.h=32;
            this.objet_cree.css('height',this.h + 'px');
        }


        this.objet_cree.attr('type_objet',this.type)
        this.objet_cree.attr('id_spec',this.id_spec)
        this.objet_cree.attr('id_bdd',this.id_bdd)
        this.objet_cree_f.attr('id_spec',this.id_spec)

        if(this.type!='etiquette'){
            this.un_objet_true.addClass(this.type + '_img');
        }
        

        if(this.get_option('paille') == 'oui'){
            var option_paille=$('<div/>', {
                "class": 'paillage_semence',
            }).appendTo(this.objet_cree);
            if(this.type != 'semence'){
                option_paille.css('z-index','1')
            }
            
        }
    
        
        var etiquette_d=this.get_option('etiquette');
        if(this.type=='etiquette' && (etiquette_d == null|| etiquette_d=='')){
            etiquette_d='A modifier'
        }
        if(etiquette_d != null && etiquette_d!=''){
            var o_etiquette=$('<div/>', {
                "class": 'etiquette',
            }).appendTo(this.objet_cree);
            o_etiquette.text(etiquette_d)
            if(this.type=='etiquette'){
                o_etiquette.removeClass('etiquette')
                o_etiquette.addClass('etiquette_etiquette')
            }

            //c_ettiquette
            var c_etiquette=this.get_option('c_ettiquette')
            if(c_etiquette != ''){
                
                o_etiquette.css('color','#' + c_etiquette)
            }
        }

        this.refresh();

        if(this.get_option('marqueur') == 'oui'){
            var marqueur=$('<div/>', {
                "class": 'un_objet_marqueur',
            }).appendTo(this.objet_cree);
        }
    

        this.objet_cree.on('mousedown',function(event){
            if(isTouchDevice==false){
                mousedown(event)
            }
            event.stopPropagation();
        });
        this.objet_cree.on('touchstart',function(event){
            add_debug('touchstart')
            touch_start_time = Date.now();
            
            mousedown(event)
            event.stopPropagation();
        });
        this.objet_cree.on('touchend',function(event){
            add_debug('touchend')
            $('#id_plan_potager').removeClass('stop-scrolling')
            var tmp = Date.now();
            console.log('touchend : ' + (tmp-touch_start_time))
            if(tmp-touch_start_time >= 1000 && get_potager_byId(that.id_father).get_objs_selected().length==1 && event.touches.length >0){
                //console.log('long click')
                that.menu_clic_droit(event.touches[0].pageX,event.touches[0].pageY,event)
            }else{
                if(tmp-touch_start_time < 400){
                    if(get_potager_byId(that.id_father).get_option('lock') =='oui' && that.type!='semence'){
                        return true;
                    }
                    if(get_potager_byId(that.id_father).get_option('lock_s') =='oui' && that.type=='semence'){
                        return true;
                    }
                    if(that.get_option('verouille')=='oui'){
                        return true;
                    }
                    console.log('short click')
                    that.is_click();
                }
                
            }
            touch_start_time=null;
            //event.stopPropagation();
        });

        function mousedown(event){
            if(get_potager_byId(that.id_father).get_option('lock') =='oui' && that.type!='semence'){
                return true;
            }
            if(get_potager_byId(that.id_father).get_option('lock_s') =='oui' && that.type=='semence'){
                return true;
            }
            if(that.get_option('verouille')=='oui'){
                return true;
            }

            if(isTouchDevice){
                $('#id_plan_potager').addClass('stop-scrolling')
            }

            if(object_selected == null && event.which<=1){
                start_click = Date.now();
                object_selected=$(event.currentTarget);
                x_s=event.pageX;
                y_s=event.pageY;
                object_selected_type = 'un_objet';

                //if(selection_multiple == false){
                    //console.log('mousedown')
                    that.selectionne(event);
                //}
                

                if(event.altKey){
                    move_all_obj=true;
                }
            }

                event.stopPropagation();

        }


        this.objet_cree.on('mouseenter',function(event){

            if(isTouchDevice){
                return false
            }
            if($('#menu_obj').length != 0){
                return false;
            }
            if(get_potager_byId(that.id_father).get_option('lock')=='oui' && that.type!='semence'){
                return false;
            }
            
            if(that.get_option('verouille')=='oui'){
                return false;
            }
            if(object_selected == null){
                that.hoover();

                if(get_potager_byId(that.id_father).get_option('lock_s')=='oui' && that.type=='semence'){
                    return false;
                }
                that.objet_cree.addClass('un_objet_selected')
            
                un_plan_potager_father_mouseleave($(that.objet_cree_f.parent().parent().children()[0]))
                event.stopPropagation();

                if(that.allow_turn){
                    allow_turn_object(that.objet_cree)
                }
                
                if(that.allow_resize_h || that.allow_resize_w){
                    //console.log('mouseneter')
                    allow_resize_object(that.objet_cree)
                }
                
                
            }
            event.stopPropagation();
            
        })

        this.objet_cree.on('mouseleave',function(event){
            if(object_selected == null){
                that.fin_hoover();
                $(event.currentTarget).removeClass('un_objet_selected')
                $('.resize_object_tmp').remove();
                $('.turn_object_tmp').remove();
            }
            event.stopPropagation();
            
        })

        this.objet_cree.bind("contextmenu",function(event){
            //if(isTouchDevice==false){
                console.log('contextmenu')
                that.menu_clic_droit(event.pageX,event.pageY,event)
            //}
            event.stopPropagation();
            return false;
        });


        this.objet_cree.on('mouseup',function(e){
            if(is_resizing == false && e.which==1 && isTouchDevice==false){
                const millis = Date.now() - start_click;
                //alert('mmmm ' + millis)
                if(millis < 400){
                    if(e.ctrlKey){
                        selection_multiple=true;
                    }
                    //console.log('mouseup')
                    that.is_click(e);
                }
                that.fin_selectionne();
            }
        })
        
    }

    etiquette(){
        var that=this;
        if(this.get_option('c_ettiquette')==null){
            this.set_option('c_ettiquette','000000');
        }
        var etiquette_d=this.get_option('etiquette');
        if(etiquette_d == null){
            etiquette_d='';
        }
        //var etiquette = prompt("Label étiquette ? (vide pour pas d'étiquette)",etiquette_d);
        
        bootbox.prompt({
            title:"Label étiquette ? (vide pour pas d'étiquette)",
            value:etiquette_d,
            callback:  function(etiquette){ 
            if(etiquette != null){
                if(etiquette==''&& that.type=='etiquette'){
                    etiquette='a modifier'
                }
                that.set_option('etiquette',etiquette);
                that.afficher();
            }
            }
        });

        
    }
    
    
    menu_clic_droit(x,y,event){
        $('.recherche_semence_menu').remove();
        var that=this;
        $('#menu_obj').remove();
        $('.pop_up_detail_semence').remove();
        var menu_obj=$('<div/>', {
            "id": 'menu_obj',
        }).appendTo($('#id_plan_potager'));
    
    
        y=y-$('#id_plan_potager').offset().top + $('#id_plan_potager').scrollTop();
        x=x-$('#id_plan_potager').offset().left+ $('#id_plan_potager').scrollLeft();

        //on rectifie si ca deborde trop 
        //debug=get_potager_byId(this.id_father)
        var x_p=get_potager_byId(this.id_father).node.offset().left + get_potager_byId(this.id_father).node.width()+ $('#id_plan_potager').scrollLeft();
        var y_p=get_potager_byId(this.id_father).node.offset().top + get_potager_byId(this.id_father).node.height()

        if(y + 300 > y_p){
            //alert('max y')
            //y=y-(y+320 - y_p)
        }
        if(x + 420 > x_p){
            //alert('max x')
            x=x-(x+420 - x_p)
        }

        if(x < 3){
            x=3;
        }

        menu_obj.css('top',(y + 10) + "px")
        menu_obj.css('left',x + "px")

        if(window.innerWidth <=800){
            menu_obj.css('top','')
            menu_obj.css('left',"0px")
            menu_obj.css('right',"0px")
            menu_obj.css('margin-right',"auto")
            menu_obj.css('margin-left',"auto")
            menu_obj.css('bottom',"0px")
            menu_obj.css('position',"fixed")
        }
    
        
        var menu_obj_titre=$('<div/>', {
            "class": 'menu_obj_titre',
        }).appendTo(menu_obj);
        menu_obj_titre.text('Menu')

        var item_sas=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_sas);
            icon_item.attr('src',base_url + '/plugins/jardin/data/img/sel_all.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_sas);

        text_item.text('Sélectionner toutes les semences')
        item_sas.on('click',function(){
            get_potager_byId(that.id_father).selectionner_toutes_les_semences();
        });

        if(this.type!='semence'){
            item_sas.hide()
        }

        var item_del=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);

        var icon_item=$('<img/>', {
            "class": 'menu_obj_item_icon',
        }).appendTo(item_del);
        icon_item.attr('src',base_url +  '/plugins/jardin/data/img/corbeille.png')

        var text_item=$('<div/>', {
            "class": 'menu_obj_item_text',
        }).appendTo(item_del);


        text_item.text('Supprimer')
        text_item.css('color','red')
        if(selection_multiple==true){
            text_item.text('Supprimer la sélection')
        }
        item_del.on('click',function(){
            if(selection_multiple==false){
                add_cancel_action('Delete obj ',that,null,true)
                that.supprimer()
                get_potager_byId(that.id_father).deselect_all_objet();
            }else{
                get_potager_byId(that.id_father).delete_selection(true);
            }
        })

    
        if(selection_multiple==false || get_potager_byId(that.id_father).get_objs_selected().length == 1){
            
            if(this.type=='carre_potager'){
                var item_ss=$('<div/>', {
                    "class": 'menu_obj_item',
                }).appendTo(menu_obj);
                    var icon_item=$('<img/>', {
                        "class": 'menu_obj_item_icon',
                    }).appendTo(item_ss);
                    icon_item.attr('src',base_url + '/plugins/jardin/data/img/paille2.png')
        
                    var text_item=$('<div/>', {
                        "class": 'menu_obj_item_text',
                    }).appendTo(item_ss);
        
                text_item.text('Marqué comme paillé')
                item_ss.on('click',function(){
                    if(that.get_option('paille') == 'oui'){
                        that.set_option('paille','non')
                        add_cancel_action('Paille',that,null,false,false)
                    }else{
                        that.set_option('paille','oui')
                        add_cancel_action('Paille',that,null,false,false)
                    }
                    that.afficher();
                });
                if(this.get_option('paille') == 'oui'){
                    text_item.text('Marqué comme NON paillé')
                }
            }

            //etiquette==========================
            var item_eti=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);

            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_eti);
            icon_item.attr('src',base_url + '/plugins/jardin/data/img/etiquette.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_eti);


            text_item.text('Ajouter une étiquette')
            if((that.get_option('etiquette') != '' && that.get_option('etiquette') != null) || that.type == 'etiquette'){
                text_item.text('Modifier l\'étiquette')
            }
            item_eti.on('click',function(){
                that.etiquette()
            })



            //couleur etiquette
            if(that.get_option('etiquette') != '' && that.get_option('etiquette') != null){
                var item_eti=$('<div/>', {
                    "class": 'menu_obj_item',
                }).appendTo(menu_obj);

                var icon_item=$('<input/>', {
                    "class": 'menu_obj_item_icon test_class',
                }).appendTo(item_eti);
                icon_item.attr('type','color')
                icon_item.css('height','20px');
                icon_item.css('width','20px');
                icon_item.css('margin-right','12px');
                icon_item.val('#' + that.get_option('c_ettiquette'))
                icon_item.on('click',function(e){
                    e.stopPropagation();
                })
                icon_item.on('input',function(){
                    that.objet_cree_f.find('.etiquette').css('color','#' + $(this).val())
                })
                icon_item.on('change',function(){
                    that.set_option('c_ettiquette',$(this).val())
                })

                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item_eti);


                text_item.text('Modifier la couleur de l\'étiquette')
                item_eti.on('click',function(e){

                    e.stopPropagation();
                    $('#menu_obj').hide();
                    $($(this).children()[0]).click()
                    
                    
                })
            }

        
            var item_duppliquer=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
            
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_duppliquer);
            icon_item.attr('src',base_url + '/plugins/jardin/data/img/duppliquer.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_duppliquer);

            text_item.text('Dupliquer')
            

            item_duppliquer.on('click',function(){
                
                var obj=that.duppliquer()
                add_cancel_action('Dupplicate obj ',obj,null,false,true)
                get_potager_byId(that.id_father).deselect_all_objet();
            })


            var item_duppliquer=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
            
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_duppliquer);
            icon_item.attr('src',base_url + '/plugins/jardin/data/img/duppliquer.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_duppliquer);

            text_item.text('Dupliquer Multiple')
            

            item_duppliquer.on('click',function(){
                    that.dupplication_multiple()
            })

            var item_drapeau=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
    
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item_drapeau);
                icon_item.attr('src',base_url + '/plugins/jardin/data/img/drapeau.png')
    
                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item_drapeau);
    
                text_item.text('Ajouter un marqueur')
                item_drapeau.on('click',function(){
                    if(that.get_option('marqueur') == 'oui'){
                        that.set_option('marqueur','non')
                    }else{
                        that.set_option('marqueur','oui')
                    }
                    that.afficher();
                });
                if(this.get_option('marqueur') == 'oui'){
                    text_item.text('Supprimer le marqueur')
                }
        }



        


        if(selection_multiple && get_potager_byId(that.id_father).get_objs_selected().length >= 2){
            var item_ah=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item_ah);
                icon_item.attr('src',base_url + '/plugins/jardin/data/img/a_h.png')

                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item_ah);
                
                text_item.text('Aligner Horizontalement la sélection')
            item_ah.on('click',function(){
                get_potager_byId(that.id_father).aligner_h_obj_s(true);
            });

            var item_av=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item_av);
                icon_item.attr('src',base_url + '/plugins/jardin/data/img/a_v.png')

                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item_av);
                text_item.text('Aligner Verticalement la sélection')
            item_av.on('click',function(){
                get_potager_byId(that.id_father).aligner_v_obj_s(true);
            });

            if(get_potager_byId(that.id_father).get_objs_selected().length >= 2){
                var item_eh=$('<div/>', {
                    "class": 'menu_obj_item',
                }).appendTo(menu_obj);
                    var icon_item=$('<img/>', {
                        "class": 'menu_obj_item_icon',
                    }).appendTo(item_eh);
                    icon_item.attr('src',base_url + '/plugins/jardin/data/img/duppliquer_sel.png')

                    var text_item=$('<div/>', {
                        "class": 'menu_obj_item_text',
                    }).appendTo(item_eh);

                text_item.text('Dupliquer')
                item_eh.on('click',function(){
                    get_potager_byId(that.id_father).duplicate_selection();
                });
            }

            if(get_potager_byId(that.id_father).get_objs_selected().length > 2){
                var item_eh=$('<div/>', {
                    "class": 'menu_obj_item',
                }).appendTo(menu_obj);
                    var icon_item=$('<img/>', {
                        "class": 'menu_obj_item_icon',
                    }).appendTo(item_eh);
                    icon_item.attr('src',base_url + '/plugins/jardin/data/img/e_h.png')

                    var text_item=$('<div/>', {
                        "class": 'menu_obj_item_text',
                    }).appendTo(item_eh);

                text_item.text('Espacer Horizontalement la sélection')
                item_eh.on('click',function(){
                    get_potager_byId(that.id_father).espacer_h_obj_s(true);
                });
    
                var item_ev=$('<div/>', {
                    "class": 'menu_obj_item',
                }).appendTo(menu_obj);
                    var icon_item=$('<img/>', {
                        "class": 'menu_obj_item_icon',
                    }).appendTo(item_ev);
                    icon_item.attr('src',base_url + '/plugins/jardin/data/img/e_v.png')

                    var text_item=$('<div/>', {
                        "class": 'menu_obj_item_text',
                    }).appendTo(item_ev);
                    
                    text_item.text('Espacer Verticalement la sélection')
                item_ev.on('click',function(){
                    get_potager_byId(that.id_father).espacer_v_obj_s(true);
                });


                var item_m=$('<div/>', {
                    "class": 'menu_obj_item',
                }).appendTo(menu_obj);
                    var icon_item=$('<img/>', {
                        "class": 'menu_obj_item_icon',
                    }).appendTo(item_m);
                    icon_item.attr('src',base_url + '/plugins/jardin/data/img/magic_align.png')
        
                    var text_item=$('<div/>', {
                        "class": 'menu_obj_item_text',
                    }).appendTo(item_m);
        
                text_item.text('Organiser auto les semences sélectionnées')
                item_m.on('click',function(){
                    get_potager_byId(that.id_father).organiser_semence_magic(true);
                });

            }
            
            
        }

        this.fin_selectionne()
    }

}

var debug;