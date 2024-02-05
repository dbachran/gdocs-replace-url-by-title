function replaceURLByTitle() {
  var linkRegex = "https?:\/\/[^\\s]*"

  //Open active doc
  var document = DocumentApp.getActiveDocument()
  var body = document.getBody()
  Logger.log("Parsing document " + document.getName())
  //Find URLs
  var link = body.findText(linkRegex)

  //Loop through the body finding texts matching the search pattern
  while (link != null) {
    // Get the link as an object
    var linkElement = link.getElement().asText()

    // var fixmeLinkPartial = link.isPartial()
    // var fixmeLinkStart = link.getStartOffset()
    // var fixmeLinkEnd = link.getEndOffsetInclusive()

    if (link.isPartial()) {
      var linkText = linkElement.getLinkUrl(link.getStartOffset())
    } else {
      var linkText = linkElement.getText()
    }

    // Store original element attributes in order to restore them at the end
    var originalAttributes = linkElement.getAttributes()

    // Fetch the link title
    var response = UrlFetchApp.fetch(linkText)
    var title = null
    if (response.getResponseCode() == 200) {
      var htmlData = response.getContentText()

      var titleStart = htmlData.indexOf("<title>") + 7
      var titleEnd = htmlData.indexOf("</title>")
      title = htmlData.slice(titleStart, titleEnd)
      Logger.log("URL Title: " + title);
    } else {
      Logger.log("ERROR: Fetching " + linkText + " returned: " + response.getResponseCode())
    }

    // Only replace URL with title, if we actually found a title
    if (title) {
      // Get the start and end of URL
      var start = link.getStartOffset()
      var end = link.getEndOffsetInclusive()

      // Do not replaceText, since we do not want to fiddle with yet another regex
      // Instead, simply delete the URL and insert the title
      linkElement.deleteText(start, end)
      linkElement.insertText(start, title)

      // var fixmeText = linkElement.getText()
      // var fixmeTextLength = fixmeText.length
      // var fixmeTitleLength = title.length
      // var fixmeAtts2 = linkElement.getAttributes()

      // restore original element attributes (e.g. if whole element text has been removed
      // and new text gets attributes of previous element by default)
      linkElement.setAttributes(originalAttributes)

      // insert a link to the linkText for the inserted title
      // (needs to be inserted after original element attributes have been restored,
      // which may not include a link if the link did not cover the whole element)
      linkElement.setLinkUrl(start, start + title.length - 1, linkText)

      // var fixmeAtts3Final = linkElement.getAttributes()
    } else {
      Logger.log("No title found for " + linkText + ", skipped")
    }

    // Find next link
    link = body.findText(linkRegex, link);
  }
}
