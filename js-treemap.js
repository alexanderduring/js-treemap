
function Treemap(context)
{
    var overallSize = {width:0, height:0}
    var currentOffset = {x:0, y:0};
    var currentSize = {width:0, height:0, area:0}
    var remainingTilesArea = [];
    var rectangles = [];
    var colors = [];



    function worstRatio(areas, length)
    {
        var worstRatio;

        if (areas.length == 0) {
            worstRatio = 999999;
        } else {
            var areaMin = Math.min.apply(null, areas);
            var areaMax = Math.max.apply(null, areas);
            var areaSum = listSum(areas);
            
            var ratioOne = (length*length*areaMax) / (areaSum*areaSum);
            var ratioTwo = (areaSum*areaSum) / (length*length*areaMin);
            
            worstRatio = Math.max.apply(null, [ratioOne, ratioTwo]);
        }

        return worstRatio;
    }



    function squarify(children, row)
    {
        if (children.length > 0) {
            var length = lengthOfShortestSide();
            var head = children.slice(0, 1);
            var tail = children.slice(1);
            var rowWithChild = row.concat(head);

            if (worstRatio(row, length) >= worstRatio(rowWithChild, length)) {
                squarify(tail, rowWithChild);
            } else {
                layoutRow(row);
                squarify(children, []);
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
        var tempOffset;

        if (shortestSide() == 'height') {

            // Calculate row width
            var rowArea = sumRow(row);
            var rowAreaPercentage = rowArea / remainingTilesArea;
            var layoutWidth = Math.round(currentSize.width * rowAreaPercentage);
            var tempHeight = lengthOfShortestSide();
            tempOffset = currentOffset.y;

            while (row.length > 0) {

                // Calculate element
                var elementArea = row[0];
                var elementAreaPercentage = elementArea / sumRow(row);
                var elementHeight = Math.round(tempHeight * elementAreaPercentage);
                var x1 = currentOffset.x;
                var y1 = tempOffset;
                var x2 = x1 + layoutWidth - 1;
                var y2 = y1 + elementHeight - 1;
                rectangles[rectangles.length] = {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2};

                // Prepare next iteration
                tempHeight = tempHeight - elementHeight;
                tempOffset = tempOffset + elementHeight;
                row.shift();
            }

            currentOffset.x = currentOffset.x + layoutWidth;
            currentSize.width = currentSize.width - layoutWidth;
            currentSize.area = currentSize.width * currentSize.height;
            remainingTilesArea = remainingTilesArea - rowArea;
            console.log('Row area:'+rowArea+', remaining area:'+currentSize.area);

        } else {

            // Calculate row width
            var rowArea = sumRow(row);
            var rowAreaPercentage = rowArea / remainingTilesArea;
            var layoutHeight = Math.round(currentSize.height * rowAreaPercentage);
            var tempWidth = lengthOfShortestSide();
            tempOffset = currentOffset.x;

            while (row.length > 0) {

                // Calculate element
                var elementArea = row[0];
                var elementAreaPercentage = elementArea / sumRow(row);
                var elementWidth = Math.round(tempWidth * elementAreaPercentage);
                var x1 = tempOffset;
                var y1 = currentOffset.y;
                var x2 = x1 + elementWidth - 1;
                var y2 = y1 + layoutHeight - 1;
                rectangles[rectangles.length] = {x1: x1, y1: y1, x2: x2, y2: y2};

                // Prepare next iteration
                tempWidth = tempWidth - elementWidth;
                tempOffset = tempOffset + elementWidth;
                row.shift();
            }

            currentOffset.y = currentOffset.y + layoutHeight;
            currentSize.height = currentSize.height - layoutHeight;
            currentSize.area = currentSize.width * currentSize.height;
            remainingTilesArea = remainingTilesArea - rowArea;
            console.log('Row area:'+rowArea+', remaining area:'+currentSize.area);
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



    /**
     * Takes a list of values and puts these value in relation to the total sum of the values.
     * Then it returns a new list with values that have the same relation to the total area of the map
     */
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
        var width = rectangle.x2-rectangle.x1+1;
        var height = rectangle.y2-rectangle.y1+1;
        var hue = colors.shift();

        // Draw rectangle
        context.beginPath();
        context.rect(rectangle.x1, rectangle.y1, width, height);
        context.fillStyle = 'hsl('+hue+', 50%, 80%)';
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = 'white';
        context.stroke();

        // Draw text
        //context.font='10px Verdana';
        //context.fillStyle = '#000000';
        //context.fillText('x:'+(rectangle.x1)+',y:'+(rectangle.y1), rectangle.x1+3, rectangle.y1+15);
        //context.fillText('w:'+width+',h:'+height, rectangle.x1+3, rectangle.y1+30);

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




    this.draw = function(data)
    {
        var width = context.canvas.width;
        var height = context.canvas.height;

        rectangles = [];

        overallSize = {
            width: width,
            height: height
        };

        currentSize = {
            width: width,
            height: height,
            area: width * height
        };

        currentOffset = {
            x: 0,
            y: 0
        };

        // At the beginning both values are the same, but over time they will be different,
        // because we substract the real size of each row (integer) from the currentSize.area and
        // the calculated tile areas of each row (float) from the remainingTilesArea.
        remainingTilesArea = currentSize.area;

        sortDescending(data);
        createPalette(data.length);
        map(data);
        draw();
    }
};
