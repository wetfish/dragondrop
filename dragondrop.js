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

    // Helper function to get event position
    Dragon.prototype.position = function(event)
    {
        var output = {};

        // If this is a touch event
        if(event.type.indexOf('touch') > -1)
        {
            var touch = event.touches[0] || event.changedTouches[0];

            output.x = touch.clientX;
            output.y = touch.clientY;
        }
        
        // Mouse events are a bit simpler
        else
        {
            output.x = event.clientX;
            output.y = event.clientY;
        }

        return output;
    }

    // Bind mouse events
    Dragon.prototype.bind = function()
    {
        // Preserve scope inside event handlers
        var drag = this;

        $(drag.element).on('mousedown touchstart', function(event)
        {
            event.preventDefault();

            $(drag.element).addClass('dragging');
            drag.active = true;

            // Find the current position
            var position = drag.position(event);

            // Save it
            drag.lastX = position.x;
            drag.lastY = position.y;
            
            $(drag.element).trigger('dragstart');
        });

        $('html').on('mousemove touchmove', function(event)
        {
            if(drag.active)
            {
                event.preventDefault();

                // Find the current position
                var position = drag.position(event);

                // Find distance we've moved
                var delta =
                {
                    x: position.x - drag.lastX,
                    y: position.y - drag.lastY
                };

                // Update the saved element position
                if(drag.options.axis == 'x' || drag.options.axis === undefined)
                {
                    drag.pos.x += delta.x;
                }

                if(drag.options.axis == 'y' || drag.options.axis === undefined)
                {
                    drag.pos.y += delta.y;
                }
                
                // If we're doing percent based positioning
                if(drag.options.position == '%')
                {
                    // This is probably inaccurate in a bunch of cases?
                    var parent = $(window).size();
                    var child = $(drag.element).size();

                    // Because CSS translations in percent are based on the element's size...
                    // We have to multiply the distance we move by the ratio of the size of the parent to the child
                    var ratio =
                    {
                        x: parent.width.inner / child.width.outer,
                        y: parent.height.inner / child.height.outer
                    }

                    var percent =
                    {
                        x: (drag.pos.x / parent.width.inner) * 100 * ratio.x,
                        y: (drag.pos.y / parent.height.inner) * 100 * ratio.y
                    }

                    $(drag.element).transform('translate', percent.x+'%', percent.y+'%');
                }
                // Otherwise, default to pixel based positioning
                else
                {
                    $(drag.element).transform('translate', drag.pos.x+'px', drag.pos.y+'px');
                }

                // Save the current position
                drag.lastX = position.x;
                drag.lastY = position.y;

                $(drag.element).trigger('dragmove');
            }
        });

        $('html').on('mouseup touchend touchcancel', function()
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
