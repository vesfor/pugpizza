'use strict'

const express = require('express');
const bodyParse = require('body-parser');
const request = require('request');
const access_token = "EAAFhwpc3YyABAGvJDayRKL9p6OoOUCQDurIRtbMyDHYLctZC38EFPtwXxkcQn78quudG1QVBSklZBAjzBSifH6ZAahnoAnTxT0ESVMW2H7DbPJZA8H5Iu7IgLilnM9TfzFdRDgN3inOyFt58ZBABgLSwWMy0ZCZCXj7eRtSCdBGyGumhgqZAFjhqxMLFSxBm9R8ZD"

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParse.json());

app.get('/', function(req, response){
	response.send('Hola Mundo!');
})

app.get('/webhook', function(req, response){
	if (req.query['hub.verify_token'] === 'pugpizza_token') {
		response.send(req.query['hub.challenge']);
	} else {
		response.send('Pug Pizza no tienes permisos.')
	}
});

app.post('/webhook/', function(req, res){
	const webhook_event = req.body.entry[0];
	if (webhook_event.messaging) {
		webhook_event.messaging.forEach(event => {
			handleEvent(event.sender.id, event);
		});
	}
	res.sendStatus(200);
});

function handleEvent(senderId, event){
	if (event.message) {
		handleMessage(senderId, event.message)
	} else if (event.postback) {
		handlePostback(senderId, event.postback.payload)
	}
}

function handleMessage(senderId, event){
	if (event.text) {
		defaultMessage(senderId);
	} else if (event.attachments) {
		handleAttachments(senderId, event)
	}
}

function defaultMessage(senderId){
	const messageData = {
		"recipient": {
			"id": senderId
		},
		"message": {
			"text": "Hola soy un bot de messanger y te invito a utilizar nuestro menu",
			"quick_replies": [
				{
					"content_type": "text",
					"title": "¿Quieres una Pizza?",
					"payload": "PIZZAS_PAYLOAD"
				},
				{
					"content_type": "text",
					"title": "Acerca de",
					"payload": "ABOUT_PAYLOAD"
				}
			]
		}
	}
	senderActions(senderId);
	callSendApi(messageData);
}

function handlePostback(senderId, payload){
	console.log(payload)
	switch (payload){
		case "GET_STARTED_PUGPIZZA":
			console.log(payload);
			senderActions(senderId);
			defaultMessage(senderId);
		break;
		case "PIZZAS_PAYLOAD":
			senderActions(senderId);
			showPizzas(senderId);
		break;
        case "PEPPERONI_PAYLOAD":
        	senderActions(senderId);
            sizePizza(senderId);
        break;
        case "PERSONAL_SIZE_PAYLOAD":
        	senderActions(senderId);
        	getLocation(senderId);
        break;
        case "CONTACT_PAYLOAD":
        	senderActions(senderId);
        	contactSupport(senderId);
        break;
        case "SUCURSALES_PAYLOAD":
        	senderActions(senderId);
        	showLocations(senderId);
        break;
        case "ABOUT_PAYLOAD":
        	senderActions(senderId);
        	messageImage(senderId);
        break;
        default:
        	defaultMessage(senderId);
        break;
	}
}

function senderActions(senderId) {
	const messageData = {
		"recipient": {
			"id": senderId
		},
		"sender_action": "typing_on"
	}
	callSendApi(messageData);
}

function handleAttachments(senderId, event){
	let attachment_type = event.attachments[0].type;
	switch (attachment_type){
		case "image":
			console.log(attachment_type);
		break;
		case "video":
			console.log(attachment_type);
		break;
		case "audio":
			console.log(attachment_type);
		break;
		case "file":
			console.log(attachment_type);
		break;
        case "location":
        	receipt(senderId);
          //  console.log(JSON.stringify(event))
        //break;
        default:
            console.log(attachment_type);
        break;
	}
}

function callSendApi(response) {
	request({
		"uri": "https://graph.facebook.com/me/messages/",
		"qs": {
			"access_token": access_token
		},
		"method": "POST",
		"json": response
	},
	function (err) {
		if(err) {
			console.log('Ha ocurrido un error')
		} else {
			console.log('Mensaje enviado')
		}
	   }
	)
}

