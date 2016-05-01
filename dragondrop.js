// Check how the plugin should be exported
(function(factory)
{
    if(typeof module === 'object' && module.exports)
    {
        // We're in Node or a CommonJS compatable environment
        factory(require('wetfish-basic'));
    }
    else if(typeof define === 'function' && define.amd)
    {
        // We're in a browser being loaded with AMD (Require.js)
        define(['wetfish-basic'], factory);
    }
    else
    {
        // We're in a browser, so assume everything has been loaded as global variables
        factory(basic);
    }
}
(function($)
{
    var Dragon = function(element, options)
    {
        this.element = element;
        this.options = options;
        this.active = false;

        // Allow dragging on a specific child selector
        if(this.options.handle)
        {
            this.handle = $(this.element).find(this.options.handle).el[0];
        }
        else
        {
            this.handle = this.element;
        }

        this.init();
        this.bind();
    }

    // Initialize element before being dragged
    Dragon.prototype.init = function()
    {
        $(this.element).addClass('dragon');

        // Create position object
        this.pos = {x: 0, y: 0};

        // If we're using absolute positioning
        if(this.options.position == 'absolute')
        {
            // Save the current element position
            this.pos.x = this.element.offsetLeft;
            this.pos.y = this.element.offsetTop;

            $(this.element).style({position: 'absolute'});

            // Remove the element's original position
            $(this.element).style({top: 0, left: 0});
        
            // Update the element's position
            this.update();
        }
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

    // Helper function to update the dragon's position
    Dragon.prototype.update = function()
    {
        // If we're doing percent based positioning
        if(this.options.units == '%')
        {
            // This is probably inaccurate in a bunch of cases?
            var parent = $(window).size('both');
            var child = $(this.element).size('both');

            // Because CSS translations in percent are based on the element's size...
            // We have to multiply the distance we move by the ratio of the size of the parent to the child
            var ratio =
            {
                x: parent.width.inner / child.width.outer,
                y: parent.height.inner / child.height.outer
            }

            var percent =
            {
                x: (this.pos.x / parent.width.inner) * 100 * ratio.x,
                y: (this.pos.y / parent.height.inner) * 100 * ratio.y
            }

            $(this.element).transform('translate', percent.x+'%', percent.y+'%');
        }
        // Otherwise, default to unit based positioning
        else
        {
            $(this.element).transform('translate', parseInt(this.pos.x)+this.options.units, parseInt(this.pos.y)+this.options.units);
        }
    }

    // Bind mouse events
    Dragon.prototype.bind = function()
    {
        // Preserve scope inside event handlers
        var drag = this;

        $(drag.element).on('mousedown touchstart', function(event)
        {
            // If event.buttons is defined (user has a mouse)
            // And they're not right clicking
            if(event.buttons && event.buttons != 1)
            {
                // Don't do anything
                return;
            }

            // Ignore events on specific elements
            if(drag.options.ignore.indexOf(event.target.tagName.toLowerCase()) > -1)
                return;

            // If a handle is being used, ignore all events except on that handle
            if(drag.options.handle)
            {
                if(event.target != drag.handle)
                    return;
            }

            event.preventDefault();

            // Prevent dropping onto other dragons
            if(drag.options.position == 'absolute')
            {
                $('.dragon').style({'pointer-events': 'none'});
            }
            else
            {
                $(drag.element).style({'pointer-events': 'none'});
            }
            
            $(drag.element).addClass('dragging');
            drag.active = true;

            // Find the current position
            var position = drag.position(event);

            // Save it
            drag.lastX = position.x;
            drag.lastY = position.y;

            $(drag.element).trigger('dragstart', {pos: drag.pos});
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

                drag.update();

                // Save the current position
                drag.lastX = position.x;
                drag.lastY = position.y;

                $(drag.element).trigger('dragmove', {pos: drag.pos, delta: delta});
            }
        });

        $('html').on('mouseup touchend touchcancel', function(event)
        {
            if(drag.active)
            {
                // Find the current position
                var position = drag.position(event);

                // Touch events always return the original target, so we have to calculate where you moved to
                if(event.type.indexOf('touch') > -1)
                {
                    var target = document.elementFromPoint(position.x, position.y);
                }
                else
                {
                    var target = event.target;
                }

                // Check if the target or current element belong to a specific group
                var group = false;

                if($(target).data('group') || $(drag.element).data('group'))
                {
                    if($(target).data('group') == $(drag.element).data('group'))
                    {
                        group = 'match';
                    }
                }
                // If neither the target nor the current element belongs to a group
                else
                {
                    group = 'neither';
                }

                // If we dropped into a droppable element
                if($(target).hasClass('droppable') && group)
                {
                    // If the target is somewhere new
                    if(drag.element.parentNode != target)
                    {
                        var from = drag.element.parentNode;

                        // Move the dragon into the droppable target
                        target.appendChild(drag.element); 

                        // Recenter based on the current pointer position
                        var size = $(drag.element).size('outer');

                        drag.pos.x = position.x - size.width / 2;
                        drag.pos.y = position.y - size.height / 2;

                        drag.update();
                        $(drag.element).trigger('drop', {from: from, to: target, pos: drag.pos});
                    }
                }

                // Or if we're using static positioning
                else if(drag.options.position == 'static')
                {
                    var parent = drag.element.parentNode

                    if(group == 'match')
                    {
                        // If we're dropping on an element after this one
                        if($(event.target).index() > $(drag.element).index())
                        {
                            parent.insertBefore(drag.element, event.target.nextSibling);
                        }
                        // If we're dropping on an element before this one
                        else
                        {
                            parent.insertBefore(drag.element, event.target);
                        }
                    }
                    else if(!group)
                    {
                        var container = $(parent).position();
                        var height = $(drag.element).height('outer');

                        // Did we move above the container?
                        if(position.y + height < container.top)
                        {
                            // Move the element to the beginning of the container
                            parent.insertBefore(drag.element, parent.firstChild);
                        }

                        // Did we move below the container?
                        else if(position.y - height > container.bottom)
                        {
                            parent.appendChild(drag.element);
                        }
                    }
                }

                // Always reset the element position if we're using static positioning
                if(drag.options.position == 'static')
                {
                    $(drag.element).attr('style', '');
                    drag.pos.x = 0;
                    drag.pos.y = 0;
                }

                $(drag.element).removeClass('dragging');
                drag.active = false;

                $(drag.element).trigger('dragend', {pos: drag.pos});

                // Re-enable pointer-events
                $('.dragon').style({'pointer-events': 'auto'});
            }
        });

        // Event to allow 3rd party scripts to reset the dragon's position
        $(drag.element).on('dragreset', function(event)
        {
            drag.pos.x = 0;
            drag.pos.y = 0;
            drag.update();
        });
    }

    // Wetfish basic wrapper
    $.prototype.dragondrop = function(options)
    {
        // By default use these options
        var defaults =
        {
            // Ignore clicks on specific elements
            ignore: ['input', 'textarea', 'button', 'select', 'option'],
            position: 'absolute',
            units: 'px',
        };

        if(typeof options == "object")
        {
            // Merge user options into defaults
            for(var property in defaults)
            {
                if(options[property] === undefined)
                {
                    options[property] = defaults[property];
                }
            }
        }
        else
        {
            options = defaults;
        }
        
        this.forEach(this.elements, function(element)
        {
            new Dragon(element, options);
        });
    }
}));
