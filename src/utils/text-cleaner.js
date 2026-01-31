function cleanHtml(html){
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}