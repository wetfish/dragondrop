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
        $(this.element).addClass('dragon');
        $(this.element).style({position: 'absolute'});

        // Save the current element position
        this.pos =
        {
            x: this.element.offsetLeft,
            y: this.element.offsetTop
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

            // Prevent dropping onto other dragons
            $('.dragon').style({'pointer-events': 'none'});

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

                if(drag.options.grid)
                {
                    // Only update the position if we've moved more than the grid
                    if(Math.abs(delta.x) < drag.options.grid && Math.abs(delta.y) < drag.options.grid)
                    {
                        return;
                    }

                    // If we've moved more than the grid, make sure we move along it
                    delta.x -= (delta.x % drag.options.grid);
                    delta.y -= (delta.y % drag.options.grid);
                }

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

        $('html').on('mouseup touchend touchcancel', function(event)
        {
            if(drag.active)
            {
                // Touch events always return the original target, so we have to calculate where you moved to
                if(event.type.indexOf('touch') > -1)
                {
                    // Find the current position
                    var position = drag.position(event);
                    var target = document.elementFromPoint(position.x, position.y);
                }
                else
                {
                    var target = event.target;
                }
                
                // If we dropped into a droppable element
                if($(target).hasClass('droppable'))
                {
                    // And the target is somewhere new
                    if(drag.element.parentNode != target)
                    {
                        var newSize = $(target).size();
                        var oldSize = $(drag.element.parentNode).size();

                        // If the new location is smaller than the previous
                        if(newSize.width.inner <= oldSize.width.inner && newSize.height.inner <= oldSize.height.inner)
                        {
                            // Reset its position
                            drag.pos.x = 0;
                            drag.pos.y = 0;

                            $(drag.element).transform('translate', drag.pos.x+'px', drag.pos.y+'px');
                        }

                        // Move the dragon into the droppable target
                        target.appendChild(drag.element); 
                    }
                }

                $(drag.element).removeClass('dragging');
                drag.active = false;

                $(drag.element).trigger('dragend');

                // Re-enable pointer-events
                $('.dragon').style({'pointer-events': 'auto'});
            }
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
