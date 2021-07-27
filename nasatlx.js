// Create a set of parallel arrays for each of the scales
var scale      = new Array();
var left       = new Array();
var right      = new Array();
var def        = new Array();
var NUM_SCALES = 6;

scale[0]  = "Mental Demand"; 
left[0]   = "Very Low";
right[0]  = "Very High";
def[0]    = "How mentally demanding was the task?";

scale[1]  = "Physical Demand"; 
left[1]   = "Very Low";
right[1]  = "Very High";
def[1]    = "How physically demanding was the task?";

scale[2]  = "Temporal Demand"; 
left[2]   = "Very Low";
right[2]  = "Very High";
def[2]    = "How hurried or rushed was the pace of the task?";

scale[3]  = "Performance"; 
left[3]   = "Perfect";
right[3]  = "Failure";
def[3]    = "How successful were you in accomplishing what you were asked to do?";

scale[4]  = "Effort"; 
left[4]   = "Very Low";
right[4]  = "Very High";
def[4]    = "How hard did you have to work to accomplish your level of performance?";

scale[5]  = "Frustration"; 
left[5]   = "Very Low";
right[5]  = "Very High";
def[5]    = "How insecure, discouraged, irritated, stressed and annoyed were you?";



// Variable where the results end up
var results_rating = new Array();

// They click on a scale entry
function scaleClick(index, val)
{
	results_rating[index] = val;

	// Turn background color to white for all cells
	for (i = 5; i <= 100; i += 5)
	{
		var top = "t_" + index + "_" + i;
		var bottom = "b_" + index + "_" + i;
		document.getElementById(top).bgColor='#FFFFFF';
		document.getElementById(bottom).bgColor='#FFFFFF';
	}

	var top = "t_" + index + "_" + val;
	var bottom = "b_" + index + "_" + val;
	document.getElementById(top).bgColor='#AAAAAA';
	document.getElementById(bottom).bgColor='#AAAAAA';
}

// Return the HTML that produces the table for a given scale
function getScaleHTML(index)
{
	var result = "";

	// Table that generates the scale
	result += '<table class="scale">';

	// Row 1, just the name of the scale
	result += '<tr><td colspan="20" class="heading">' + scale[index] + '</td></tr>';
	result += '<tr><td colspan="20" class="def">' + def[index] + '</td></tr>';
    // result += '<tr height = "5px"></tr>';

	// Row 2, the top half of the scale increments, 20 total columns
	result += '<tr>';
	var num = 1;
	for (var i = 5; i <= 100; i += 5)
	{
		result += '<td id="t_' + index + '_' + i + '"   class="top' + num + '" onMouseUp="scaleClick(' + index + ', ' + i + ');"></td>';
		num++;
		if (num > 2)
			num = 1;
	}
	result += '</tr>';

	// Row 3, bottom half of the scale increments
	result += '<tr>';
	for (var i = 5; i <= 100; i += 5)
	{
		result += '<td id="b_' + index + '_' + i + '"   class="bottom" onMouseUp="scaleClick(' + index + ', ' + i + ');"></td>';
	}
	result += '</tr>';

	// Row 4, left and right of range labels
	result += '<tr>';
	result += '<td colspan="10" class="left">' + left[index] + '</td><td colspan="10" class="right">' + right[index] + '</td>';

	return result;
}

function onLoad()
{
	// Get all the scales ready
	for (var i = 0; i < NUM_SCALES; i++)
	{
		document.getElementById("scale" + i).innerHTML = getScaleHTML(i);
	}
}