function showPizzas(senderId) {
	const messageData = {
		"recipient": {
			"id": senderId
		},
		"message": {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"elements": [
						{
							"title": "Peperoni",
							"subtitle": "Con todo el sabor del peperoni",
							"image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
							"buttons": [
								{
									"type": "postback",
									"title": "Elegir Peperoni",
									"payload": "PEPPERONI_PAYLOAD",
								}
							]
						},
						{
							"title": "Pollo BBQ",
							"subtitle": "Con todo el sabor del BBQ",
							"image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
							"buttons": [
								{
									"type": "postback",
									"title": "Elegir Pollo BBQ",
									"payload": "BBQ_PAYLOAD",
								}
							]
						}
					]
				}
			}
		}
	}
	callSendApi(messageData)
}

function messageImage(senderId) {
	const messageData = {
		"recipient": {
			"id": senderId
		},
		"message": {
			"attachment": {
				"type": "image",
				"payload": {
					"url": "https://media.giphy.com/media/1dOIvm5ynwYolB2Xlh/giphy.gif"
				}
			}
		}
	}
	callSendApi(messageData);
}

function contactSupport(senderId) {
	const messageData = {
		"recipient": {
			"id": senderId
		},
		"message": {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "button",
					"text": "Hola este es el canal de soporte, quieres llamarnos?",
					"buttons": [
						{
							"type": "phone_number",
							"title": "Llamar a un asesor",
							"payload": "+571231231231"
						}
					]
				}
			}
		}
	}
	callSendApi(messageData);
}

function showLocations(senderId) {
	const messageData = {
		"recipient": {
			"id": senderId
		},
		"message": {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "list",
					"top_element_style": "large",
					"elements": [
						{
							"title": "Sucursal Colombia",
							"image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
							"subtitle": "direccion Av 27 #1",
							"buttons": [
								{
									"title": "Ver en el mapa",
									"type": "web_url",
									"url": "https://goo.gl/maps/GCCpWmZep1t",
									"webview_height_ratio": "full"
								}
							]
						},
						{
							"title": "Sucursal Mexico",
							"image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
							"subtitle": "direccion bonita #555",
							"buttons": [
								{
									"title": "Ver en el mapa",
									"type": "web_url",
									"url": "https://goo.gl/maps/GCCpWmZep1t",
									"webview_height_ratio": "tall"
								}
							]
						}
					]
				}
			}
		}
	}
	callSendApi(messageData);
}

function receipt(senderId) {
	const messageData = {
		"recipient": {
			"id": senderId
		},
		"message": {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "receipt",
					"recipient_name": "Vespaciano Forero",
					"order_number": "123123",
					"currency": "COP",
					"payment_method": "Efectivo",
					"order_url": "https://platzi.com/order/123",
					"timestamp": "123123123",
					"address": {
						"street_1": "Platzi HQ",
						"street_2": "---",
						"city": "Bogota",
						"postal_code": "543135",
						"state": "Bogota",
						"country": "Colombia"
					},
					"summary": {
						"subtotal": 12.00,
						"shipping_cost": 2.00,
						"total_tax": 1.00,
						"total_cost": 15.00
					},
					"adjustments": [
						{
							"name": "Descuento frecuente",
							"amount": 1.00
						}
					],
					"elements": [
						{
							"title": "Pizza Pepperoni",
							"subtitle": "La mejor pizza de Pepperoni",
							"quantity": 1,
							"price": 10,
							"currency": "COP",
							"image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
						},
						{
							"title": "Bebida",
							"subtitle": "Jugo de Borojo",
							"quantity": 1,
							"price": 2,
							"currency": "COP",
							"image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
						}
					]
				}
			}
		}
	}
	callSendApi(messageData);
}

function sizePizza(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            attachment: {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "large",
                    "elements": [
                        {
                            "title": "Individual",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Porcion individual de pizza",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Elegir Individual",
                                    "payload": "PERSONAL_SIZE_PAYLOAD",
                                }
                            ]
                        },
                        {
                            "title": "Mediana",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Porcion Mediana de pizza",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Elegir Mediana",
                                    "payload": "MEDIUM_SIZE_PAYLOAD",
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}

function getLocation(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": "Ahora puedes proporcionarnos tu ubicación",
            "quick_replies": [
                {
                    "content_type": "location"
                }
            ]
        }
    }
    callSendApi(messageData);
}

app.listen(app.get('port'), function(){
	console.log('Nuestro servidor esta funcionando en el puerto:', app.get('port'));
});