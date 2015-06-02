(function($)
{
    var Dragon = function(element)
    {
        this.element = element;
        this.active = false;

        this.bind();
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

            // Save current position
            drag.lastX = event.clientX;
            drag.lastY = event.clientY;
        });

        $('html').on('mousemove', function(event)
        {
            if(drag.active)
            {
                event.preventDefault();

                // Find distance we've moved
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
