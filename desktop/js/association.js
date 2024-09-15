

var especes_bdd = JSON.parse(especes); 





var semence=class semence extends un_objet {
    match_bdd = null
    associations_ind=[]
    incompatibilites_ind=[]
    semis=[false,false,false,false,false,false,false,false,false,false,false,false];
    semis_terre=[false,false,false,false,false,false,false,false,false,false,false,false];
    recolte=[false,false,false,false,false,false,false,false,false,false,false,false];
    variete=''
    origine=''
    nom_origine=''
    culture=''
    couleur=''
    qte_max=''
    ensoleillement=''
    distance_plantation=''
    arrosage=''
    lieu_culture=''
    cycle_vie='';
    nature_sol='';
    climat='';
    croissance='';
    v_coureuse='';
    v_precoce='';
    v_precoce='';
    palissage='';
    scarification='';
    latin='';
    pincer='';
    buter='';
    rusticite='';
    feuillage='';
    grimpant='';
    liste_semis='';
    type_semence='';

    t_min_supporte='';
    t_rusticite='';
    ia='';
    constructor() {
        super();
        this.type="semence"
    }

    duppliquer(save=true){
        var obj=new semence();
        return super.duppliquer(save,obj)

    }

    masquer_pop=null
    masquer_pop_up_detail(mode='potager',immediatement=true){
       //return
       var that=this;
       this.clear_masquer_pop_up=false;
       if(immediatement){
            console.log('masquer_pop_up_detail immediatement')
            $('.pop_up_detail_semence').remove();
            if(mode=='potager'){
                this.objet_cree_f.css('z-index','5')
            }
       }else{
            if(this.clear_masquer_pop_up==false){
                    this.masquer_pop=setTimeout(() => {
                        if(this.clear_masquer_pop_up==false){
                            console.log('masquer_pop_up_detail delay')
                            that.masquer_pop_up_detail(mode,true);
                        }
                }, 1000);
                
            }
            
       }
       
    }

    clear_masquer_pop_up=false;
    clear_masquer_pop_up_detail(){
        this.clear_masquer_pop_up=true;
        clearTimeout(this.masquer_pop);
    }

    afficher_pop_up_detail(mode='potager'){
        var that=this;
        this.masquer_pop_up_detail(mode);
        if($('#menu_obj').length == 1){
            return
        }

        if(mode=='potager'){
            this.objet_cree_f.css('z-index','6')
        }
        
        $('.pop_up_detail_semence').remove();
        var pop_up_detail_semence=$('<div/>', {
            "class": 'pop_up_detail_semence animate__fadeIn',
        }).appendTo(this.objet_cree_f);
        pop_up_detail_semence.css('transform-origin','top left')
        pop_up_detail_semence.css('transform','rotate(' + -this.angle + 'deg)') //angle_base

        pop_up_detail_semence.on('mouseenter',function(event){
            that.clear_masquer_pop_up_detail();
            console.log('pop_up_detail_semence mouseenter')
            event.stopPropagation();
        });
        pop_up_detail_semence.on('mousedown',function(event){
            that.clear_masquer_pop_up_detail();
            console.log('pop_up_detail_semence mousedown')
            event.stopPropagation();
        });
        pop_up_detail_semence.on('contextmenu',function(event){
            that.clear_masquer_pop_up_detail();
            event.stopPropagation();
            return false
        });
        pop_up_detail_semence.on('mouseenter',function(event){
            that.clear_masquer_pop_up_detail();
            console.log('pop_up_detail_semence mouseenter')
            event.stopPropagation();
            return false
        });
        pop_up_detail_semence.on('mouseleave',function(event){
            if(that.clear_masquer_pop_up){
                console.log('pop_up_detail_semence mouseleave')
                that.clear_masquer_pop_up=false;
                that.masquer_pop_up_detail('potager',false);
            }
            return false
        });

        var triangle_haut=$('<div/>', {
            "class": 'triangle_haut',
        }).appendTo(pop_up_detail_semence);

        var bouton_detail_fiche_popup=$('<div/>', {
            "class": 'bouton_detail_fiche_popup fas fa-info-circle',
        }).appendTo(pop_up_detail_semence);
        bouton_detail_fiche_popup.attr('title','Ouvrir la fiche semence')
        bouton_detail_fiche_popup.on('click',function(){
            window.open(base_url + '/index.php?v=d&m=potager&p=potager&id=' + that.id_bdd,'_blank');
        })

        if(this.match_bdd != null){
            var ensemble_ia_haut_pop_up=$('<div/>', {
                "class": 'ensemble_ia_haut_pop_up',
            }).appendTo(pop_up_detail_semence);

            if(this.match_bdd.img != null && this.match_bdd.img != ''){
                var url=this.match_bdd.img
                //img_semence.css('background-image','url("' + base_url + '/plugins/potager/data/img/semences/' + url + '")')

                var ensemble_ia_haut_pop_up_img=$('<img/>', {
                    "class": 'ensemble_ia_haut_pop_up_img',
                }).appendTo(ensemble_ia_haut_pop_up);
                ensemble_ia_haut_pop_up_img.attr('src',base_url + '/plugins/potager/data/img/semences/' + url)

                
            }

            var ensemble_ia_haut_pop_up_droite=$('<div/>', {
                "class": 'ensemble_ia_haut_pop_up_droite',
            }).appendTo(ensemble_ia_haut_pop_up);

            var ensemble_ia_haut_pop_up_nom=$('<div/>', {
                "class": 'ensemble_ia_haut_pop_up_nom',
            }).appendTo(ensemble_ia_haut_pop_up_droite);
            ensemble_ia_haut_pop_up_nom.text(strUcFirst(this.match_bdd.espece))
            ensemble_ia_haut_pop_up_nom.attr('title','Détecté comme par l\'IA')

            var ensemble_ia_haut_pop_up_widgets=$('<div/>', {
                "class": 'ensemble_ia_haut_pop_up_widgets',
            }).appendTo(ensemble_ia_haut_pop_up_droite);
            
            if(this.arrosage != ''){
                var img=ia_analyse_text(null,this.arrosage,'arrosage',true)
                if(img != null){
                    var ensemble_ia_haut_pop_up_un_widget=$('<img/>', {
                        "class": 'ensemble_ia_haut_pop_up_un_widget',
                    }).appendTo(ensemble_ia_haut_pop_up_widgets);
                    ensemble_ia_haut_pop_up_un_widget.attr('src',base_url + '/plugins/potager/data/img/' + img)
                }
            }

            if(this.ensoleillement != ''){
                var img=ia_analyse_text(null,this.ensoleillement,'ensoleillement',true)
                if(img != null){
                    var ensemble_ia_haut_pop_up_un_widget=$('<img/>', {
                        "class": 'ensemble_ia_haut_pop_up_un_widget',
                    }).appendTo(ensemble_ia_haut_pop_up_widgets);
                    ensemble_ia_haut_pop_up_un_widget.attr('src',base_url + '/plugins/potager/data/img/' + img)
                }
            }
            
        }

        var titre_detail_semence=$('<div/>', {
            "class": 'titre_detail_semence',
        }).appendTo(pop_up_detail_semence);
        titre_detail_semence.text(this.nom)

        var variete_detail_semence=$('<div/>', {
            "class": 'variete_detail_semence',
        }).appendTo(pop_up_detail_semence);
        variete_detail_semence.text(this.variete)
        variete_detail_semence.css('text-align','left')
        variete_detail_semence.css('margin-left','5px')
        function ajouter_detail_semence(nom,valeur,mode_oui_non=false,liste=null){
            if(valeur != ''){
                if(mode_oui_non){
                    if(valeur == 'oui'){
                        valeur='Oui'
                    }else{
                        if(valeur == 'non'){
                            valeur='Non'
                        }else{
                            valeur=''
                        }
                    }
                }
                if(liste != null){
                    var valeurN=liste[valeur];
                    if(valeurN==null){
                        valeurN=valeur;
                    }
                    valeur=valeurN;
                }
                if(valeur != ''){
                    var variete_detail_semence=$('<div/>', {
                        "class": 'variete_detail_semence',
                    }).appendTo(pop_up_detail_semence);
                    variete_detail_semence.html("<u>" + nom + " : </u> " +valeur)
                }
            }
        }

        ajouter_detail_semence('Nom latin',this.latin)
        ajouter_detail_semence('Couleur',this.couleur)
        ajouter_detail_semence('Culture d\'origine',this.culture)
        ajouter_detail_semence('Ensoleillement',this.ensoleillement)
        ajouter_detail_semence('Distance plantation',this.distance_plantation)
        ajouter_detail_semence('Arrosage',this.arrosage)
        // ajouter_detail_semence('Lieu de culture habituel',this.lieu_culture)

        // ajouter_detail_semence('Cycle de vie',this.cycle_vie,false,{'vivace':'Vivace (pluriannuelle)','annuelle':'Annuelle','bisannuelle':'Bisannuelle'})
        // ajouter_detail_semence('Nature du sol',this.nature_sol,false,{'humifere':'Humifère','calcaire':'Calcaire','argileux':'Argileux','sableux':'Sableux','acide':'Acide','tous':'Tous','leger':'Léger','ordinaire':'Ordinaire'})
        // ajouter_detail_semence('Climat',this.climat,false,{'douceur_ocean':'Douceur océan','tempere':'Tempéré','montagne':'Montagne'})
        // ajouter_detail_semence('Croissance',this.croissance,false,{"lente":"Lente","normale":"Normale","rapide":"Rapide"})
        // ajouter_detail_semence('Variété coureuse',this.v_coureuse,true)
        // ajouter_detail_semence('Précocité',this.v_precoce,false,{"normale":"Normale","precode":"Précoce","hative":"Hâtive","mi_saison":"Mi-Saison","tardive":"Tardive"})
        // ajouter_detail_semence('Palissage',this.palissage,true)
        // ajouter_detail_semence('Scarification tardive',this.scarification,true)
        // ajouter_detail_semence('Pincer',this.pincer,true)
        // ajouter_detail_semence('Buter',this.buter,true)
        // ajouter_detail_semence('Grimpant',this.grimpant,true)
        // ajouter_detail_semence('Rusticité',this.rusticite,false,{"oui":"Oui","non":"Non","faible":"Faible","moyenne":"Moyenne","forte":"Forte"})
        // ajouter_detail_semence('Feuillage',this.feuillage,false,{"caduc":"Caduc","persistant":"Persistant","semi_persistant":"Semi-Persistant"})
        // ajouter_detail_semence('T° min supportée',this.t_min_supporte)
        // ajouter_detail_semence('T° rusticité',this.t_rusticite)
        // ajouter_detail_semence('Origine',this.origine)
        

        var autre_detail_semence=$('<div/>', {
            "class": 'autre_detail_semence',
        }).appendTo(pop_up_detail_semence);
        autre_detail_semence.html("<u>Nom de l'origine : </u> " + this.nom_origine);
        if(this.nom_origine == ''){
            autre_detail_semence.html("");
        }

        var semis_d=$('<div/>', {
            "class": 'semis_detail_semence',
        }).appendTo(pop_up_detail_semence);

        var mois=['J','F','M','A','M','J','J','A','S','O','N','D']
        for(var i=0;i<12;i++){
            var mois_semis=$('<div/>', {
                "class": 'mois_semis_d',
            }).appendTo(semis_d);
            mois_semis.text(mois[i])

                if(this.semis[i]){
                    var mois_semis_tmp=$('<div/>', {
                        "class": 'mois_semis_semis',
                    }).appendTo(mois_semis);
                    mois_semis_tmp.attr('title','Semis conseillée')
                }
                if(this.semis_terre[i]){
                    var mois_semis_tmp=$('<div/>', {
                        "class": 'mois_semis_semis_terre',
                    }).appendTo(mois_semis);
                    mois_semis_tmp.attr('title','Semis en terre conseillée')
                }
                if(this.recolte[i]){
                    var mois_semis_tmp=$('<div/>', {
                        "class": 'mois_semis_recolte',
                    }).appendTo(mois_semis);
                    mois_semis_tmp.attr('title','Récolte conseillée')
                }
        }

        if(this.liste_semis != ''){
            var liste_semis=$('<div/>', {
                "class": 'pd_liste_semis',
            }).appendTo(pop_up_detail_semence);

            this.liste_semis.forEach(un_semis_d => {
                var un_semis=$('<div/>', {
                    "class": 'pd_un_semis',
                }).appendTo(liste_semis);

                var un_semis_nom=$('<div/>', {
                    "class": 'pd_un_semis_nom',
                }).appendTo(un_semis);
                un_semis_nom.html('<b>' + un_semis_d.nom + '</b>')
                
                nom_key_date.forEach(kd => {
                    if(un_semis_d[kd.key] != null && un_semis_d[kd.key] != ''){
                        var un_semis_nom=$('<div/>', {
                            "class": 'pd_un_semis_detail',
                        }).appendTo(un_semis);
                        un_semis_nom.html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<u>' + kd.nom + ' : </u>&nbsp;' + date_php_to_dateFR(un_semis_d[kd.key]))
                    }
                })
            })
        }
        
        
        if(this.match_bdd != null){
            var pop_up_detail_semence=$('<div/>', {
                "class": 'pop_up_detail_semence_detail',
            }).appendTo(pop_up_detail_semence);

            
            // var match_detail_semence=$('<div/>', {
            //     "class": 'match_detail_semence',
            // }).appendTo(pop_up_detail_semence);
            // match_detail_semence.text('Détecté comme : ' + this.match_bdd.espece)

            var asso_detail_semence=$('<div/>', {
                "class": 'asso_detail_semence',
            }).appendTo(pop_up_detail_semence);
            asso_detail_semence.html("<b>A associer avec : </b><br/>" + this.match_bdd.associations.join(', ')+ "<br/><b>Est bénéfique pour : </b><br/>" + this.associations_ind.map(e => e.espece).join(', '))

            var incomp_detail_semence=$('<div/>', {
                "class": 'incomp_detail_semence',
            }).appendTo(pop_up_detail_semence);
            incomp_detail_semence.html("<b>Eviter d'associer avec : </b><br/>" + this.match_bdd.incompatibilites.join(', ') + "<br/><b>Est néfaste pour : </b><br/>" + this.incompatibilites_ind.map(e => e.espece).join())


            var conseil_detail_semence=$('<div/>', {
                "class": 'detail_detail_semence',
            }).appendTo(pop_up_detail_semence);
            conseil_detail_semence.html(this.match_bdd.conseil)
        }

    }

    pop_up_detail = null
    hoover(){
        super.hoover();
        var that=this
        this.pop_up_detail=setTimeout(function(){
            that.afficher_pop_up_detail();
        },1000)
        //this.afficher_pop_up_detail();
    }

    en_mouvement(){
        this.fin_hoover();
    }

    fin_hoover(){
        //super.fin_hoover();
        if(this.pop_up_detail != null){
            clearTimeout(this.pop_up_detail);
            this.pop_up_detail=null;
        }
        
        this.masquer_pop_up_detail('potager',false);
    }

    fin_selectionne(){
        //alert('fin s')
        $('.info_quantite').remove();
        $('.marqueur_compatibilite').remove();
        super.fin_selectionne();
        this.pop_up();

        //console.log('end fin selectionne')
    }

    

    selectionne(event){
        //console.log('start selectionne')
        super.selectionne(event);

        if(selection_multiple == false || get_potager_byId(this.id_father).get_objs_selected().length==1){
            var qte_constate=$('[id_bdd=' + this.id_bdd + ']').length
            $('.info_quantite').remove();
            this.info_quantite=$('<div/>', {
                "class": 'info_quantite',
            }).appendTo($('#id_plan_potager'));
            this.info_quantite.text('Quantité déjà positionnée (sur TOUS les potagers) : ' + qte_constate ); //+ '/' + this.qte_max
        }


        this.fin_hoover()
        this.masquer_pop_up_detail('potager',true);
        //console.log('etape 0')
        //lorsqu'on selectionne (pour bouger par exemple) une semence
        //on fait briller les semences a eviter ou a associer 
        if(this.match_bdd != null){
            this.match_bdd.associations.forEach((esp) => {
                var objs=get_objets_byReff_bdd(esp)
                objs.forEach( (un_obj) => {
                    un_obj.set_marqueur_compatibilite('association')
                })
            })
            this.match_bdd.incompatibilites.forEach((esp) => {
                var objs=get_objets_byReff_bdd(esp)
                objs.forEach( (un_obj) => {
                    un_obj.set_marqueur_compatibilite('incompatibilite')
                })
            })

            this.associations_ind.forEach((esp) => {
                var objs=get_objets_byReff_bdd(esp.espece)
                objs.forEach( (un_obj) => {
                    un_obj.set_marqueur_compatibilite('association_ind')
                })
            })

            this.incompatibilites_ind.forEach((esp) => {
                var objs=get_objets_byReff_bdd(esp.espece)
                objs.forEach( (un_obj) => {
                    un_obj.set_marqueur_compatibilite('incompatibilite_ind')
                })
            })
        }
    }

    



    remove_marqueur_compatibilite(){
        this.objet_cree.find('.marqueur_compatibilite').remove();
    }

    set_marqueur_compatibilite(type){ //association ou incompatibilite
        this.remove_marqueur_compatibilite();
        var marqueur_c=$('<div/>', {
            "class": 'marqueur_compatibilite marqueur_compatibilite_' + type,
        }).prependTo(this.objet_cree);
    }

    charger_more_info_from_serveur(mode='potager'){

        var that=this
        $.ajax({
            type: 'POST',
            url: base_url + '/plugins/potager/core/ajax/potager.ajax.php',
            data: {
                action: 'get_info_semence',
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
                data=data.result
                if(data == "null"){
                    that.supprimer();
                    return
                }
                if(data == "hide"){
                    that.objet_cree_f.remove();
                    return
                }


                that.cycle_vie=data.cycle_vie;
                that.nature_sol=data.nature_sol;
                that.climat=data.climat;
                that.croissance=data.croissance;
                that.v_coureuse=data.v_coureuse;
                that.v_precoce=data.v_precoce;
                that.v_precoce=data.v_precoce;
                that.palissage=data.palissage;
                that.scarification=data.scarification;
                that.latin=data.latin;
                that.pincer=data.pincer;
                that.buter=data.buter;

                that.t_min_supporte=data.t_min_supporte;
                that.t_rusticite=data.t_rusticite;


                that.rusticite=data.rusticite;
                that.feuillage=data.feuillage;
                that.grimpant=data.grimpant;
                that.liste_semis=data.liste_semis;

                that.lieu_culture=data.lieu_culture;
                that.arrosage=data.arrosage;
                that.ensoleillement=data.ensoleillement;
                that.distance_plantation=data.distance_plantation;
                that.origine=data.origine;
                that.nom_origine=data.nom_origine;

                

                that.culture=data.culture;
                that.couleur=data.couleur;
                that.variete=data.variete;
                that.nom = data.nom;
                that.img = data.img;
                that.semis = data.semis;
                that.semis_terre = data.semis_terre;
                that.recolte = data.recolte;
                that.qte_max=data.quantite;
                that.type_semence=data.type_semence;
                that.ia=data.ia;
                that.rechercher_espece_bdd(mode);
    
                if(mode=='planning'){
                    that.afficher_pop_up_detail(mode);
                }else{
                    that.afficher();
                }
                
            }
            });
    }
    

    afficher(){
        
        super.afficher();
        
        this.objet_cree_f.css('z-index','5');
        this.un_objet_true.addClass('semence_img');
        
        

        var img_semence=$('<div/>', {
            "class": 'semence_img2',
        }).appendTo(this.objet_cree);
        if(this.img != null){
            img_semence.css('background-image','url("/' + this.img + '")')
        }

        var nom_semence=$('<div/>', {
            "class": 'nom_semence',
        }).appendTo(this.objet_cree);
        nom_semence.text(this.nom);
        if(mode_nom_semence_more_info){
            nom_semence.addClass('nom_semence_more_info')
        }

        var variete_semence=$('<div/>', {
            "class": 'variete_semence',
        }).appendTo(this.objet_cree);
        variete_semence.text(this.variete);
        
        img_semence.css('background-repeat','no-repeat')
        img_semence.css('background-size','contain')

        if(this.match_bdd != null){
            if(this.match_bdd.img != null && this.match_bdd.img != ''){
                var url=this.match_bdd.img
                img_semence.css('background-image','url("' + base_url + '/plugins/potager/data/img/semences/' + url + '")')
            }
            
        }
    
        var that=this
        //this.pop_up();
    }


    rechercher_espece_bdd (mode='potager',type_semence=''){ //type : fleur/fruit ....
        //on recherche dans la bdd
        var resultats_match=[];
        this.match_bdd=null;

        
        // if(no_ia.indexOf(this.type_semence)!= -1 || no_ia.indexOf(type_semence)!= -1){
        //     //console.log(this.nom + ' - ' + no_ia.indexOf(this.type_semence))
        //     return false;
        // }

        if(this.ia == '1'){ //demande explicite IA off !
            return false;
        }
        
        especes_bdd.forEach((une_espece) => {
            if(this.nom == null){
                return false;
            }

            //pour la recherche du match, on regarde d'abord le mot entier, puis sinon on découpe
            
            if(this.match_bdd == null){
                //console.log('   > nom total : ' + this.nom + ' - ' + une_espece.espece)
                var check=recherche_similitude(this.nom,une_espece.espece)
                if(check.etat != -1){
                    check.data=une_espece
                    resultats_match.push(check)
                    //console.log('      >  : OK !' + check.etat + '-' +  check.length+ '-' +  check.score)
                }

                une_espece.synonymes.forEach((synonyme) => {
                //  console.log('   >  synonyme : ' + part_nom + ' - ' + synonyme)
                    var check=recherche_similitude(this.nom,synonyme)
                    if(check.etat != -1){
                        check.data=une_espece
                        resultats_match.push(check)
                    //  console.log('      >  : OK !' + check.etat +  '-' +  check.length+ '-' +  check.score)
                    }
                })
            }

            this.nom.trim().split(' ').forEach((part_nom)=>{
                   // console.log('   >  part nom : ' + part_nom + ' - ' + une_espece.espece)
                    var check=recherche_similitude(part_nom,une_espece.espece)
                    if(check.etat != -1){
                        check.data=une_espece
                        resultats_match.push(check)
                       // console.log('      >  : OK ! ' + check.etat +  '-' +  check.length+ '-' +  check.score)
                    }

                    une_espece.synonymes.forEach((synonyme) => {
                      //  console.log('   >  synonyme : ' + part_nom + ' - ' + synonyme)
                        var check=recherche_similitude(part_nom,synonyme)
                        if(check.etat != -1){
                            check.data=une_espece
                            resultats_match.push(check)
                          //  console.log('      >  : OK !' + check.etat +  '-' +  check.length+ '-' +  check.score)
                        }
                    })
            })
            

        })


        //console.log('------recherche du meilleur score-----------')
        var best_resultat=null;
        resultats_match.forEach((un_resultat)=> {
            
            if(best_resultat == null){
                best_resultat=un_resultat
            }else{
                //console.log(un_resultat.score +  '  vs  ' + best_resultat.score)
                if(un_resultat.score > best_resultat.score ){
                    best_resultat=un_resultat
                }
            }
        })
        if(best_resultat != null){
            //console.log('match ok')
            this.match_bdd = best_resultat.data
        }

        if(this.match_bdd != null){
            this.associations_ind=[]
            this.incompatibilites_ind=[]
            //si on a trouvé le match , alors on va chercher les associations_ind
            especes_bdd.forEach((une_espece) => {
                if(une_espece.associations.includes(this.match_bdd.espece)){
                    this.associations_ind.push(une_espece)
                }
                if(une_espece.incompatibilites.includes(this.match_bdd.espece)){
                    this.incompatibilites_ind.push(une_espece)
                }
            })

            if(mode=='potager'){
                this.afficher();
            }
            return true;
        }
        return false;
    }

    menu_clic_droit(x,y,event){
        var that=this;
        super.menu_clic_droit(x,y,event);
        this.fin_hoover();

        var item_ss=$('<div/>', {
            "class": 'menu_obj_item',
        }).appendTo(menu_obj);
            var icon_item=$('<img/>', {
                "class": 'menu_obj_item_icon',
            }).appendTo(item_ss);
            icon_item.attr('src',base_url + '/plugins/potager/data/img/sel_identique.png')

            var text_item=$('<div/>', {
                "class": 'menu_obj_item_text',
            }).appendTo(item_ss);

        text_item.text('Sélectionner les semences identiques')
        item_ss.on('click',function(){
            get_potager_byId(that.id_father).select_all_semence_id(that.id_bdd);
        });

        if(selection_multiple==false || get_potager_byId(that.id_father).get_objs_selected().length == 1){
            var item_ss=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item_ss);
                icon_item.attr('src',base_url +  '/plugins/potager/data/img/semence.png')
    
                var text_item=$('<div/>', {
                    "class": 'menu_obj_item_text',
                }).appendTo(item_ss);
    
            text_item.text('Ouvrir la fiche de la semence')
            item_ss.on('click',function(){
                $('.marqueur_compatibilite').remove();
                window.open(base_url + '/index.php?v=d&m=potager&p=potager&id=' + that.id_bdd,'_blank');
            });




            var item_ss=$('<div/>', {
                "class": 'menu_obj_item',
            }).appendTo(menu_obj);
                var icon_item=$('<img/>', {
                    "class": 'menu_obj_item_icon',
                }).appendTo(item_ss);
                icon_item.attr('src',base_url + '/plugins/potager/data/img/paille2.png')
    
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
        
    }

}
