// You need to bring in jQuery first in order for this to work
//
// Call it like this:
// pkTagahead(<?php echo json_encode(url_for("taggableComplete/complete")) ?>);
//
// Or similar. Now all of your input elements with the input-tag class
// automatically gain the typeahead suggestion feature.
//
// If you're not using Symfony and sfDoctrineActAsTaggablePlugin, 
// pass your own URL that returns a <ul> containing <li>s with the
// FULL TEXT of what the ENTIRE tag string will be if the user takes
// that suggestion, with the new tag you're suggesting an <a> link
// to #. Then use CSS to hide (visibility: none) the part of the 
// <li> that is not in the <a>. Don't introduce any extra whitespace.

function pkTagahead(tagaheadUrl)
{
  $(function() {
    function getKey(event)
    {
      // Portable keycodes sigh
      return event.keyCode ? event.keyCode : event.which;
    }
    function setClick(target)
    {
      $(target).find('a').click(function(event)
      {
        // span contains ul contains li contains a
        var span = this.parentNode.parentNode.parentNode;
        var input = $(span).data("tag-peer");
        // Get text from the li
        var parent = this.parentNode;
        $(input).val($(parent).text());
        $(input).focus();
        return false;
      });
    }
    // Add suggestions span (you'll need to style that)
    $('input.tag-input').after("<div class='tag-suggestions'></div>");
    // Each tag field remembers its suggestions span...
    $('input.tag-input').each(function() 
    {
      $(this).data("tag-peer", $(this).next()[0]);
    });
    // And vice versa
    $('div.tag-suggestions').each(function() 
    {
      $(this).data("tag-peer", $(this).prev()[0]);
    });
    // Now we can really throw down
    $('input.tag-input').keyup(function(event) 
    {
      var key = getKey(event);
      // Tab key 
      if (key == 9)
      {
        var peer = $(this).data("tag-peer");
        var suggestions = $(peer).find("li"); 
        if (suggestions.length)
        {
          $(this).val($(suggestions[0]).text());
          $(this).focus();
        }
        // In any case don't insert the tab
        return false;
      }
      else
      {
        // Trigger ajax update of suggestions
      } 
    });
    $('input.tag-input').keypress(function(event) 
    {
      // Firefox 2.0 mac is stubborn and only allows cancel here
      // (we will still get the keyup and do the real work there)
      var key = getKey(event);
      if (key == 9)
      {
        // Don't insert tabs, ever
        return false;
      }
    });
    var lastValues = {};
    setInterval(function() 
    {
      // AJAX query for suggestions only when changes have taken place
      $('input.tag-input').each(function() 
      {
        var last = $(this).data('tag-last');  
        var value = $(this).val();
        var peer = $(this).data('tag-peer');
        if (last !== value)
        {
          $(this).data('tag-last', value);
          $.post(
            tagaheadUrl, 
            { 
              current: $(this).val() 
            },
            function(data, textStatus) 
            {
              $(peer).html(data);       
              setClick(peer);
            }
          );
        }
      });
    }, 200);
  });
}


function aInlineTaggableWidget(selector, options)
{
	var typeaheadUrl = options['typeahead-url'];
	
	
	function makeLink(attributes, title, text)
	{
		var new_link = $('<a />');
		new_link.attr(attributes);
		new_link.attr('title', title);
		new_link.text(text);
		
		return new_link;
	}
	
	function trimExcessCommas(string)
	{
		string = string.replace(/(^,)|(, ?$)/g, '');
		string = string.replace(/(,,)|(, ,)/, ',');
		string = $.trim(string);
		
		return string;
	}	

	$(selector).each(function()
	{	
		var popularTags = options['popular-tags'];
		var existingTags = options['existing-tags'];
		var popularsAttributes = {};
		var existingTagsAttributes = {};
		var existingDiv = $('<div />');
		var popularsDiv = $('<div />');

		// Establish the quick enhancement
		var tagInput = $(this);
		var typeAheadBox = $('<input />');
		typeAheadBox.attr('type', 'text');
		
		var addButton = $('<a />');
		addButton.text('Add');
		addButton.attr({'href' : '#', 'class' : 'add-tags-link', 'title' : 'Add these tags'});

		tagInput.hide();
		tagInput.parent().append(typeAheadBox);
		tagInput.parent().append(addButton);



		// Add a list of popular tags to be added
		function addTagsToForm(link)
		{
			tag = link.attr('title');
			
			var value = tagInput.val() + ', ' + tag;
			value = trimExcessCommas(value);
			tagInput.val(value);
			
			link.remove();

			var new_link = makeLink(existingTagsAttributes, tag, 'x ' + tag);
			new_link.bind('click', function() { removeTagsFromForm($(this)); return false; });
			existingDiv.append(new_link);
		}
		
		
		// Add a list of tags that may be removed
		function removeTagsFromForm(link)
		{
			tag = link.attr('title');
			var value = tagInput.val();
			
			value = value.replace(tag, '');
			value = trimExcessCommas(value);
			tagInput.val(value);
			
			link.remove();
		}


		// a maker function for tag containers
		function makeTagContainer(containerLabel, tagArray, linkAttributes, linkLabelType)
		{
			// Add a list of tags that may be removed
			var tagContainer = $('<div />');
			tagContainer.addClass('a-inline-taggable-widget-tag-container');
			var header = $('<h1 />');
			header.text(containerLabel);
			tagContainer.append(header);
		
			var attributes = {};
			for (x in tagArray)
			{
				var linkLabel = '';
				if (linkLabelType == 'add')
				{
					linkLabel = x + ' - ' + tagArray[x];
				}
				else if (linkLabelType == 'remove')
				{
					linkLabel = 'x ' + x;
				}
				
				var new_link = makeLink(linkAttributes, x, linkLabel);
				
				if (linkLabelType == 'add')
				{
					new_link.bind('click', function() { addTagsToForm($(this));  return false; });
				}
				else if (linkLabelType == 'remove')
				{
					new_link.bind('click', function() { removeTagsFromForm($(this));  return false; });
				}
				
				tagContainer.append(new_link);
			}
			return tagContainer;
		}

		// Add the new tags to the existing form input.
		// If the user doesn't click Save changes or add... tough?
		function commitTagsToForm()
		{
			var value = tagInput.val() + ',' + typeAheadBox.val();
			value = trimExcessCommas(value);
			tagInput.val(value);
			typeAheadBox.val('');
			
			return false;
		}
		addButton.bind('click', function() { commitTagsToForm(); return false; });
	

		existingDiv = makeTagContainer('Existing Tags', existingTags, existingTagsAttributes, 'remove');
		tagInput.parent().append(existingDiv);
		
		popularsDiv = makeTagContainer('Popular Tags', popularTags, popularsAttributes, 'add');
		tagInput.parent().append(popularsDiv);


		// TypeAhead
		typeAheadBox.autocomplete(typeaheadUrl,
			{
				multiple: true
			});
	});	
	
}
