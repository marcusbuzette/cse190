!function(t){Drupal.behaviors.panopolyImagesModule={attach:function(e,i){var a=t(".caption",e).has("img");function n(e){for(var i=["margin-left","border-left","padding-left","padding-right","border-right","margin-right"],a=0,n=0,o="",r=0;r<i.length;r++)(o=t(e).css(i[r]))&&"px"==o.substr(o.length-2)&&(n=parseInt(o,10),a+=t.isNumeric(n)?n:0);return a}t(a).once("panopoly-images").imagesLoaded(function(){a.each(function(){var e=t("img",this),i=function(e){for(var i,a=0,o=0,r=0,l=0;l<e.length;l++)i=t(e[l]).attr("width"),(r=void 0!==i?parseInt(i,10):e[l].naturalWidth)>a&&(a=r,o=n(e[l]));return a+o}(e),a=n(t(".caption-inner",this))+n(t(".caption-width-container",this)),o=i+a;t(this).width(o)})})}}}(jQuery),function(t){Drupal.behaviors.panopolyAdmin={attach:function(e,i){var a=t("#node-edit #edit-title").width()-t("#node-edit .form-item-path-alias label").width()-t("#node-edit .form-item-path-alias .field-prefix").width()-10;t("#node-edit .form-item-path-alias input").css("width",a),t("#node-edit .panopoly-admin-hide-body-label .form-item-body-und-0-value label",e).once("panopoly-admin-hide-body-label").wrapInner('<span class="element-invisible"></span>').css("text-align","right"),t("#node-edit .form-item-field-featured-image-und-0-alt label")&&t("#node-edit .form-item-field-featured-image-und-0-alt label").html("Alt Text")}},Drupal.behaviors.panopolyAutoUpload={attach:function(e,i){t("#node-edit input#edit-field-featured-image-und-0-upload").next('input[type="submit"]').hide(),t("form",e).delegate("#node-edit input#edit-field-featured-image-und-0-upload","change",function(){t(this).next('input[type="submit"]').mousedown()})}},Drupal.behaviors.panopolyLinkAutomaticTitle={attach:function(e){t(".pane-node-form-menu",e).each(function(){var i=t(".form-item-menu-enabled input",this),a=t(".form-item-menu-link-title input",e),n=t(this).closest("form").find(".form-item-title input");i.length&&a.length&&n.length&&(i.is(":checked")&&a.val().length&&a.data("menuLinkAutomaticTitleOveridden",!0),a.keyup(function(){a.data("menuLinkAutomaticTitleOveridden",!0)}),i.change(function(){i.is(":checked")?a.data("menuLinkAutomaticTitleOveridden")||a.val(n.val()):(a.val(""),a.removeData("menuLinkAutomaticTitleOveridden")),i.closest("fieldset.vertical-tabs-pane").trigger("summaryUpdated"),i.trigger("formUpdated")}),n.keyup(function(){!a.data("menuLinkAutomaticTitleOveridden")&&i.is(":checked")&&(a.val(n.val()),a.val(n.val()).trigger("formUpdated"))}))})}}}(jQuery),function(t){Drupal.behaviors.panopolyMagic={attach:function(e,i){t.trim(t(".pane-node-title .pane-content").html())==t.trim(t("h1.title").html())&&(t(".pane-node-title .pane-content").html(""),t("h1.title").hide().clone().prependTo(".pane-node-title .pane-content"),t(".pane-node-title h1.title").show()),i.panopoly_magic&&"single"===i.panopoly_magic.pane_add_preview_mode&&i.panopoly_magic.pane_add_preview_subtype&&setTimeout(function(){var a="add-content-link-"+i.panopoly_magic.pane_add_preview_subtype.replace(/_/g,"-")+"-icon-text-button";t("#modal-content .panopoly-magic-preview-link .content-type-button a."+a,e).focus()},0)}}}(jQuery),function(t){var e,i=!1,a=!1;function n(e,i){var a,n=t(e),o=t("#panopoly-form-widget-preview");if(!o.hasClass("panopoly-magic-loading")){if(o.addClass("panopoly-magic-loading"),a=function(){document.contains(e)&&n.find(".ctools-auto-submit-click").click()},"number"==typeof i)return setTimeout(a,i);a()}}function o(e,i){t(e);t("#panopoly-form-widget-preview").removeClass("panopoly-magic-loading"),clearTimeout(i)}function r(i){return function(){var a=t("#"+i),r=a.get(0).form;a.hasClass("panopoly-textarea-autosubmit")&&(o(r,e),e=n(r,1e3))}}function l(t,e,i){var a=r(e.field);i.setup=function(t){t.onChange.add(a),t.onKeyUp.add(a)}}Drupal.behaviors.panopolyMagicAutosubmit={attach:function(r,s){t(".ctools-auto-submit-click",r).filter(function(){return 0!==t(this).closest("form").attr("id").indexOf("panels-edit-style-type-form")}).click(function(e){if(t(this).hasClass("ajax-processed"))return e.stopImmediatePropagation(),t(this).trigger("mousedown"),!1});var d,u,p,c,m,f,g,y,h=[16,17,18,20,33,34,35,36,37,38,39,40,9,13,27];if(t(".field-widget-link-field input:text",r).addClass("panopoly-textfield-autosubmit").addClass("ctools-auto-submit-exclude"),t(".panopoly-textfield-autosubmit, .panopoly-textarea-autosubmit",r).once("ctools-auto-submit").bind("keyup blur",function(i){t(".panopoly-magic-preview .pane-title",r),o(i.target.form,e),"blur"!==i.type&&t.inArray(i.keyCode,h)>0||(e=n(i.target.form,1e3))}),i||void 0===Drupal.wysiwyg||"function"!=typeof Drupal.wysiwyg.editor.attach.tinymce||"function"!=typeof Drupal.wysiwyg.editor.attach.markitup||(d=Drupal.wysiwyg.editor.attach,p=l,c=d[u="tinymce"],d[u]=function(){return p.apply(this,arguments),c.apply(this,arguments)},i=!0,t(".panopoly-textarea-autosubmit",r).once("panopoly-magic-wysiwyg").each(function(){var t=this.id,e=Drupal.wysiwyg.instances[t],i=e?e.format:null,a=e?e.trigger:null;e&&"none"!=e.editor&&(params=Drupal.settings.wysiwyg.triggers[a],params&&(Drupal.wysiwygDetach(r,params[i]),Drupal.wysiwygAttach(r,params[i])))})),t(".panopoly-autocomplete-autosubmit",r).once("ctools-auto-submit").bind("keyup blur",function(t){"blur"!==t.type&&13!==t.keyCode||n(t.target.form,0)}),t(":input.filter-list").addClass("ctools-auto-submit-exclude"),!a&&void 0!==Drupal.linkit){var v=Drupal.linkit.getDialogHelper("field");void 0!==v&&(g=function(t){n(document.getElementById(Drupal.settings.linkit.currentInstance.source).form)},y=(m=v)[f="insertLink"],m[f]=function(){var t=y.apply(this,arguments);return g.apply(this,arguments),t},a=!0)}}}}(jQuery),jQuery,Drupal.behaviors.PanelsAccordionStyle={attach:function(t,e){for(region_id in Drupal.settings.accordion){var i=Drupal.settings.accordion[region_id];jQuery("#"+region_id).hasClass("ui-accordion")?jQuery("#"+region_id).accordion("refresh"):jQuery("#"+region_id).accordion(i.options)}}},function(t){Drupal.behaviors.siteFarmAdminSidebarCollapse={attach:function(e,i){var a=function(){return JSON.parse(localStorage.getItem("Drupal.siteFarmAdminSidebarCollapse"))||{}};if(void 0!==i.siteFarm&&void 0!==i.siteFarm.adminSidebarCollapse){if(1==i.siteFarm.adminSidebarCollapse&&t(".radix-layouts-sidebar .panel-pane:not(.pane-node-form-buttons) .pane-content").hide(),1==i.siteFarm.adminSidebarMemory){var n=a();for(var o in n)t("."+o+" .pane-title").addClass("js-"+n[o]),t("."+o+" .pane-content").css("display",n[o])}t(".radix-layouts-sidebar .pane-title",e).once().click(function(){var e=t(this),n="block";$content=e.next(".pane-content"),parentClasses=e.parent().attr("class").split(/\s+/),e.toggleClass("js-block js-hidden"),$content.slideToggle("fast",function(){1==i.siteFarm.adminSidebarMemory&&(n=$content.css("display"),function(t,e){for(var i=0;i<t.length;i++)if(-1!==t[i].indexOf("pane-node-")){var n=a();n[t[i]]=e,localStorage.setItem("Drupal.siteFarmAdminSidebarCollapse",JSON.stringify(n))}}(parentClasses,n))})})}}}}(jQuery),function(t){"use strict";Drupal.behaviors.sitefarmWysiwygResponsiveIframes={attach:function(e){t(".responsive-iframe",e).once().each(function(){var e=t(this),i=e.data("responsive-iframe");e.css("padding-bottom",i)})}}}(jQuery);