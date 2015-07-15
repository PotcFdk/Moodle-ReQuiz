// ==UserScript==
// @author      PotcFdk
// @name        Moodle ReQuiz
// @namespace   https://github.com/PotcFdk/Moodle-ReQuiz
// @description Allows you to re-do Moodle quizzes by hiding your answers.
// @include     http://*/mod/quiz/review.php?attempt=*
// @include     https://*/mod/quiz/review.php?attempt=*
// @version     0.0.1
// @grant       none
// @downloadURL https://raw.githubusercontent.com/PotcFdk/Moodle-ReQuiz/master/Moodle-ReQuiz.user.js
// @updateURL   https://raw.githubusercontent.com/PotcFdk/Moodle-ReQuiz/master/Moodle-ReQuiz.meta.js
// ==/UserScript==

/*
	Moodle ReQuiz - Copyright (c) PotcFdk, 2015

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

if (!M || !M.cfg || !M.yui) throw new Error ("Huh, this doesn't seem to be moodle.");

function getQuestionDiv (id)
{
	return document.getElementById ('q' + id);
}

function makeInvisible (objs)
{
    for (var i = 0; i < objs.length; i++)
        objs [i].style.display = 'none';
}

function unlockInputs (inputs)
{
    for (var i = 0; i < inputs.length; i++)
    {
        inputs [i].removeAttribute ('disabled');
        inputs [i].removeAttribute ('checked');
        inputs [i].removeAttribute ('readonly');
        inputs [i].removeAttribute ('value');
    }
}

function resetCorrectnessClass (objs)
{
    for (var i = 0; i < objs.length; i++)
    {
        objs [i].className = objs [i].className.replace(/(?:^|\s)(in|partially)?correct(?!\S)/g , '');
    }
}

function resetSelects (selects)
{
    for (var i = 0; i < selects.length; i++)
    {
        var select = selects [i];
        select.removeAttribute ('disabled');
        var options = select.getElementsByTagName ('option');
        for (var j = 0; j < options.length; j++)
        {
            var option = options [j];
            if (option)
            {
                if (j == 0)
                    option.setAttribute ('selected', 'selected');
                else
                    option.removeAttribute ('selected');
            }
        }
    }
}

function clearTable (obj)
{
    var tds = obj.getElementsByTagName ('td');
    resetCorrectnessClass (tds);
    
    for (var tds_i = 0; tds_i < tds.length; tds_i++)
    {
        var td = tds [tds_i];

        unlockInputs (td.getElementsByTagName ('input'));
        resetCorrectnessClass (td.getElementsByTagName ('input'));
        resetSelects (td.getElementsByTagName ('select'));
        resetCorrectnessClass (td.getElementsByTagName ('select'));
        makeInvisible (td.getElementsByClassName('questioncorrectnessicon'));
    }
}

///

for (var q = 1; ; q++)
{
	var q_div = getQuestionDiv (q);
	if (q_div)
	{
		console.log (q_div);
		
		var obj_answers = q_div.getElementsByClassName ('answer');
        console.log(obj_answers);
        for (var obj_answers_i = 0; obj_answers_i < obj_answers.length; obj_answers_i++)
        {
            var obj_answer = obj_answers [obj_answers_i]

            if (!obj_answer || !obj_answer.tagName) continue;
            console.log ('Answer object is ' + obj_answer.tagName, obj_answer);

            if (obj_answer.tagName.toLowerCase () == 'span') // single answer
            {
                var input_answer = obj_answer.getElementsByTagName ('input');
                if (!input_answer || !input_answer[0]) continue;
                unlockInputs (input_answer);
                input_answer [0].className = '';

                var img_answer = obj_answer.getElementsByTagName ('img');
                if (!img_answer || !img_answer[0]) continue;
                img_answer = img_answer[0];
                img_answer.style.display = 'none';
            }
            else if (obj_answer.tagName.toLowerCase () == 'div') // multiple answers 1
            {
                var a_divs = obj_answer.getElementsByTagName ('div');
                resetCorrectnessClass (a_divs);

                for (var i = 0; i < a_divs.length; i++)
                {
                    var a_div = a_divs [i];

                    makeInvisible (a_div.getElementsByClassName('questioncorrectnessicon'));
                    unlockInputs (a_div.getElementsByTagName ('input'));
                    resetSelects (a_div.getElementsByTagName ('select'));

                    // just in case
                    clearTable (a_div);
                }
            }
            else if (obj_answer.tagName.toLowerCase () == 'table') // multiple answers 2
            {
                clearTable (obj_answer);
            }
        }
        
        // check if we possibly missed something
        if (q_div.getElementsByTagName ('select').length + q_div.getElementsByTagName ('input').length > 0)
        {
            console.log ('trying generic handler for ', q_div);
            unlockInputs (q_div.getElementsByTagName ('input'));
            resetCorrectnessClass (q_div.getElementsByTagName ('input'));
            resetSelects (q_div.getElementsByTagName ('select'));
            resetCorrectnessClass (q_div.getElementsByTagName ('select'));
            makeInvisible (q_div.getElementsByClassName('questioncorrectnessicon'));
            
            // just in case
            clearTable (q_div);
        }
	}
	else
		break;
}