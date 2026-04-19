function jardinEscapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function jardinPlanElementStyle(type, hasImage = false) {
    if (hasImage) {
        return 'border:1px solid #426b2a;';
    }
    if (type === 'semence') {
        return 'background:rgba(88, 145, 58, 0.75);border:1px solid #426b2a;color:#fff;';
    }
    if (type === 'equipement') {
        return 'background:rgba(66, 139, 202, 0.75);border:1px solid #245580;color:#fff;';
    }
    if (type === 'cmd_action_info') {
        return 'background:rgba(240, 173, 78, 0.8);border:1px solid #c77c11;color:#fff;';
    }
    return 'background:rgba(120, 120, 120, 0.75);border:1px solid #555;color:#fff;';
}

function jardinFindPlanLabel(element, plantes) {
    if (element.type === 'semence') {
        const plante = (plantes || []).find(function(item) {
            return String(item.id) === String(element.id_bdd);
        });
        if (plante && plante.nom) {
            return plante.nom;
        }
    }
    if (element.type === 'equipement') {
        return 'Equipement';
    }
    if (element.type === 'cmd_action_info') {
        return 'Commande';
    }
    return element.type || 'Element';
}

function jardinFindPlanImage(element, plantes) {
    if (element.type === 'semence') {
        const plante = (plantes || []).find(function(item) {
            return String(item.id) === String(element.id_bdd);
        });
        if (plante && plante.image) {
            let image = plante.image;
            if (image && image.match(/^(https?:)?\/\//)) {
                return image;
            }
            if (image && image.indexOf('/') === -1) {
                return base_url + '/plugins/jardin/data/img/semences/' + image;
            }
            if (image && image.indexOf('plugins/jardin/data/img/semences/') === -1 && image.indexOf('/plugins/jardin/data/img/semences/') === -1 && image.indexOf('plugins/jardin/data/img/') !== -1) {
                return image;
            }
            if (image && image.indexOf('/plugins/jardin/data/img/semences/') !== -1) {
                return image;
            }
            if (image) {
                return base_url + '/' + image.replace(/^\//, '');
            }
        }
    }
    if (element.type === 'equipement') {
        return base_url + '/plugins/jardin/data/img/equipement.png';
    }
    if (element.type === 'cmd_action_info') {
        return base_url + '/plugins/jardin/data/img/cmd.png';
    }
    return null;
}

function jardinRenderPlan(plan, plantes) {
    const planWidth = parseInt(plan.width || 0, 10) || 300;
    const planHeight = parseInt(plan.height || 0, 10) || 300;
    const scale = Math.min(1, 850 / Math.max(planWidth, 1));
    const renderWidth = Math.max(220, Math.round(planWidth * scale));
    const renderHeight = Math.max(180, Math.round(planHeight * scale));
    let html = '';
    
    let bkClass = '';

    html += '<div class="jardin-plan-preview-wrap">';
    html += '<div class="un_plan_potager un_plan_potager_bk_herbe" style="width:' + renderWidth + 'px;height:' + renderHeight + 'px;">';
    

    (plan.elements || []).forEach(function(rawElement) {
        const parts = String(rawElement || '').split('|');
        const element = {
            type: parts[0] || 'objet',
            l: parseFloat(parts[1] || 0),
            t: parseFloat(parts[2] || 0),
            w: parseFloat(parts[3] || 30),
            h: parseFloat(parts[4] || 30),
            id_spec: parts[5] || '',
            id_bdd: parts[6] || '',
            angle: parseFloat(parts[7] || 0)
        };

        const label = jardinFindPlanLabel(element, plantes);
        const image = jardinFindPlanImage(element, plantes);
        const left = Math.round(element.l * scale);
        const top = Math.round(element.t * scale);
        const width = Math.max(18, Math.round(element.w * scale));
        const height = Math.max(18, Math.round(element.h * scale));
        const typeClass = element.type ? ' ' + element.type + '_img' : '';
        const style = 'left:' + left + 'px;top:' + top + 'px;width:' + width + 'px;height:' + height + 'px;transform:rotate(' + element.angle + 'deg);transform-origin:center center;' + jardinPlanElementStyle(element.type, !!image) + (image ? '' : 'background-size:cover;background-position:center center;background-repeat:no-repeat;');
        html += '<div class="un_objet_father">';
        html += '<div class="un_objet" title="' + jardinEscapeHtml(label) +'" style="' + style + '" >';
        html += '<div class="un_objet_true ' + (image ? '' : typeClass) + '">';
        if (image) {
            html += '<img src="' + jardinEscapeHtml(image) + '" style="width:100%;height:100%;object-fit:cover;" alt="' + jardinEscapeHtml(label) + '" />';
        } 
        html += '</div></div></div>';
    });

    html += '</div>';
    html += '</div>';
    return html;
}

function jardinFormatDateFR(dateStr) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    if (isNaN(d)) return dateStr; // fallback si déjà formatée

    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function jardinRenderSemisDetails(plante) {
    const semis = plante.liste_semis || [];
    if (semis.length === 0) {
        return '<div class="alert alert-warning" style="margin:10px 0 0 0;">Aucun semis archivé pour cette plante.</div>';
    }
    console.log('Semis à afficher :', semis);
    let html = '<table class="table table-condensed" style="margin:10px 0 0 0;">';
    html += '<tr><th>Nom</th><th>Semis</th><th>QTE</th><th>Germination</th><th>QTE</th><th>Plantation</th><th>QTE</th><th>Eclaircissage</th><th>QTE</th><th>Rempotage</th><th>QTE</th><th>Récolte</th><th>Poids</th><th>Commentaire</th></tr>';
    semis.forEach(function(unSemis) {
        html += '<tr>';
        html += '<td>' + jardinEscapeHtml(unSemis.nom || '') + '</td>';
        html += '<td>' + jardinFormatDateFR(unSemis.d_semis || '') + '</td>';
        html += '<td style="text-align:center;">' + jardinEscapeHtml(unSemis.qte_seme || '') + '</td>';
        html += '<td>' + jardinFormatDateFR(unSemis.d_germination || '') + '</td>';
        html += '<td style="text-align:center;">' + jardinEscapeHtml(unSemis.qte_germe || '') + '</td>';
        html += '<td>' + jardinFormatDateFR(unSemis.d_plantation || '') + '</td>';
        html += '<td style="text-align:center;">' + jardinEscapeHtml(unSemis.qte_plante || '') + '</td>';
        html += '<td>' + jardinFormatDateFR(unSemis.d_eclaircissage || '') + '</td>';
        html += '<td style="text-align:center;">' + jardinEscapeHtml(unSemis.qte_eclairci || '') + '</td>';
        html += '<td>' + jardinFormatDateFR(unSemis.d_rempotage || '') + '</td>';
        html += '<td style="text-align:center;">' + jardinEscapeHtml(unSemis.qte_rempote || '') + '</td>';
        html += '<td>' + jardinFormatDateFR(unSemis.d_recolte || '') + '</td>';
        html += '<td style="text-align:center;">' + jardinEscapeHtml(unSemis.poid_recolte || '') + '</td>';
        html += '<td>' + jardinEscapeHtml(unSemis.commentaire || '') + '</td>';
        html += '</tr>';
    });
    html += '</table>';
    return html;
}
