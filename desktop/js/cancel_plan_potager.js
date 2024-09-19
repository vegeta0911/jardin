var cancel_actions=[];
var index_cancel_action=0;
function reajust_cancels_item(){
    for(var i=(index_cancel_action-1);i>0;i--){
        const index = cancel_actions.indexOf(5);
        if (i >= cancel_actions.length) {
            cancel_actions.splice(i, 1);
        }
    }
}

function add_cancel_action(nom,obj,objs=null,delete_action=false,add_action=false){
    if(obj == null && objs==null){
        return
    }
    //console.log('new cancel_action')
    reajust_cancels_item();
    var action_to_cancel_obj=new cancel_action(nom,obj,objs,delete_action,add_action)
    cancel_actions.splice(0,0,action_to_cancel_obj)
    index_cancel_action=0;
}

function cancel_one_action(){
    //console.log('> cancel_one_action')
    if(index_cancel_action+1 > cancel_actions.length){
        //console.log('    > impossible d\'annuler : ' + index_cancel_action + ' - ' + cancel_actions.length)
        return //impossible d'annuler
    }
    var action_to_cancel_obj=cancel_actions[index_cancel_action]
    action_to_cancel_obj.cancel_action();
    index_cancel_action++;
}

function redo_one_action(){
    //console.log('> redo_one_action ' + index_cancel_action)
    if(index_cancel_action-1 < 0){
        //console.log('    > impossible de redo : ' + index_cancel_action + ' - ' + cancel_actions.length)
        return //impossible d'annuler
    }
    index_cancel_action--;
    var action_to_cancel_obj=cancel_actions[index_cancel_action]
    action_to_cancel_obj.redo_action();
}

function clear_cancel_actions(){
    cancel_actions=[];
    index_cancel_action=0;
}

var cancel_action=class cancel_action {
    nom = '';
    heure=null;
    objs=[];
    delete_action=false;
    add_action=false;

    constructor(nom,obj,objs,delete_action=false,add_action=false) {
        //console.log('new cancel_action')
        this.heure=new Date();
        this.nom=nom;
        this.add_action=add_action;
        this.add_obj(obj)
        if(objs != null){
            objs.forEach(element => {
                this.add_obj(element)
            });
        }
        
        this.delete_action=delete_action;
    }

    add_obj(obj){
        if(obj == null){
            return
        }
        //this.objs.push({...obj});
        this.objs.push(Object.assign(Object.create(Object.getPrototypeOf(obj)), obj));

    }

    cancel_action(){
        //console.log('   > cancel_action : ' + this.nom)
        //console.log('   > mode delete_action : ' + this.delete_action)

        if(this.delete_action){
            
            //on reajoute les obj supprimé
            list_to_save=[];
            this.objs.forEach(element=>{
                get_current_potager().ajouter_obj(element);
                element.afficher();
                element.charger_more_info_from_serveur();
                list_to_save.push(element)
            })

            next_save_obj();
        }else{
            if(this.add_action){
                //on supprime les éléments ajouté
                get_current_potager().deselect_all_objet();
                this.objs.forEach(element=>{
                    var obj=get_current_potager().get_obj_by_id(element.id_spec);
                    if(obj != null){
                        obj.is_selected=true;
                    }
                })

                get_current_potager().delete_selection();
            }else{
                //on remet la version original
                list_to_save=[];
                this.objs.forEach(element=>{
                    var obj=get_current_potager().get_obj_by_id(element.id_spec);
                    if(obj != null){
                        if(element.obj_original != null){
                            obj.objet_cree_f.remove();
                            var obj=Object.assign(Object.create(Object.getPrototypeOf(element.obj_original)), element.obj_original); 
                            get_current_potager().replace_obj_by_id(element.id_spec,obj);
                            list_to_save.push(obj)
                            obj.afficher();
                            obj.charger_more_info_from_serveur();
                        }else{
                            console.error('element.obj_original; NULL ')
                        }
                        
                    }
                })

                next_save_obj();



            }
        }
    }

    redo_action(){
        if(this.delete_action){
            //on resupprime les obj
            get_current_potager().deselect_all_objet();
            this.objs.forEach(element=>{
                var obj=get_current_potager().get_obj_by_id(element.id_spec);
                if(obj != null){
                    obj.is_selected=true;
                }
            })

            get_current_potager().delete_selection();
        }else{
            if(this.add_action){
                //on reajoute les obj supprimé
                list_to_save=[];
                this.objs.forEach(element=>{
                    get_current_potager().ajouter_obj(element);
                    element.afficher();
                    element.charger_more_info_from_serveur();
                    list_to_save.push(element)
                })

                next_save_obj();
            }else{
                //on remet la version NON original
                list_to_save=[];
                this.objs.forEach(element=>{
                    var obj=get_current_potager().get_obj_by_id(element.id_spec);


                    if(obj != null){
                        obj.objet_cree_f.remove();
                        var obj=Object.assign(Object.create(Object.getPrototypeOf(element)), element); 
                        get_current_potager().replace_obj_by_id(element.id_spec,obj);
                        obj.afficher();
                        list_to_save.push(obj)
                    }
                })

                next_save_obj();
            }

            
        }
    }
}