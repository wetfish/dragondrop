(function($)
{
    var Dragon = function(element, options)
    {
        this.element = element;
        this.options = options;
        this.active = false;

        this.init();
        this.bind();
    }

    // Initialize element before being dragged
    Dragon.prototype.init = function()
    {
        $(this.element).style({position: 'absolute'});

        // Save the current element position
        var bounds = this.element.getBoundingClientRect();
        this.pos =
        {
            x: bounds.left,
            y: bounds.top
        };

        // Remove the element's original position
        $(this.element).style({top: 0, left: 0});

        // Reposition the element using translate
        $(this.element).transform('translate', this.pos.x+'px', this.pos.y+'px');
    }

    // Bind mouse events
    Dragon.prototype.bind = function()
    {
        // Preserve scope inside event handlers
        var drag = this;

        $(drag.element).on('mousedown', function(event)
        {
            event.preventDefault();

            $(drag.element).addClass('dragging');
            drag.active = true;

            // Save current mouse position
            drag.lastX = event.clientX;
            drag.lastY = event.clientY;

            $(drag.element).trigger('dragstart');
        });

        $('html').on('mousemove', function(event)
        {
            if(drag.active)
            {
                event.preventDefault();

                // Find distance we've moved
                var delta =
                {
                    x: event.clientX - drag.lastX,
                    y: event.clientY - drag.lastY
                };

                // Update the saved element position
                drag.pos.x += delta.x;
                drag.pos.y += delta.y;

                // Move the element on the page
                $(drag.element).transform('translate', drag.pos.x+'px', drag.pos.y+'px');

                // Save current mouse position
                drag.lastX = event.clientX;
                drag.lastY = event.clientY;

                $(drag.element).trigger('dragmove');
            }
        });

        $('html').on('mouseup', function()
        {
            $(drag.element).removeClass('dragging');
            drag.active = false;

            $(drag.element).trigger('dragend');
        });
    }

    // Wetfish basic wrapper
    $.prototype.dragondrop = function(options)
    {
        if(typeof options != "object")
        {
            options = {};
        }
        
        this.forEach(this.elements, function(index, element)
        {
            new Dragon(element, options);
        });
    }
}(basic));
