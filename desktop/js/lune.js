function recherche_element(texte,str_d,str_e){
    var is=texte.indexOf(str_d);
    if(is != -1){
        var ie=texte.indexOf(str_e,is);
        if(ie != -1){
            return texte.substring(is + str_d.length,ie);
        }
    }
    return 'not found';
}


function get_phase_lune(){
    $('#lune_frixo').remove();
    



    $.ajax({
        type: 'POST',
        url: base_url + '/plugins/potager/core/ajax/potager.ajax.php',
        data: {
            action: 'get_phase_lune',
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
            
            var phase_lune=data.etat;
            var phase_lune2=data.phase;
            //var trajectoire="???";
            // var noeud=recherche_element(data,"Prochain noeud lunaire : </strong>","<img")
            // var apogee=recherche_element(data,"Prochain apogée lunaire : </strong>","<img")
            var imgL=data.imgL;
            

            var lune_frixo=$('<div/>', {
            "id": "lune_frixo",
            }).appendTo($('#menu_top_potager'));

            var img=$('<img/>', {
            "class": "img_lune",
            }).appendTo(lune_frixo);
            img.attr('src',base_url + '/plugins/potager/data/img/lune/' + imgL)

            var row_lune=$('<div/>', {
                "class": "info_lune_row",
                }).appendTo(lune_frixo);

            var d_phase_lune=$('<div/>', {
            "class": "info_lune",
            }).appendTo(row_lune);
            d_phase_lune.html('<b>Etat : </b>' + phase_lune)

            var d_phase_lune=$('<div/>', {
            "class": "info_lune",
            }).appendTo(row_lune);
            d_phase_lune.html('<b>Phase : </b>' + phase_lune2)

            // var d_phase_lune=$('<div/>', {
            // "class": "info_lune",
            // }).appendTo(row_lune);
            // d_phase_lune.html('<b>Trajectoire : </b>' + trajectoire)

            // var d_phase_lune=$('<div/>', {
            // "class": "info_lune",
            // }).appendTo(row_lune);
            // d_phase_lune.html('<b>Prochain noeud lunaire : </b>' + noeud)

            // var d_phase_lune=$('<div/>', {
            // "class": "info_lune",
            // }).appendTo(row_lune);
            // d_phase_lune.html('<b>Prochain apogée lunaire : </b>' + apogee)


            
            
        }
    })
}
get_phase_lune();