// ==UserScript==
// @name         Happychat Transcript Copy Button
// @namespace    https://github.com/senff/Chat-transcript-copy-button
// @version      0.95
// @description  Adds a COPY button that copies the entire transcript to your clipboard, so you can email it to the customer
// @author       Senff
// @require      https://code.jquery.com/jquery-1.12.4.js
// @match        https://mc.a8c.com/support-stats/happychat/*
// @updateURL    https://github.com/senff/Chat-transcripts/raw/master/mc-chat-transcript-copy-button.user.js
// @grant        none
// ==/UserScript==

var $ = window.jQuery;

// === Creates new hidden block with the full transcript in it, cleaned and all  ===================================================
function createTranscript() {
    var userID = $('.visitor-info > span:nth-child(3)').text();
    $('body').append('<div id="full-transcript-text" class="full-transcript" style="display: none;"></div><div id="full-transcript-markup" class="full-transcript" style="display: block;"></div>');
    var allChat = $('.hapdash-chat-text').html();
    allChat = allChat.replace("Hello! Please select one of the options below", "Support topic");
    allChat = allChat.replace("I need help with", "Product");
    allChat = allChat.replace("Site Product", "Site");
    allChat = allChat.replace("_", "hcunderscore");
    allChat = allChat.replace(/<br>/gi, 'hclinebreak');
    $('.full-transcript').html(allChat);
    $('.full-transcript .type-event').parent().remove();
    $('#full-transcript-text .chat-timestamp').each(function(){
        var timeStamp = $(this).text();
        $(this).parent().parent().prepend(timeStamp + '):hclinebreak');
    });
    $('#full-transcript-markup .chat-timestamp').each(function(){
        var timeStamp = $(this).text();
        $(this).parent().parent().prepend(timeStamp + ')_:hclinebreak');
    });
    $('#full-transcript-text .hapdash-chat-bubble').each(function(){
        if($(this).hasClass('chat-MessageToVisitor')) {
            var chatPerson = "WordPress.com";
        } else {
            chatPerson = userID;
        }
        $(this).parent().prepend("=== "+chatPerson + ' === (');
    });
    $('#full-transcript-markup .hapdash-chat-bubble').each(function(){
        if($(this).hasClass('chat-MessageToVisitor')) {
            var chatPerson = "WordPress.com";
        } else {
            chatPerson = userID;
        }
        $(this).parent().prepend("**- "+chatPerson + '** _(');
    });
    $('.full-transcript .ssr-message').parent().parent().remove();
    $('.full-transcript .hapdash-chat-bubble br').after('<div>hclinebreak</div>');
    $('#full-transcript-text .hapdash-chat-bubble p').after('<div>hclinebreak</div>');
    $('#full-transcript-markup .hapdash-chat-bubble p').before('<div>hcmsgstart</div>').after('<div>hcmsgend</div>');
    $('.full-transcript .hapdash-chat-tags, .full-transcript a[href*="gravatar"], .full-transcript .hapdash-chat-meta').remove();
    $('.full-transcript .hapdash-chat-item').after('<div>hclinebreak</div>');
    $('.hapdash-card-header h3').after('COPY TRANSCRIPT TO CLIPBOARD: <a href="#" class="copy-transcript-text" style="display: inline-block;background:#14acdd;color:#ffffff;padding: 7px 15px;width: auto;border-radius: 5px;margin:0 10px; font-family: arial; text-decoration: none;text-shadow: -1px -1px 0 #0077bb; cursor: pointer;">PLAIN TEXT</a> <a href="#" class="copy-transcript-markup" style="display: inline-block;background:#14acdd;color:#ffffff;padding: 7px 15px;width: auto;border-radius: 5px;margin:0 10px; font-family: arial; text-decoration: none;text-shadow: -1px -1px 0 #0077bb; cursor: pointer;">MARKUP (FOR ZENDESK)</a>');

    // Remove all double spaces and make sure all line breaks are good
    var transcripttext = $('#full-transcript-text').text();
    transcripttext = transcripttext.replace('hcunderscore','_');
    transcripttext = transcripttext.replace(/\s+/g," ");
    transcripttext = transcripttext.replace(/hclinebreak/gi, '\n');
    $('#full-transcript-text').text(transcripttext);

    var transcriptmarkup = $('#full-transcript-markup').text();
    transcriptmarkup = transcriptmarkup.replace('hcunderscore','_');
    transcriptmarkup = transcriptmarkup.replace(/\s+/g," ");
    transcriptmarkup = transcriptmarkup.replace(/hclinebreak/gi, '\n');
    transcriptmarkup = transcriptmarkup.replace(/hcmsgstart/gi, '');
    transcriptmarkup = transcriptmarkup.replace(/hcmsgend/gi, ' \n');
    $('#full-transcript-markup').text('\n _[Start of chat]_ =================================================== \n\n' + transcriptmarkup + '_[End of chat]_ =================================================== \n');
}


// === Copy the SSR to the clipboard ===================================================
$("body").on('click','.copy-transcript-text', function () {
    copyToClipboard(document.getElementById('full-transcript-text'));
    $(this).html('COPIED!');
    setTimeout(function(){$('.copy-transcript-text').text('PLAIN TEXT')}, 3000);
});

$("body").on('click','.copy-transcript-markup', function () {
    copyToClipboard(document.getElementById('full-transcript-markup'));
    $(this).html('COPIED!');
    setTimeout(function(){$('.copy-transcript-markup').text('MARKUP (FOR ZENDESK)')}, 3000);
});


// === Helper function: copy to clipboard ===================================================
function copyToClipboard(elem) {
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        //target.textContent = "";
    }
    return succeed;
}


$(document).ready(function() {
   createTranscript();
});

