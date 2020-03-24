'use strict'

const bent = require('bent');
const cheerio = require('cheerio');
const constants = require('./constants')

module.exports.getNews = async () => {
	var get = bent('string', 200);
	return get(constants.COVID_NEWS_URI)
			.then(getMessage)
			.catch(tryNewsRequest);
}

const getMessage = (html) => 
{
    var message = '\u2757 \u2757 ÚLTIMA HORA \u2757 \u2757 \n\n';
	var {times, events} = getEventsFromHtml(html);

	for (var i = 0; i < constants.MAX_EVENTS; i++) {
		if (isHtmlEventsRight(events, i))
			message += '• ' + times[i] + ' - ' + events[i] + '\n\n';
	}
    message += 'Fuente de datos: <a href="' + constants.COVID_NEWS_URI + '">RTVE.</a>';
	return message;
}

const getEventsFromHtml = (html) => {
    var times = []
    var events = []

    var $ = cheerio.load(html);
    $('.eventos li.evento span.time').each((i, element) => {
        times.push($(element).text().trim());
    });
    $('.eventos li.evento .texto').each((i, element) => {
        var event = '';
        $(element).find('p').each((i, paragraph) => {
            event += $(paragraph).html() + '\n';
        });
        if (event != '')
            events.push(event);
    });
    return {times, events}
}

const isHtmlEventsRight = (events, index) => {
	if(events[index] != undefined)
	{
		//TODO: Rethink this method to get consistent information and dont lose parity time - news
		if(events[index].indexOf('<img') == -1)
			return true;
		else if(index < 10)
			isHtmlEventsRight(events, index + 1);
		else
			return false;
	}
	else
		return false;
}

const tryNewsRequest = (res) => {
	if(res.statusCode == 301)
	{
	    const get = bent('string', 200);
		console.log(res.headers.location);
		return get(res.headers.location)
			.then(getMessage)
			.catch(e => {
                console.error(e)
                return constants.ERROR_MESSAGE
            });
	}
	else
		return constants.ERROR_MESSAGE;
}
