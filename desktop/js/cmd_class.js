var cmd_action_info=class cmd_action_info extends un_objet {
    html='';

    constructor() {
        super();
        this.w = 150;
        this.h = 150;
        this.type="cmd_action_info";
        this.allow_resize_h=true;
        this.allow_resize_w=true;
        this.allow_turn=true;
    }

    duppliquer(save=true){


        var obj=new cmd_action_info();
        return super.duppliquer(save,obj)

    }

    afficher(){
        super.afficher();
        this.objet_cree.html(this.html);
        $($(this.objet_cree.children()[0])).css('height','auto');
        $($(this.objet_cree.children()[0])).css('width','auto');
        $($(this.objet_cree.children()[0])).css('display','flex');
        $($(this.objet_cree.children()[0])).css('flex-direction','column');
        $($(this.objet_cree.children()[0])).css('align-items','center');

        $($(this.objet_cree.children()[0])).css('overflow','hidden');


        if(this.get_option('transparent') == 'oui'){
            $(this.objet_cree.children()[0]).attr('style', 'background-color: rgba(0,0,0,0) !important;box-shadow: none')
            $($(this.objet_cree.children()[0]).children()[0]).attr('style', 'background-color: rgba(0,0,0,0) !important')
        }
        if(this.get_option('hide_title') == 'oui'){
            $($(this.objet_cree.children()[0]).children()[0]).remove()
        }

        this.refresh_couleur('#' + this.get_option('c_texte'))
    }

    refresh_couleur(couleur){
        $('style[id_spec="' + this.id_spec + '"]').remove();
        var style_s=$('<style/>', {
            "id_spec": this.id_spec,
        }).appendTo($('body'));
        style_s.html('.un_objet > .cmd-widget[data-cmd_id="' + this.id_bdd + '"] * {color: ' + couleur + ' !important;}')
    }
    menu_clic_droit(x,y,event){

        var that=this;
        super.menu_clic_droit(x,y,event);
        this.fin_hoover();

        if(selection_multiple==false || get_potager_byId(that.id_father).get_objs_selected().length == 1){
            var item_c=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);

            var icon_item=$('<input/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_c);
            icon_item.attr('type','color')
            icon_item.css('height','20px');
            icon_item.css('width','20px');
            icon_item.css('margin-right','12px');
            icon_item.val('#' + that.get_option('c_texte'))
            icon_item.on('click',function(e){
                e.stopPropagation();
            })
            icon_item.on('input',function(){
                that.refresh_couleur($(this).val())
                // $('style[id_spec="' + that.id_spec + '"]').remove();
                // var style_s=$('<style/>', {
                //     "id_spec": that.id_spec,
                // }).appendTo($('body'));
                // style_s.html('.un_objet > .cmd-widget[data-eqlogic_id="429"] * {color: red !important;}')

            })
            icon_item.on('change',function(){
               that.set_option('c_texte',$(this).val())
            })

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_c);


            text_item.text('Modifier la couleur du texte')
            item_c.on('click',function(e){

                e.stopPropagation();
                $('#menu_obj').hide();
                $($(this).children()[0]).click()
                
                
            })



            var item=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item);
                icon_item.attr('src',base_url + '/plugins/jardin/data/img/titre.png')
    
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
            url: base_url + '/plugins/jardin/core/ajax/jardin.ajax.php',
            data: {
                action: 'get_info_cmd_action_info',
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
                    that.supprimer();
                    return
                }
                if(data.result == "hide"){
                    that.objet_cree_f.remove();
                    return
                }
                that.html=data.result;
                
                that.afficher();
            }
            });
        
    }

}