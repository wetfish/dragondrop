(function($)
{
    var Dragon = function(element)
    {
        this.element = element;
        this.active = false;

        this.init();
        this.bind();
    }

    // Initialize element before being dragged
    Dragon.prototype.init = function()
    {
        $(this.element).style({position: 'absolute'});

        // Save the current element position
        this.pos =
        {
            x: parseInt($(this.element).style('top')),
            y: parseInt($(this.element).style('left'))
        };
    }

    // Bind mouse events
    Dragon.prototype.bind = function()
    {
        // Preserve scope inside event handlers
        var drag = this;

        $(drag.element).on('mousedown', function(event)
        {
            event.preventDefault();
            
            $(drag.element).addClass('active');
            drag.active = true;

            // Save current mouse position
            drag.lastX = event.clientX;
            drag.lastY = event.clientY;
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
                $(drag.element).style({transform: 'translate('+drag.pos.x+'px, '+drag.pos.y+'px)'});

                // Save current mouse position
                drag.lastX = event.clientX;
                drag.lastY = event.clientY;
            }
        });

        $('html').on('mouseup', function()
        {
            $(drag.element).removeClass('active');
            drag.active = false;
        });
    }

    // Wetfish basic wrapper
    $.prototype.dragondrop = function()
    {
        this.forEach(this.elements, function(index, element)
        {
            new Dragon(element);
        });
    }
}(basic));
