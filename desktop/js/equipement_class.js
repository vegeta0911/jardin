var equipement=class equipement extends un_objet {
    html='';

    constructor() {
        super();
        this.w = 150;
        this.h = 150;
        this.type="equipement";
        this.allow_resize_h=true;
        this.allow_resize_w=true;
        this.allow_turn=true;
    }

    duppliquer(save=true){


        var obj=new equipement();
        return super.duppliquer(save,obj)

    }

    afficher(){
        super.afficher();
        this.objet_cree.html(this.html);
        $($(this.objet_cree.children()[0])).css('height','auto');
        $($(this.objet_cree.children()[0])).css('width','auto');
        $($(this.objet_cree.children()[0])).css('overflow','hidden');

        if(this.get_option('transparent') == 'oui'){
            $(this.objet_cree.children()[0]).attr('style', 'background-color: rgba(0,0,0,0) !important;box-shadow: none')
            $($(this.objet_cree.children()[0]).children()[0]).attr('style', 'background-color: rgba(0,0,0,0) !important')
        }
        if(this.get_option('hide_title') == 'oui'){
            $($(this.objet_cree.children()[0]).children()[0]).remove()
        }
    }

    menu_clic_droit(x,y,event){

        var that=this;
        super.menu_clic_droit(x,y,event);
        this.fin_hoover();

        if(selection_multiple==false || get_potager_byId(that.id_father).get_objs_selected().length == 1){

            var item=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item);
                icon_item.attr('src',base_url +  '/plugins/potager/data/img/transparent.png')
    
                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item);
    
            text_item.text('Fond transparent')
            item.on('click',function(){
                if(that.get_option('transparent') == 'oui'){
                    that.set_option('transparent','non')
                }else{
                    that.set_option('transparent','oui')
                }
                that.afficher();
            });
            if(this.get_option('transparent') == 'oui'){
                text_item.text('Fond NON transparent')
            }


            var item=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item);
                icon_item.attr('src',base_url +  + '/plugins/potager/data/img/titre.png')
    
                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item);
    
            text_item.text('Masquer le titre')
            item.on('click',function(){
                if(that.get_option('hide_title') == 'oui'){
                    that.set_option('hide_title','non')
                }else{
                    that.set_option('hide_title','oui')
                }
                that.afficher();
            });
            
            if(this.get_option('hide_title') == 'oui'){
                text_item.text('Afficher le titre')
            }

        }
    }


    charger_more_info_from_serveur(){

        var that=this
        $.ajax({
            type: 'POST',
            url: base_url + '/plugins/potager/core/ajax/potager.ajax.php',
            data: {
                action: 'get_info_equipement',
                id: init(this.id_bdd),
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
                if(data.result == "null"){
                    //console.log('Ask to dell equipement id spec ' + this.id_spec)
                    //to kill
                    that.supprimer();
                    return
                }
                if(data.result == "hide"){
                    //console.log('hide equipement id spec ' + this.id_spec);
                    that.objet_cree_f.remove();
                    return
                }
                //console.log('end charger_more_info_from_serveur');
                //console.log(data);
                that.html=data.result;
                
                that.afficher();
            }
            });
        
    }

}