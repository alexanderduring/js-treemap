
function Chart(context)
{
    var overallSize = {width:0, height:0}
    var currentOffset = {x:0, y:0};
    var currentSize = {width:0, height:0}
    var rectangles = [];
    var colors = [];



    function worstRatio(areas, width)
    {
        var worstRatio;

        if (areas.length == 0) {
            worstRatio = 999999;
        } else {
            var areaMin = Math.min.apply(null, areas);
            var areaMax = Math.max.apply(null, areas);
            var areaSum = listSum(areas);
            
            var ratioOne = (width*width*areaMax) / (areaSum*areaSum);
            var ratioTwo = (areaSum*areaSum) / (width*width*areaMin);
            
            worstRatio = Math.max.apply(null, [ratioOne, ratioTwo]);
        }

        return worstRatio;
    }



    function squarify(children, row, width)
    {
        if (children.length > 0) {
            var head = children.slice(0, 1);
            var tail = children.slice(1);
            var rowWithChild = row.concat(head);

            if (worstRatio(row, width) >= worstRatio(rowWithChild, width)) {
                squarify(tail, rowWithChild, width);
            } else {
                layoutRow(row);
                squarify(children, [], lengthOfShortestSide());
            }
        } else {
            layoutRow(row);
        }
    }



    function listSum(list)
    {
        if (list.length == 1) {
            sum = list[0];
        } else {
            sum = list.reduce(function(previous, current) {
                return previous+current;
            });
        }

        return sum;
    }



    function shortestSide()
    {
        var side;

        if (currentSize.width >= currentSize.height) {
            side = 'height';
        } else {
            side = 'width';
        }

        return side;
    }



    function lengthOfShortestSide()
    {
        var length;

        if (currentSize.width >= currentSize.height) {
            length = currentSize.height;
        } else {
            length = currentSize.width;
        }

        return length;
    }



    function layoutRow(row)
    {
        var sum = sumRow(row);
        var tempOffset;

        if (shortestSide() == 'height') {
            var layoutWidth = sum / lengthOfShortestSide();
            tempOffset = currentOffset.y;

            row.forEach(function(element) {
                elementHeight = element / layoutWidth;

                var x1 = currentOffset.x;
                var y1 = tempOffset;
                var x2 = currentOffset.x + layoutWidth;
                var y2 = tempOffset + elementHeight;

                rectangles[rectangles.length] = {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2};
                tempOffset = tempOffset + elementHeight;
            });

            currentOffset.x = currentOffset.x + layoutWidth;
            currentSize.width = currentSize.width - layoutWidth;

        } else {
            var layoutHeight = sum / lengthOfShortestSide();
            tempOffset = currentOffset.x;

            row.forEach(function(element) {
                elementWidth = element / layoutHeight;

                var x1 = tempOffset;
                var y1 = currentOffset.y;
                var x2 = tempOffset + elementWidth;
                var y2 = currentOffset.y + layoutHeight;

                rectangles[rectangles.length] = {x1: x1, y1: y1, x2: x2, y2: y2};
                tempOffset = tempOffset + elementWidth;
            });

            currentOffset.y = currentOffset.y + layoutHeight;
            currentSize.height = currentSize.height - layoutHeight;
        }

    }



    function sumRow(row)
    {
        if (row.length == 0) {
            sum = 0;
        } else {
            if (row.length == 1) {
                sum = row[0];
            } else {
                sum = row.reduce(function(previous, current) {
                    return previous+current;
                });
            }
        }

        return sum;
    }




    function normalize(list)
    {
        var normalizedList = [];
        var overallArea = overallSize.width * overallSize.height;
        var sum = sumRow(list);

        list.forEach(function(element) {
            var normalizedElement = (element / sum) * overallArea;
            normalizedList.push(normalizedElement);
        });

        return normalizedList;
    }



    function map(list)
    {
        normalizedList = normalize(list);
        squarify(normalizedList, [], lengthOfShortestSide());
    }



    function draw()
    {
        drawRectangle();
    }



    function drawRectangle()
    {
        var rectangle = rectangles.shift();
        var width = rectangle.x2-rectangle.x1;
        var height = rectangle.y2-rectangle.y1;
        var hue = colors.shift();

        context.beginPath();
        context.rect(rectangle.x1, rectangle.y1, width, height);
        context.fillStyle = 'hsl('+hue+', 50%, 80%)';
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = 'white';
        context.stroke();

        if (rectangles.length > 0) {
            setTimeout(function() {drawRectangle()}, 30);
        }
    }



    /**
     * Creates n aequidistant hue values and puts them in a randomly ordered list.
     */
    function createPalette(numberOfEntries)
    {
        var stepSize = 360 / numberOfEntries;

        colors = [];
        for (i = 1; i <= numberOfEntries; i++) {
            var hue = Math.floor(i * stepSize);
            var position = Math.floor(Math.random() * (colors.length + 0.99));
            colors.splice(position, 0, hue);
        }
    }



    function sortDescending(data)
    {
        data.sort(function(a, b) {
            return b - a;
        });
        
        return data;
    }




    this.treemap = function(data)
    {
        rectangles = [];

        overallSize = {
            width: context.canvas.width-2,
            height: context.canvas.height-2
        };

        currentSize = {
            width: context.canvas.width-2,
            height: context.canvas.height-2
        };

        currentOffset = {
            x: 1,
            y: 1
        };

        sortDescending(data);
        createPalette(data.length);
        map(data);
        draw();
    }
};
